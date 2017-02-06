import Hammer from "hammerjs";
import findIndex from "lodash/findIndex.js";
import toArray from "lodash/toArray.js";
import size from "lodash/size.js";

const PIXI_INPUT_MAP = Object.freeze({
	touchstart : Hammer.INPUT_START,
	touchmove : Hammer.INPUT_MOVE,
	touchend : Hammer.INPUT_END,
	touchcancel : Hammer.INPUT_CANCEL,
	mousemove : Hammer.INPUT_MOVE,
	mouseup : Hammer.INPUT_END,
	mousedown : Hammer.INPUT_START
});

const POINTER_INPUT_MAP = Object.freeze({
	pointerdown : Hammer.INPUT_START,
	pointermove : Hammer.INPUT_MOVE,
	pointerup : Hammer.INPUT_END,
	pointerupoutside : Hammer.INPUT_END,
	pointercancel : Hammer.INPUT_CANCEL,
	pointerout : Hammer.INPUT_CANCEL
});

const INPUT_TYPE = Object.freeze({
	TOUCH : "touch",
	PEN : "pen",
	MOUSE : "mouse"
});

// in IE10 the pointer types is defined as an enum
const IE10_POINTER_TYPE_ENUM = Object.freeze({
	2 : INPUT_TYPE.TOUCH,
	3 : INPUT_TYPE.PEN,
	4 : INPUT_TYPE.MOUSE
});

const MOUSE_EVENTS = ["mousemove", "mousedown", "mouseup"];
const TOUCH_EVENTS = ["touchstart", "touchmove", "touchend", "touchendoutside", "touchcancel"];
const POINTER_EVENTS = ["pointerdown", "pointermove", "pointerup", "pointerupoutside", "pointercancel"];
const PIXI_TARGET_EVENTS = POINTER_EVENTS.join(" ");

function touchSorter(ta, tb) {
	return ta.identifier - tb.identifier;
}

/**
 * PIXI touch events input
 * @constructor
 * @extends Input
 */
export default class PixiEventInput extends Hammer.Input {

	constructor(manager, callback) {
		super(manager, callback);
		this.handler = this._handler.bind(this);
		this.store = (this.manager.session.pointerEvents = []);
	}

	get evTarget() {
		return PIXI_TARGET_EVENTS;
	}

	_handler(ev) {
		if (POINTER_EVENTS.indexOf(ev.data.originalEvent.type) > -1) {
			this._handlePointerEvent(ev);
		}

		else {
			this._handleMouseTouchEvent(ev);
		}
	}

	_handlePointerEvent(pixiEvent) {
		let ev = pixiEvent.data.originalEvent;
		let { store } = this;
		let removePointer = false;

		let eventTypeNormalized = ev.type.toLowerCase().replace("ms", "");
		let eventType = POINTER_INPUT_MAP[eventTypeNormalized];
		let pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

		let isTouch = (pointerType === INPUT_TYPE.TOUCH);

		// get index of the event in the store
		let storeIndex = findIndex(store, ["pointerId", ev.pointerId]);

		// start and mouse must be down
		if (eventType & Hammer.INPUT_START && (ev.button === 0 || isTouch)) {
			if (storeIndex < 0) {
				store.push(ev);
				storeIndex = store.length - 1;
			}
		} else if (eventType & (Hammer.INPUT_END | Hammer.INPUT_CANCEL)) {
			removePointer = true;
		}

		// it not found, so the pointer hasn't been down (so it's probably a hover)
		if (storeIndex < 0) {
			return;
		}

		// update the event in the store
		store[storeIndex] = ev;

		this.callback(this.manager, eventType, {
			pointers : store,
			changedPointers : [ev],
			pointerType,
			srcEvent : ev
		});

		if (removePointer) {
			// remove from the store
			store.splice(storeIndex, 1);
		}
	}

	_handleMouseTouchEvent(ev) {
		const type = PIXI_INPUT_MAP[ev.data.originalEvent.type];
		let pointerType;
		let pointers;
		let changedPointers;

		if (MOUSE_EVENTS.indexOf(ev.data.originalEvent.type) > -1) {
			pointerType = "mouse";
			pointers = [ev.data.originalEvent];
			changedPointers = [ev.data.originalEvent];
		} else if (TOUCH_EVENTS.indexOf(ev.data.originalEvent.type) > -1) {
			pointerType = "touch";
			const touches = this.getTouches(ev, type);
			if (!touches) {
				return;
			}
			pointers = touches[0];
			changedPointers = touches[1];
		} else {
			console.log("Gesture manager cannot handle input event of type " + ev.data.originalEvent.type);
			return;
		}

		this.callback(this.manager, type, {
			pointers : pointers,
			changedPointers : changedPointers,
			pointerType : pointerType,
			srcEvent : ev.data.originalEvent
		});
	}

	/**
	 * @this {PixiEventInput}
	 * @param {Object} ev
	 * @param {Number} type flag
	 * @returns {undefined|Array} [all, changed]
	 */
	getTouches(ev, type) {
		const allTouches = ev.data.originalEvent.touches;

		// when there is only one touch, the process can be simplified
		if (type & (Hammer.INPUT_START | Hammer.INPUT_MOVE) && size(allTouches) === 1) {
			const allTouchesArray = toArray(allTouches);
			return [allTouchesArray, allTouchesArray];
		}

		const changedTouches = ev.data.originalEvent.changedTouches;
		const targetTouches = [];
		const changedTargetTouches = [];

		for (let i = 0; i < changedTouches.length; i++) {
			const touch = changedTouches[i];
			if (this.manager.isTouchLocked(touch)) {
				changedTargetTouches.push(touch);
				targetTouches.push(touch);
			}
		}

		if (!changedTargetTouches.length) return undefined;

		// merge targetTouches with changedTargetTouches so it contains ALL touches, including "end" and "cancel"
		for (let i = 0; i < allTouches.length; i++) {
			const touch = allTouches[i];
			if (this.manager.isTouchLocked(touch)) {
				if (findIndex(changedTargetTouches, ["identifier", touch.identifier]) === -1)
					{targetTouches.push(touch);}
			}
		}

		targetTouches.sort(touchSorter);
		return [
			targetTouches,
			changedTargetTouches
		];
	}
}
