import * as FocusActions from "../actions/focus.js";
import ActiveFrameStore from "../stores/activeFrame.js";
import assign from "lodash/assign";
import pick from "lodash/pick";
import { EventEmitter } from "events";
import * as PIXI from "pixi.js";
import Hammer from "hammerjs";
import GestureEvent from "./gestureEvent.js";
import PointerEvent from "./pointerEvent.js";
import PixiEventInput from "./pixiEventInput.js";
import { format } from "util";
import { ensureWithin } from "./utils.js";

const MOUSE_POINTER_ID = 0;
const COLOR_TYPES = {
	COLOR : 1,
	GRADIENT : 2,
	PATTERN : 4
};
const MAX_TEXT_LINE_SPACING = 1.25;

// ////////////////////////////
// Static Helper Functions  //
// ////////////////////////////

function zeroPaddedHex(intVal) {
	return ("0" + intVal.toString(16)).slice(-2);
}

export function createHexColors(vals, prefix = "0x") {
	const newVals = [];
	newVals[0] = ~~(vals[0] * 255);
	newVals[1] = ~~(vals[1] * 255);
	newVals[2] = ~~(vals[2] * 255);
	return prefix + zeroPaddedHex(newVals[0]) + zeroPaddedHex(newVals[1]) + zeroPaddedHex(newVals[2]);
}

function createRGBAColors(vals) {
	const newVals = [];
	newVals[0] = ~~(vals[0] * 255);
	newVals[1] = ~~(vals[1] * 255);
	newVals[2] = ~~(vals[2] * 255);
	newVals[3] = vals[3]; // You don't scale alpha this way
	return format("rgba(%s)", newVals.join(","));
}

function getPointerId(e) {
	if (e.data && e.data.identifier) return e.data.identifier;
	if (e.identifier) return e.identifier;
	return MOUSE_POINTER_ID;
}

function getPolygonBounds(poly) {
	let xcoords = poly.points.filter( (_, idx) => { return idx % 2 === 0; } );
	let ycoords = poly.points.filter( (_, idx) => { return idx % 2 === 1; } );
	let minX = Math.min.apply(null, xcoords);
	let minY = Math.min.apply(null, ycoords);
	let maxX = Math.max.apply(null, xcoords);
	let maxY = Math.max.apply(null, ycoords);
	return [ minX, minY, maxX - minX, maxY - minY ];
}

// ///////////////////
// Custom Fillings  //
// ///////////////////

class LinearGradient {

	constructor(colorArray, colorPt1, colorPt2, proportion = 0, angle) {

		this._canvas = document.createElement("canvas");
		this._canvas.width = LinearGradient.WIDTH;
		this._canvas.height = LinearGradient.HEIGHT;
		this._ctx = this._canvas.getContext("2d");

		this._gradient = this._ctx.createLinearGradient(
			ensureWithin(colorPt1[0], 0, 1) * LinearGradient.WIDTH,
			ensureWithin(colorPt1[1], 0, 1) * LinearGradient.HEIGHT,
			ensureWithin(colorPt2[0], 0, 1) * LinearGradient.WIDTH,
			ensureWithin(colorPt2[1], 0, 1) * LinearGradient.HEIGHT
		);

		if (colorArray.length === 1) colorArray = [colorArray[0], colorArray[0]];
		for (let i = 0; i < colorArray.length - 1; i++) {
			const color1 = colorArray[i];
			const color2 = colorArray[i + 1];
			const stopStart = (i / (colorArray.length - 1));
			const stopMiddle = ((i + proportion) / (colorArray.length - 1));
			const stopEnd = ((i + 1) / (colorArray.length - 1));
			const blendColor = [
				(color1[0] + color2[0]) / 2,
				(color1[1] + color2[1]) / 2,
				(color1[2] + color2[2]) / 2,
				(color1[3] + color2[3]) / 2
			];

			this._gradient.addColorStop(stopStart, createRGBAColors(color1));
			this._gradient.addColorStop(stopMiddle, createRGBAColors(blendColor));
			this._gradient.addColorStop(stopEnd, createRGBAColors(color2));
		}

		this._ctx.fillStyle = this._gradient;
		this._ctx.fillRect(0, 0, LinearGradient.WIDTH, LinearGradient.HEIGHT);

		this._texture = PIXI.Texture.fromCanvas(this._canvas);
	}

	get texture() {
		return this._texture;
	}
}

LinearGradient.WIDTH = 100;
LinearGradient.HEIGHT = 100;

// //////////////////
// Custom Shapes  //
// //////////////////

class CustomShape {

	contains() {
		throw new Error("Missing contains implementation");
	}

	draw() {
		throw new Error("Missing draw implementation");
	}
}

class Arc extends CustomShape {

	constructor(cx, cy, radius, start, end) {
		super();
		this._cx = cx;
		this._cy = cy;
		this._radius = radius;
		this._startAngle = start;
		this._endAngle = end;
	}

	contains() {
		// TODO: should arcs actually conain something?!
		return false;
	}

	draw(graphics) {
		/* TEMPORARY WORKAROUND TO MAKE SURE
		 *EVERYTIME AN ARC IS DRAWN THE CURRENT
		 *PIXI DRAWING PATH IS CLEAR
		 */
		graphics.currentPath = null;

		// Get around a bug (I'm pretty sure) in PIXI v4
		const startX = this._cx + Math.cos(this._startAngle) * this._radius;
		const startY = this._cy + Math.sin(this._startAngle) * this._radius;
		graphics.moveTo(startX, startY);

		graphics.arc(
			this._cx,
			this._cy,
			this._radius,
			this._startAngle,
			this._endAngle,
			this._endAngle - this._startAngle <= 180 ? false : true
		);
	}
}

class Line extends CustomShape {

	constructor(startX, startY) {
		super();
		this._startX = startX;
		this._startY = startY;
		this._points = [];
	}

	contains(x, y) {
		// TODO: can lines actually conain something?!
		return false;
	}

	lineTo(x, y) {
		this._points.push({ x, y });
	}

	draw(graphics) {
		graphics.moveTo(this._startX, this._startY);
		this._points.forEach((p) => {
			graphics.lineTo(p.x, p.y);
		});
	}
}

class Pie extends CustomShape {

	constructor(cx, cy, radius, start, end) {
		super();
		this._cx = cx;
		this._cy = cy;
		this._radius = radius;
		this._startAngle = start;
		this._endAngle = end;
	}

	contains() {
		// TODO: should pies actually conain something?!
		return false;
	}

	draw(graphics) {
		graphics.moveTo(this._cx, this._cy);

		graphics.arc(
			this._cx,
			this._cy,
			this._radius,
			this._startAngle,
			this._endAngle,
			this._endAngle - this._startAngle <= 180 ? false : true
		);
	}
}

class GestureRecognition extends EventEmitter {

	constructor() {
		super();

		this._gestures = true;
		this._gestureRecognizerCallbacks = {};
		this._currentPointers = [];

		// This will call addEventListener and removeEventListener, so we define our own implementation
		this._gm = new Hammer.Manager(this, {
			inputClass : PixiEventInput
		});
		this._gm.isTouchLocked = function(touch) {
			return this._currentPointers.indexOf(getPointerId(touch)) > -1;
		}.bind(this);

		this._gm.on("pinch", this._onPinch.bind(this));
		this._gm.on("rotate", this._onRotate.bind(this));
		this._gm.on("swipe", this._onSwipe.bind(this));
		this._gm.on("tap", this._onTap.bind(this));
	}

	_onPinch(event) {
		this.emit("gesture_event", GestureEvent.TYPES.PINCH, event);
	}

	_onRotate(event) {
		this.emit("gesture_event", GestureEvent.TYPES.ROTATE, event);
	}

	_onSwipe(event) {
		this.emit("gesture_event", GestureEvent.TYPES.SWIPE, event);
	}

	_onTap(event) {
		this.emit("gesture_event", GestureEvent.TYPES.TAP, event);
	}

	// Used for Gesture Manager
	addEventListener(name, callback) {
		if (this._gestureRecognizerCallbacks) {
			this._gestureRecognizerCallbacks[name] = callback;
		}
	}

	destroy() {
		this._gm.stop(true);
		this._gm.destroy();
		this.removeAllListeners();
	}

	lockPointer(id) {
		this._currentPointers.push(id);
	}

	releasePointer(id) {
		this._currentPointers.splice(this._currentPointers.indexOf(id), 1);
	}

	removeEventListener(name, callback) {
		if (this._gestureRecognizerCallbacks) {
			delete this._gestureRecognizerCallbacks[name];
		}
	}

	setGestureOptions(gesture, options) {

		if (!this._gm.get(gesture)) {
			let gr;
			if (gesture === "pinch") {
				gr = new Hammer.Pinch();
				const rotateRecognizer = this._gm.get("rotate");
				if (rotateRecognizer) {
					gr.recognizeWith(rotateRecognizer);
				}
			} else if (gesture === "rotate") {
				gr = new Hammer.Rotate();
				const pinchRecognizer = this._gm.get("pinch");
				if (pinchRecognizer) {
					gr.recognizeWith(pinchRecognizer);
				}
			} else if (gesture === "swipe") {
				gr = new Hammer.Swipe();
			} else if (gesture === "tap") {
				gr = new Hammer.Tap();
			}


			if (gr) {
				this._gm.add(gr);
			}
		}

		if (this._gm.get(gesture)) {
			this._gm.get(gesture).set(options);
		}
	}

	handleEvent(event) {
		event.lockedPointers = this._currentPointers;
		if (this._gestureRecognizerCallbacks[event.type]) {
			this._gestureRecognizerCallbacks[event.type](event);
		}
	}
}


class PixiDraw extends EventEmitter {

	constructor(id, zindex, options = {} ) {
		super();

		options = assign({
			mask : true,
			interactive : true,
			gestures : false
		}, options);

		this._color = {
			type : COLOR_TYPES.COLOR,
			color : 0xFFFFFF
		};

		this._alpha = 0;
		this._lineWidth = 0;
		this._lineCap = 0;
		this._fontName = "Arial";
		this._fontWeight = "normal";
		this._fontStyle = "normal";
		this._fontSize = "12";
		this._fontJustification = "left";

		this._id = id;
		this._currentPointers = {};

		this._display = new PIXI.Container();
		this.setZIndex(zindex);

		// Masks, gradients and graphics that are not currently being drawn to
		this._inactiveLayers = [];
		this._useMask = options.mask;
		this._pushNewGraphics(options.mask);
		if (this._useMask) {
			this._mask = new PIXI.Graphics();
			this._display.mask = this._mask;
			this._display.addChild(this._mask);
		}

		// Enable/Disable Interactivity
		this.setInteractive(options.interactive);

		// Add a gesture recognizer to this object
		if (options.interactive && options.gestures) {
			this._gestures = true;
			this._gestureRecognizer = new GestureRecognition();
			this._gestureRecognizer.on("gesture_event", this._onGestureEvent.bind(this));
		} else {
			this._gestures = false;
		}

		// Buffered drawing procedures in order to support
		// post-shape stroke and fill calls
		this._currentShape = null;
		this._currentShapeId = 0;

		// user for retrieving data attached to certain shapes
		this._dataShapes = {};

		// enable pointer events
		this._display.on("pointerdown", this._onPointerDownEvent.bind(this));

		this._unsubscribes = [];
		this._unsubscribes.push(ActiveFrameStore.on("update_scale", this._updateResolution.bind(this)));
	}

	get gesturesEnabled() {
		return this._gestures;
	}

	set currentShape(shape) {
		this._currentShape = shape;
		this._currentShape.id = ++this._currentShapeId;
	}

	get currentShape() {
		return this._currentShape;
	}

	_pushNewGraphics() {
		if (this._graphics) this._inactiveLayers.push(this._graphics);

		this._graphics = new PIXI.Graphics();
		this._display.addChild(this._graphics);
	}

	// ////////////////////
	// Pointer Helpers  //
	// ////////////////////

	_lockPointer(id) {
		this._currentPointers[id] = {};
		if (this._gestureRecognizer) {
			this._gestureRecognizer.lockPointer(id);
		}
	}

	_hasLockedPointers() {
		return !!Object.keys(this._currentPointers).length;
	}

	_isPointerTarget(id) {
		return !!this._currentPointers[id];
	}

	_releasePointer(id) {
		delete this._currentPointers[id];
		if (this._gestureRecognizer) {
			this._gestureRecognizer.releasePointer(id);
		}
	}

	_updatePointerPosition(id, point) {
		this._currentPointers[id] = point;
	}

	_getPointerPosition(id) {
		return this._currentPointers[id] || null;
	}

	// /////////////////////
	// Shape Attributes  //
	// /////////////////////

	add_attribute(name, value) {
		if (!this.currentShape) throw new Error("Can't attach data without a shape.");

		const data = this._dataShapes[this._currentShape.id];
		if (!data) {
			this._dataShapes[this.currentShape.id] = {
				shape : this.currentShape,
				attributes : {
					[name] : value
				}
			};
		} else {
			this._dataShapes[this.currentShape.id].attributes[name] = value;
		}
	}

	_getAttributesForPoint(point) {
		// Simple iterative hit test
		// Note that we are iterating backwards in order to pay attention to z-indexes
		// TODO: any faster way to do this?!
		const keys = Object.keys(this._dataShapes);
		for (let i = keys.length - 1; i >= 0; i--) {
			const key = keys[i];
			if (this._dataShapes[key].shape.contains(point.x, point.y)) return this._dataShapes[key].attributes;
		}
		return null;
	}

	// ///////////////////
	// Pointer Events  //
	// ///////////////////

	setInteractive(val) {

		this._display.interactive = val;
		this._interactive = val;

		if (val) {
			this._display.calculateBounds();
			const bounds = this._display.getLocalBounds();
			this._setHitArea([0, 0, bounds.width, bounds.height]);
		} else {
			this._setHitArea([0, 0, 0, 0]);
		}
	}

	newPointerEventFromNativeEvent(e, type, includeDeltas) {
		const pointerId = getPointerId(e);
		const inObjPoint = this._display.worldTransform.applyInverse(e.data.global);

		// SJT - Asking for this._display.width directly is actually kind of slow, since it applies all kinds
		// of transforms to get the most accurate answer. Since we've already calculated the hit area, it's
		// much faster simply to use the width and height of that in place of _display.width and _display.height
		const eventAttrs = {
			objectId : this._id,
			screenFrameX : e.data.global.x,
			screenFrameY : e.data.global.y,
			targetX : inObjPoint.x,
			targetY : inObjPoint.y,
			normTargetX : inObjPoint.x / this._display.hitArea.width,
			normTargetY : inObjPoint.y / this._display.hitArea.height,
			type : type,
			id : pointerId,
			attributes : this._getAttributesForPoint(inObjPoint)
		};

		if (includeDeltas) {
			const lastPoint = this._getPointerPosition(pointerId);
			const deltaX = inObjPoint.x - lastPoint.x;
			const deltaY = inObjPoint.y - lastPoint.y;
			eventAttrs.screenDeltaX = deltaX;
			eventAttrs.screenDeltaY = deltaY;
		}
		return new PointerEvent(eventAttrs);
	}

	// The object will try to get focus after a touch down event. If a listener doesn't want the pixidraw
	// to receive focus, either because it's disabled or for some other reason, then it should call
	// rejectFocus sometime in response to pointerdown pointer_events
	rejectFocus() {
		this._canReceiveFocus = false;
	}

	_onPointerEndEvent(e) {
		const pointerId = getPointerId(e);
		const pointerEvent = this.newPointerEventFromNativeEvent(e, PointerEvent.TYPES.POINTER_UP, false);
		if (this._gestures) this._gestureRecognizer.handleEvent(e); // must call before releasing pointer
		this._releasePointer(pointerId);

		if (!this._hasLockedPointers()) {
			this._display.removeAllListeners("pointermove");
			this._display.removeAllListeners("pointerup");
			this._display.removeAllListeners("pointercancel");
			this._display.removeAllListeners("pointerupoutside");
		}

		this.emit("pointer_event", pointerEvent);
	}

	_onPointerMoveEvent(e) {
		const pointerId = getPointerId(e);

		// are we the target?
		if (!this._isPointerTarget(pointerId)) return;

		const pointerEvent = this.newPointerEventFromNativeEvent(e, PointerEvent.TYPES.POINTER_MOVE, true);
		this._updatePointerPosition(pointerId, new PIXI.Point(pointerEvent.targetX, pointerEvent.targetY));

		if (this._gestures) this._gestureRecognizer.handleEvent(e);
		this.emit("pointer_event", pointerEvent);
	}

	_onPointerDownEvent(e) {
		this._canReceiveFocus = true;

		// register follow up events
		if (!this._hasLockedPointers()) {
			this._display.on("pointermove", this._onPointerMoveEvent.bind(this));
			this._display.on("pointercancel", this._onPointerEndEvent.bind(this));
			this._display.on("pointerup", this._onPointerEndEvent.bind(this));
			this._display.on("pointerupoutside", this._onPointerEndEvent.bind(this));
		}

		const pointerId = getPointerId(e);
		this._lockPointer(pointerId);

		const pointerEvent = this.newPointerEventFromNativeEvent(e, PointerEvent.TYPES.POINTER_DOWN, false);
		this._updatePointerPosition(pointerId, new PIXI.Point(pointerEvent.targetX, pointerEvent.targetY));

		if (this._gestures) this._gestureRecognizer.handleEvent(e);

		// While responding to the pointer event, the object may call rejectFocus, which will
		// prevent it from receiving focus after the touch has been processed
		this.emit("pointer_event", pointerEvent);

		// After handling the pointer event, if the object still wants focus
		if (this._canReceiveFocus) FocusActions.focus(this._display);
	}

	// /////////////
	// Gestures   //
	// /////////////

	setGestureOptions(gesture, options) {
		this._gestureRecognizer.setGestureOptions(gesture, options);
	}

	_hammerDirectionToMiraDirection(direction) {
		const directionMap = {
			[Hammer.DIRECTION_RIGHT] : GestureEvent.DIRECTIONS.RIGHT,
			[Hammer.DIRECTION_LEFT] : GestureEvent.DIRECTIONS.LEFT,
			[Hammer.DIRECTION_UP] : GestureEvent.DIRECTIONS.UP,
			[Hammer.DIRECTION_DOWN] : GestureEvent.DIRECTIONS.DOWN
		};

		if (directionMap.hasOwnProperty(direction)) return directionMap[direction];
		return GestureEvent.DIRECTIONS.NONE;
	}

	_onGestureEvent(type, event) {

		const eventAttr = pick(event, [
			"deltaX",
			"deltaY",
			"deltaTime",

			"distance",

			"angle",

			"velocityX",
			"velocityY",
			"velocity",

			"direction",
			"offsetDirection",

			"scale",
			"rotation",

			"isFirst",
			"isFinal"
		]);

		const center = this._display.worldTransform.applyInverse(ActiveFrameStore.mapPositionToPoint(event.center.x, event.center.y));
		eventAttr.center = { x : center.x, y : center.y };
		eventAttr.id = "";

		eventAttr.pointers = [];
		event.pointers.forEach((pointer) => {
			const localPoint = this._display.worldTransform.applyInverse(ActiveFrameStore.mapPositionToPoint(pointer.pageX, pointer.pageY));
			const id = getPointerId(pointer);
			eventAttr.pointers.push({
				id : id,
				x : localPoint.x,
				y : localPoint.y
			});
			eventAttr.id += eventAttr.id.length ? "_" + id : id;
		});

		eventAttr.direction = this._hammerDirectionToMiraDirection(event.direction);

		const gesture = GestureEvent.createInstance(type, eventAttr);
		if (gesture) this.emit("gesture_event", gesture);
	}

	// //////////////
	// Utilities  //
	// //////////////

	clear() {
		this._dataShapes = {};
		this._inactiveLayers.forEach(layer => {
			layer.parent.removeChild(layer);
		});
		this._inactiveLayers = [];
		this._graphics.removeChildren();
		this._graphics.clear();
	}

	destroy() {
		this._display.parent.removeChild(this._display);
		this._display.removeAllListeners();
		this._display.destroy();

		if (this._gestures) {
			this._gestureRecognizer.destroy();
			this._gestureRecognizer = null;
		}

		this._display = null;
		this._graphics = null;
		this.removeAllListeners();
		this._unsubscribes.forEach((f) => {
			f();
		});
	}

	hide() {
		this._display.visible = false;
	}

	return_node() {
		return this._display;
	}

	_setHitArea(rect) {
		this._display.hitArea = new PIXI.Rectangle(rect[0], rect[1], rect[2], rect[3]);
	}

	setRect(rect) {

		this._setHitArea(this._interactive ? [0, 0, rect[2], rect[3]] : [0, 0, 0, 0]);

		if (this._mask) {
			this._mask.clear();

			this._mask.width = rect[2];
			this._mask.height = rect[3];
			this._mask.beginFill();
			this._mask.drawRect(0, 0, rect[2], rect[3]);
			this._mask.endFill();

			this._display.mask = this._mask;
		}

		this._display.x = rect[0];
		this._display.y = rect[1];
		// SJT -- The way PIXI works internally, setting the width and height of a PIXI display
		// can actually change its scale, which in this case might cause our Graphics to draw at
		// a lower resolution than we need for pixel crispness
		// this._display.width = rect[2];
		// this._display.height = rect[3];

	}

	setZIndex(zIndex = 1) {
		this._zIndex = zIndex;
		this._display.zIndex = this._zIndex;
	}

	show() {
		this._display.visible = true;
	}

	// ////////////////////////////////////
	// Custom PIXI Drawing Utitilities  //
	// ////////////////////////////////////

	// Allows you to add an arbitrary Pixi child if you don't like the convenience methods
	addDisplayChild(node) {
		this._display.addChild(node);
	}

	// Remove a display object child
	removeDisplayChild(node) {
		this._display.removeChild(node);
	}

	// ///////////
	// Shapes  //
	// ///////////

	rectangle(x, y, width, height, borderRad) {
		const scale = ActiveFrameStore.getScale();
		if (borderRad) {
			this.currentShape = new PIXI.RoundedRectangle(x * scale, y * scale, width * scale, height * scale, borderRad * scale);
		} else {
			this.currentShape = new PIXI.Rectangle(x * scale, y * scale, width * scale, height * scale);
		}
	}

	circle(cx, cy, rad) {
		const scale = ActiveFrameStore.getScale();
		this.currentShape = new PIXI.Circle(cx * scale, cy * scale, rad * scale);
	}

	ellipse(x, y, width, height) {
		const scale = ActiveFrameStore.getScale();
		this.currentShape = new PIXI.Ellipse(x * scale, y * scale, width * scale, height * scale);
	}

	polygon(x, y, points) {
		const scale = ActiveFrameStore.getScale();
		this.currentShape = new PIXI.Polygon(points.map((point) => {
			return new PIXI.Point((point[0] + x) * scale, (point[1] + y) * scale);
		}));
	}

	arc(cx, cy, rad, start, end) {
		const scale = ActiveFrameStore.getScale();
		this.currentShape = new Arc(cx * scale, cy * scale, rad * scale, start, end);
	}

	pie(cx, cy, rad, start, end) {
		const scale = ActiveFrameStore.getScale();
		this.currentShape = new Pie(cx * scale, cy * scale, rad * scale, start, end);
	}

	move_to(x, y) {
		const scale = ActiveFrameStore.getScale();
		this.currentShape = new Line(x * scale, y * scale);
	}

	line_to(x, y) {
		const scale = ActiveFrameStore.getScale();
		if (!(this.currentShape instanceof Line)) throw new Error("Expecting a move_to call before calling line_to when drawing lines");
		this.currentShape.lineTo(x * scale, y * scale);
	}

	// ///////////
	// Styles  //
	// ///////////

	fill() {

		if (this._color.type === COLOR_TYPES.COLOR) {
			this._graphics.beginFill(this._color.color, this._alpha);

			if (this.currentShape && this.currentShape instanceof CustomShape) {
				this.currentShape.draw(this._graphics);
			} else if (this._currentShape) {
				this._graphics.drawShape(this.currentShape);
			}

			this._graphics.endFill();
		} else if (this._color.type === COLOR_TYPES.GRADIENT) {

			// Gradient rendering
			const sprite = new PIXI.Sprite(this._color.color.texture);
			const mask = new PIXI.Graphics();

			if (this.currentShape.type === PIXI.SHAPES.CIRC || this.currentShape.type === PIXI.SHAPES.ELIP) {

				// non rectangular shapes have proper bounds
				const rect = this.currentShape.getBounds();
				sprite.x = rect.x;
				sprite.y = rect.y;

				// for some reason getBounds() doesn't return the correct size and instead returns half the size
				// TODO: investigate
				sprite.width = rect.width * 2;
				sprite.height = rect.height * 2;

			} else if (this.currentShape.type === PIXI.SHAPES.POLY ) {
				let bounds = getPolygonBounds(this.currentShape);
				[ sprite.x, sprite.y, sprite.width, sprite.height ] = bounds;
			} else {
				sprite.x = this.currentShape.x;
				sprite.y = this.currentShape.y;
				sprite.width = this.currentShape.width;
				sprite.height = this.currentShape.height;
			}

			mask.beginFill();

			if (this.currentShape && this.currentShape instanceof CustomShape) {
				this.currentShape.draw(mask);
			} else if (this._currentShape) {
				mask.drawShape(this.currentShape);
			}

			mask.endFill();
			sprite.mask = mask;
			this._display.addChild(sprite);
			this._display.addChild(mask);

			this._inactiveLayers.push(mask);
			this._inactiveLayers.push(sprite);
			this._pushNewGraphics();
		} else if (this._color.type === COLOR_TYPES.PATTERN) {

			// Tiled Sprite rendering
			const mask = new PIXI.Graphics();
			mask.beginFill();

			if (this.currentShape && this.currentShape instanceof CustomShape) {
				this.currentShape.draw(mask);
			} else if (this._currentShape) {
				mask.drawShape(this.currentShape);
			}

			mask.endFill();

			let bounds;

			if (this.currentShape.type === PIXI.SHAPES.CIRC || this.currentShape.type === PIXI.SHAPES.ELIP) {
				// non rectangular shapes have proper bounds
				bounds = this.currentShape.getBounds();
			} else if (this.currentShape.type === PIXI.SHAPES.POLY ) {
				bounds = getPolygonBounds(this.currentShape);
			} else {
				bounds = {
					x : this.currentShape.x,
					y : this.currentShape.y,
					height : this.currentShape.height,
					width : this.currentShape.width
				};
			}

			const sprite = new PIXI.extras.TilingSprite(this._color.color, bounds.width, bounds.height);

			// SJT --- SVG's were rendering at half their actual resolution, which was why they looked blurry
			// This isn't the right way to fix things, but I don't know SVG well enough to do things correctly.
			// If we end up needing SVG patterns much more often than now, we should revisit this
			sprite.tileScale = new PIXI.Point(0.5, 0.5);
			sprite.x = bounds.x;
			sprite.y = bounds.y;

			if (this._color.tint) sprite.tint = this._color.tint;

			sprite.mask = mask;
			this._display.addChild(sprite);
			this._display.addChild(mask);

			this._inactiveLayers.push(mask);
			this._inactiveLayers.push(sprite);
			this._pushNewGraphics();
		}
	}

	set_line_width(lineWidth) {
		const scale = ActiveFrameStore.getScale();
		this._lineWidth = lineWidth * scale;
	}

	set_line_cap(lineCap) {
		this._lineCap = lineCap;
	}

	stroke() {
		if (this._color.type !== COLOR_TYPES.COLOR) throw new Error("Strokes can only be used with solid color. Not with Gradients or patterns.");

		this._graphics.lineStyle(this._lineWidth, this._color.color, this._alpha);

		if (this.currentShape && this.currentShape instanceof CustomShape) {
			this.currentShape.draw(this._graphics);
		} else if (this.currentShape) {
			this._graphics.drawShape(this.currentShape);
		}

		this._graphics.lineStyle(0, 0xFFFFFF, 0);
	}

	set_source_rgba(color) {
		this._color = {
			type : COLOR_TYPES.COLOR,
			color : createHexColors(color)
		};
		this._alpha = color[3];
	}

	set_source_gradient(colorArray, colorPt1, colorPt2, proportion, angle) {
		this._color = {
			type : COLOR_TYPES.GRADIENT,
			color : new LinearGradient(colorArray, colorPt1, colorPt2, proportion, angle)
		};
	}

	set_pattern(texture, tint = null) {
		this._color = {
			type : COLOR_TYPES.PATTERN,
			color : texture,
			tint : tint ? createHexColors(tint) : null
		};
	}

	// ////////////////
	// Font Styles  //
	// ////////////////
	set_font_name(val) {
		this._fontName = val;
	}

	// Max uses the fontface attribute for both fontWeight and fontStyle, so we must parse the attribute's value
	set_font_weight(val) {
		if (val === "regular") {
			this._fontWeight = "normal";
			this._fontStyle = "normal";
		}
		if (val === "bold") {
			this._fontWeight = "bold";
			this._fontStyle = "normal";
		}
		if (val === "italic") {
			this._fontWeight = "normal";
			this._fontStyle = "italic";
		}
		if (val === "bold italic") {
			this._fontWeight = "bold";
			this._fontStyle = "italic";
		}
	}

	set_font_size(val) {
		const scale = ActiveFrameStore.getScale();
		this._fontSize = val * scale;
	}

	set_font_justification(val) {
		this._fontJustification = val;
	}

	// ////////
	// Text //
	// ////////
	textDimensions(txt) {
		const text = new PIXI.Text(txt, {
			fontWeight : this._fontWeight,
			fontStyle : this._fontStyle,
			fontSize : this._fontSize + "px",
			fontFamily : this._fontName,
			fill : "black",
			align : this._fontJustification,
			lineHeight : this._fontSize,
			padding : 1
		});
		const fontSize = Math.floor(this._fontSize / ActiveFrameStore.getScale());
		text.context.font = `${this._fontWeight} ${this._fontStyle} ${fontSize}px ${this._fontName}`;
		return text.context.measureText(txt);
	}

	/**
	 * A single line of text.
	 * If the parameter width is less than the width of the text,
	 * then it will be truncated with an ellipsis.
	 * If the font justification is set to "center", then the
	 * text will be centered in the supplied parameter width by
	 * changing the anchor of the text, and setting the x position to
	 * the width/2 + the supplied x parameter.
	 *
	 */
	textLine(x, y, width, height, val) {
		const scale = ActiveFrameStore.getScale();
		x *= scale;
		y *= scale;
		width *= scale;
		height *= scale;
		const textColor = (this._color.type === COLOR_TYPES.COLOR) ? "#" + this._color.color.substr(2) : "black";
		const text = new PIXI.Text(val, {
			fontWeight : this._fontWeight,
			fontStyle : this._fontStyle,
			fontSize : this._fontSize + "px",
			fontFamily : this._fontName,
			fill : textColor,
			align : this._fontJustification,
			lineHeight : 2 * this._fontSize,
			padding : 1
		});

		text.x = x;
		text.y = y;
		text.resolution = ActiveFrameStore.getResolution();
		let textWidth = text.width;
		const ellipsis = "…";
		if (textWidth > width) {
			let str = val.toString();
			let len = str.length;
			while (textWidth >= width && len-- > 1) {
				str = str.substring(0, len);
				textWidth = text.context.measureText(str + ellipsis).width;
			}
			if (textWidth <= width) {
				text.text = str + ellipsis;
			}
			else {
				text.text = str;
			}
		}
		if (this._fontJustification === "center" && textWidth < width) {
			text.anchor.x = 0.5;
			text.x = text.x + width / 2;
		}
		if (this._fontJustification === "right" && textWidth < width) {
			text.anchor.x = 1;
			text.x = text.x + width;
		}

		this._graphics.addChild(text);
		return text;
	}

	/**
	 * Multiline text.
	 * If the supplied width parameter is less than the width of the
	 * text, then it will be pushed onto another line, until all of the
	 * text is
	 *
	 */
	text(x, y, width, height, val) {
		const scale = ActiveFrameStore.getScale();
		x *= scale;
		y *= scale;
		width *= scale;
		height *= scale;
		const textColor = (this._color.type === COLOR_TYPES.COLOR) ? "#" + this._color.color.substr(2) : "black";
		const text = new PIXI.Text(val, {
			fontFamily : this._fontName,
			fontSize : this._fontSize,
			fontWeight : this._fontWeight,
			fontStyle : this._fontStyle,
			fill : textColor,
			align : this._fontJustification,
			wordWrap : true,
			wordWrapWidth : width,
			lineHeight : this._fontSize + (MAX_TEXT_LINE_SPACING * scale),
			padding : 2 * scale
		});

		text.x = x;
		text.y = y;
		text.resolution = ActiveFrameStore.getResolution();
		const textWidth = text.width;
		if (textWidth > width) {
			const str = val.toString().split("");
			const len = str.length;
			const newString = [];
			for (let i = 0; i < len; i++) {
				if (text.context.measureText(newString.join("").split("\n").pop() + str[i]).width > width) {
					newString.push("\n");
				}
				newString.push(str[i]);
				text.text = newString.join("");
			}
		}
		if (this._fontJustification === "center" && textWidth < width) {
			text.anchor.x = 0.5;
			text.x = text.x + width / 2;
		}
		if (this._fontJustification === "right" && textWidth < width) {
			text.anchor.x = 1;
			text.x = text.x + width;
		}
		this._graphics.addChild(text);
		return text;
	}

	_updateDeep(node, resolution) {
		if (node instanceof PIXI.Text) {
			node.resolution = resolution;
			node.updateText();
		}
		node.children.forEach((child) => {
			this._updateDeep(child, resolution);
		});
	}

	_updateResolution(resolution) {
		this._updateDeep(this._graphics, resolution);
	}
}

export default PixiDraw;
