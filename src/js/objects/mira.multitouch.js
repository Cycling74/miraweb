import * as PIXI from "pixi.js";
import uniqBy from "lodash/uniqBy";
import values from "lodash/values";

import MiraUIObject from "./base.js";
import XebraStateStore from "../stores/xebraState.js";
import { Animation } from "../lib/animation.js";
import Assets from "../lib/assets.js";
import GestureEvent from "../lib/gestureEvent.js";


class Touch {
	constructor(options) {
		this.sequence = options.sequence;
		this.x = 0;
		this.y = 0;
		this.touchId = options.touchId;
		this.eventId = options.eventId;
		this.region = -1;

		this.sprite = new PIXI.Sprite(Assets.getResourceTexture("multitouch-touch"));
		this.sprite.anchor.set(0.5, 0.5);
		this.updatePosition(options.x, options.y);
	}

	updatePosition(x, y) {
		this.x = x;
		this.y = y;
		this.sprite.x = this.x;
		this.sprite.y = this.y;
	}

	destroy() {
		if (this.sprite.parent) this.sprite.parent.removeChild(this.sprite);
		this.sprite.destroy();
	}

	hide() {
		this.sprite.visible = false;
	}

	show() {
		this.sprite.visible = true;
	}
}

export default class MiraMultitouch extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);

		this._multiTouchParamCb = this._onMultitouchParamChange.bind(this);
		this._state.on("param_changed", this._multiTouchParamCb);

		["pinch_enabled", "rotate_enabled", "swipe_enabled", "tap_enabled"].forEach((paramType) => {
			this._configureGestureRecognizersForType(stateObj, paramType);
		});

		this._deviceTouches = {};
		this._touchSequence = 0;

		this._usedDeviceTouchIds = {};
		for (let i = 1; i <= this.constructor.MAX_NUM_TOUCHES; i++) {
			this._usedDeviceTouchIds[i] = false;
		}
	}

	_storeTouch(event) {
		if (this._currentTouchCount > this.constructor.MAX_NUM_TOUCHES) {
			console.log("Too many touches!");
			return null;
		}

		// Mira.Multitouch works with simple integer id counters 1 <= id <= MAX_NUM_TOUCHES . Given that we have to translate the
		// touch identifier to a unique value in that range
		let ids = Object.keys(this._usedDeviceTouchIds);
		let id = null;
		for (let i = 0, il = ids.length; i < il; i++) {
			if (!this._usedDeviceTouchIds[ids[i]]) {
				id = ids[i];
				this._usedDeviceTouchIds[ids[i]] = true;
				break;
			}
		}

		if (!id) return null;

		this._touchSequence++;
		const rect = this.getScreenRect();

		const touch = new Touch({
			sequence : this._touchSequence,
			x : (event.normTargetX * rect[2]),
			y : (event.normTargetY * rect[3]),
			touchId : parseInt(id, 10),
			eventId : event.id
		});

		this._displayNode.addDisplayChild(touch.sprite);
		if (!this._state.getParamValue("remote_circles")) touch.hide();

		this._deviceTouches[event.id] = touch;
		this._inTouch = true;

		return touch;
	}

	_getTouch(eventId) {
		return this._deviceTouches[eventId] || null;
	}

	_freeTouch(touch) {
		this._usedDeviceTouchIds[touch.touchId] = false;
		touch.destroy();
		delete this._deviceTouches[touch.eventId];
		this._inTouch = Object.keys(this._deviceTouches).length ? true : false;
	}

	_regionForLocalCoordinates(x, y) {
		const rect = this.getScreenRect();
		const hsegments = this._state.getParamValue("hsegments");
		const vsegments = this._state.getParamValue("vsegments");
		const width = rect[2];
		const height = rect[3];
		if (x < 0 || y < 0 || x > width || y > height) {
			return -1;
		}

		const col = Math.min(Math.floor(x * hsegments / width), hsegments - 1);
		const row = Math.min(Math.floor(y * vsegments / height), vsegments - 1);
		return col + hsegments * row;
	}

	_changeRegionForTouch(touch, region) {
		if (touch.region !== -1) {
			this.setParamValue("region", [
				touch.sequence,
				XebraStateStore.getXebraUuid(),
				XebraStateStore.getXebraUuid(),
				touch.region,
				touch.touchId,
				0
			]);
		}
		if (region !== -1) {
			this.setParamValue("region", [
				touch.sequence,
				XebraStateStore.getXebraUuid(),
				XebraStateStore.getXebraUuid(),
				region,
				touch.touchId,
				1
			]);
			touch.region = region;
		}
	}

	_configureGestureRecognizersForType(stateObj, paramType) {
		if (!this._displayNode.gesturesEnabled) return;

		if (paramType === "pinch_enabled") {
			this._displayNode.setGestureOptions("pinch", {
				enable : stateObj.getParamValue("pinch_enabled")
			});
		} else if (paramType === "rotate_enabled") {
			this._displayNode.setGestureOptions("rotate", {
				enable : stateObj.getParamValue("rotate_enabled")
			});
		} else if (["swipe_enabled", "swipe_touch_count"].indexOf(paramType) > -1) {
			this._displayNode.setGestureOptions("swipe", {
				enable : stateObj.getParamValue("swipe_enabled"),
				pointers : stateObj.getParamValue("swipe_touch_count")
			});
		} else if (["tap_enabled", "tap_tap_count", "tap_touch_count"].indexOf(paramType) > -1) {
			this._displayNode.setGestureOptions("tap", {
				enable : stateObj.getParamValue("tap_enabled"),
				pointers : stateObj.getParamValue("tap_touch_count"),
				taps : stateObj.getParamValue("tap_tap_count")
			});
		}
	}

	_onMultitouchParamChange(stateObj, param) {
		if (param.type === "remote_circles") {
			const touchIds = Object.keys(this._deviceTouches);
			const visibilityFct = !!param.value ? "show" : "hide";
			for (let i = 0, il = touchIds.length; i < il; i++) {
				this._deviceTouches[touchIds[i]][visibilityFct]();
			}
		}

		this._configureGestureRecognizersForType(stateObj, param.type);
	}

	/**
	 * Override destroy function to detach _configureGestureRecognizers properly
	 * @override
	 */
	destroy() {
		this._state.removeListener("param_changed", this._multiTouchParamCb);
		super.destroy();
	}

	paint(mgraphics, params) {
		const {
			width,
			height,
			hsegments,
			vsegments,
			color
		} = params;
		mgraphics.set_line_width(0.5);

		// draw background
		mgraphics.set_source_rgba(color);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();

		// draw overlay square for each touch in its region
		uniqBy(values(this._deviceTouches), "region").forEach((touch) => {
			const hsegmentWidth = width / hsegments;
			const vsegmentHeight = height / vsegments;

			const xPos = (touch.region % hsegments) * hsegmentWidth;
			const yPos = Math.floor(touch.region / hsegments) * vsegmentHeight;
			mgraphics.set_source_rgba([1, 1, 1, 0.2]);
			mgraphics.rectangle(xPos, yPos, hsegmentWidth, vsegmentHeight);
			mgraphics.fill();
		});

		// draw outline
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.set_source_rgba([0.5, 0.5, 0.5, 1]);
		mgraphics.stroke();

		// draw sections
		if (hsegments > 1) {
			const hsegmentWidth = width / hsegments;
			for (let i = 1, il = hsegments; i < il; i++) {
				mgraphics.move_to(hsegmentWidth * i, 0);
				mgraphics.line_to(hsegmentWidth * i, height);
				mgraphics.stroke();
			}
		}
		if ( vsegments > 1) {
			const vsegmentHeight = height / vsegments;
			for (let i = 1, il = vsegments; i < il; i++) {
				mgraphics.move_to(0, vsegmentHeight * i);
				mgraphics.line_to(width, vsegmentHeight * i);
				mgraphics.stroke();
			}
		}
	}

	pointerDown(event, params) {
		const touch = this._storeTouch(event);
		if (!touch) return;

		const reg = this._regionForLocalCoordinates(touch.x, touch.y);
		if (reg !== touch.region) {
			this._changeRegionForTouch(touch, reg);
		}

		this.setParamValue("up_down_cancelled_touch", [
			touch.sequence,
			XebraStateStore.getXebraUuid(),
			XebraStateStore.getXebraUuid(),
			touch.touchId,
			this.constructor.TOUCH_PHASE_START,
			reg, // segment
			event.normTargetX,
			event.normTargetY
		]);
		this.needsRender = true;
	}

	pointerMove(event, params) {
		const rect = this.getScreenRect();
		const touch = this._getTouch(event.id);
		if (!touch) return;

		touch.updatePosition(event.normTargetX * rect[2], event.normTargetY * rect[3]);
		const reg = this._regionForLocalCoordinates(touch.x, touch.y);
		if (reg !== touch.region) {
			this._changeRegionForTouch(touch, reg);
		}

		this.setParamValue("moved_touch", [
			touch.sequence,
			XebraStateStore.getXebraUuid(),
			XebraStateStore.getXebraUuid(),
			touch.touchId,
			this.constructor.TOUCH_PHASE_MOVE,
			reg, // segment
			event.normTargetX,
			event.normTargetY
		]);
		this.needsRender = true;
	}

	pointerUp(event, params) {
		const touch = this._getTouch(event.id);
		if (!touch) {
			console.log("No touch for event", event.id);
			return;
		}
		const reg = this._regionForLocalCoordinates(touch.x, touch.y);

		// Whatever region the touch was it, it's exited now
		this._changeRegionForTouch(touch, -1);

		this._freeTouch(touch);

		this.setParamValue("up_down_cancelled_touch", [
			touch.sequence,
			XebraStateStore.getXebraUuid(),
			XebraStateStore.getXebraUuid(),
			touch.touchId,
			this.constructor.TOUCH_PHASE_END,
			reg, // segment
			event.normTargetX,
			event.normTargetY
		]);
		this.needsRender = true;
	}

	pinch(event, params) {
		this.setParamValue("pinch", [
			0, // Sequence number, always 0
			XebraStateStore.getXebraUuid(),
			XebraStateStore.getXebraUuid(),
			event.scale,
			event.velocity,
			event.ongoing
		]);
		this.animatePinch(event);
	}

	rotate(event, params) {
		this.setParamValue("rotate", [
			0, // Sequence number, always 0
			XebraStateStore.getXebraUuid(),
			XebraStateStore.getXebraUuid(),
			event.rotate,
			event.velocity,
			event.ongoing
		]);
		this.animateRotate(event);
	}

	swipe(event, params) {
		// xeb.multitouch can't handle swipes with unknown direction,
		//  so don't send them
		if (event.direction !== GestureEvent.DIRECTIONS.NONE) {
			this.setParamValue("swipe", [
				0, // Sequence number, always 0
				XebraStateStore.getXebraUuid(),
				XebraStateStore.getXebraUuid(),
				event.direction,
				event.numTouches
			]);
			this.animateSwipe(event.direction);
		}
	}

	tap(event, params) {
		const rect = this.getScreenRect();
		this.setParamValue("tap", [
			0, // Sequence number, always 0
			XebraStateStore.getXebraUuid(),
			XebraStateStore.getXebraUuid(),
			event.center.x / rect[2],
			event.center.y / rect[3],
			this._regionForLocalCoordinates(event.center.x, event.center.y)
		]);
		this.animateTap(event.center.x, event.center.y);
	}

	animateTap(x, y) {
		const sprite = new PIXI.Sprite(Assets.getResourceTexture("multitouch-tap"));
		sprite.width = sprite.height = 0;
		sprite.anchor.set(0.5, 0.5);
		sprite.x = x;
		sprite.y = y;
		sprite.height = 111;
		this._displayNode.addDisplayChild(sprite);
		const animation = new Animation({
			duration : 500,
			onAnimate : (progress) => {
				sprite.width = sprite.height = 90 * progress;
				sprite.alpha = 1.0 - progress;
			},
			onEnd : () => {
				sprite.parent.removeChild(sprite);
				sprite.destroy();
			}
		});
		animation.start();
	}

	animateSwipe(direction) {
		const rect = this.getScreenRect();
		const width = rect[2];
		const height = rect[3];
		const sprite = new PIXI.Sprite(Assets.getResourceTexture("multitouch-swipe"));
		sprite.anchor.set(0.5, 0.5);
		sprite.width = sprite.height = 90;
		let startPosition;
		let endPosition;
		if (direction === GestureEvent.DIRECTIONS.UP) {
			sprite.rotation = 3 * Math.PI / 2;
			startPosition = {
				x : width / 2,
				y : height
			};
			endPosition = {
				x : width / 2,
				y : 0
			};
		} else if (direction === GestureEvent.DIRECTIONS.LEFT) {
			sprite.rotation = Math.PI;
			startPosition = {
				x : width,
				y : height / 2
			};
			endPosition = {
				x : 0,
				y : height / 2
			};
		} else if (direction === GestureEvent.DIRECTIONS.DOWN) {
			sprite.rotation = Math.PI / 2;
			startPosition = {
				x : width / 2,
				y : 0
			};
			endPosition = {
				x : width / 2,
				y : height
			};
		} else if (direction === GestureEvent.DIRECTIONS.RIGHT) {
			startPosition = {
				x : 0,
				y : height / 2
			};
			endPosition = {
				x : width,
				y : height / 2
			};
		}
		sprite.x = startPosition.x;
		sprite.y = startPosition.y;
		this._displayNode.addDisplayChild(sprite);
		const animation = new Animation({
			duration : 200,
			onAnimate : (progress) => {
				sprite.x = startPosition.x + (endPosition.x - startPosition.x) * progress;
				sprite.y = startPosition.y + (endPosition.y - startPosition.y) * progress;
				if (progress < 0.5) {
					sprite.alpha = 2 * progress;
				} else {
					sprite.alpha = 1.0 - 2 * (progress - 0.5);
				}
			},
			onEnd : () => {
				sprite.parent.removeChild(sprite);
				sprite.destroy();
			}
		});
		animation.start();
	}

	animatePinch(event) {
		const pinchTexture = Assets.getResourceTexture("multitouch-pinch");
		if (event._ongoing === 1 && !this._pinchSprites) {
			this._pinchSprites = [
				new PIXI.Sprite(pinchTexture),
				new PIXI.Sprite(pinchTexture),
				new PIXI.Sprite(pinchTexture),
				new PIXI.Sprite(pinchTexture)
			];
			this._pinchSprites.forEach((sprite, spriteIndex) => {
				sprite.anchor.set(0.5, 0.5);
				sprite.width = 50;
				sprite.height = 30;
				sprite.x = event._center.x;
				sprite.y = event._center.y;
				this._displayNode.addDisplayChild(sprite);

			});
			clearTimeout(this._stopPinchTimeout);
			this._stopPinchTimeout = setTimeout(this.stopAnimatingPinch.bind(this), 100);
		} else if (event._ongoing === 1 && this._pinchSprites) {
			const vectorDistance = Math.sqrt(
				Math.pow(event._pointers[0].x - event._pointers[1].x, 2)
				+ Math.pow(event._pointers[0].y - event._pointers[1].y, 2)
			);

			const points = [
				{
					x : event._center.x,
					y : event._center.y - vectorDistance / 2
				},
				{
					x : event._center.x + vectorDistance / 2,
					y : event._center.y
				},
				{
					x : event._center.x,
					y : event._center.y + vectorDistance / 2
				},
				{
					x : event._center.x - vectorDistance / 2,
					y : event._center.y
				}
			];
			this._pinchSprites.forEach((sprite, spriteIndex) => {
				sprite.x = points[spriteIndex].x;
				sprite.y = points[spriteIndex].y;
				sprite.rotation = (Math.PI * spriteIndex) / 2;
			});
			clearTimeout(this._stopPinchTimeout);
			this._stopPinchTimeout = setTimeout(this.stopAnimatingPinch.bind(this), 100);
		} else if (event._ongoing === 0 && this._pinchSprites) {
			this._pinchSprites.forEach((sprite, spriteIndex) => {
				sprite.parent.removeChild(sprite);
				sprite.destroy();
			});
			this._pinchSprites = undefined;
		}
	}

	stopAnimatingPinch() {
		if ((!this._state.getParamValue("pinch_enabled") || Object.keys(this._deviceTouches).length !== 2) && this._pinchSprites) {
			this._pinchSprites.forEach((sprite, spriteIndex) => {
				sprite.parent.removeChild(sprite);
				sprite.destroy();
			});
			this._pinchSprites = undefined;
		}
	}

	animateRotate(event) {
		const rotationTexture = Assets.getResourceTexture("multitouch-rotation");
		if (event._ongoing === 1 && !this._rotateSprites && event._pointers.length === 2) {
			this._rotateSprites = {
				stationary : new PIXI.Sprite(rotationTexture),
				rotating : new PIXI.Sprite(rotationTexture)
			};

			this._rotateSprites.stationary.x = this._rotateSprites.rotating.x = event._center.x;
			this._rotateSprites.stationary.y = this._rotateSprites.rotating.y = event._center.y;
			this._rotateSprites.stationary.width = this._rotateSprites.rotating.width = 16;
			this._rotateSprites.stationary.height = this._rotateSprites.rotating.height = 150;
			this._rotateSprites.stationary.anchor.set(0.5, 0.5);
			this._rotateSprites.stationary.tint = 0x000000;

			this._rotateSprites.rotating.anchor.set(0.5, 0.5);
			this._rotateSprites.rotating.tint = 0xFF0000;

			this._displayNode.addDisplayChild(this._rotateSprites.stationary);
			this._displayNode.addDisplayChild(this._rotateSprites.rotating);

			if (event._pointers[0].y > event._pointers[1].y) {
				this._startingRotation = Math.atan2(
					event._pointers[0].y - event._pointers[1].y,
					event._pointers[0].x - event._pointers[1].x
				);
				this._pointerIndex = 0;
			} else {
				this._startingRotation = Math.atan2(
					event._pointers[1].y - event._pointers[0].y,
					event._pointers[1].x - event._pointers[0].x
				);
				this._pointerIndex = 1;
			}

			this._rotateSprites.rotating.visible = false;
			this._rotateSprites.stationary.visible = false;
		} else if (event._ongoing === 1 && this._rotateSprites && event._pointers.length === 2) {
			this._rotateSprites.rotating.visible = true;
			this._rotateSprites.stationary.visible = true;
			const rotation = Math.atan2(
				event._pointers[this._pointerIndex].y - event._pointers[(this._pointerIndex + 1) % 2].y,
				event._pointers[this._pointerIndex].x - event._pointers[(this._pointerIndex + 1) % 2].x
			);

			this._rotateSprites.stationary.x = this._rotateSprites.rotating.x = event._center.x;
			this._rotateSprites.stationary.y = this._rotateSprites.rotating.y = event._center.y;

			this._rotateSprites.rotating.rotation = rotation - this._startingRotation;

			clearTimeout(this._stopRotateTimeout);
			this._stopRotateTimeout = setTimeout(this.stopAnimatingRotate.bind(this), 100);
		} else if (event._ongoing === 0 && this._rotateSprites) {
			this._rotateSprites.rotating.parent.removeChild(this._rotateSprites.rotating);
			this._rotateSprites.rotating.destroy();
			this._rotateSprites.stationary.parent.removeChild(this._rotateSprites.stationary);
			this._rotateSprites.stationary.destroy();
			this._rotateSprites = undefined;
		}
	}

	stopAnimatingRotate() {
		if ((!this._state.getParamValue("rotate_enabled") || Object.keys(this._deviceTouches).length !== 2) && this._rotateSprites) {
			this._rotateSprites.rotating.parent.removeChild(this._rotateSprites.rotating);
			this._rotateSprites.rotating.destroy();
			this._rotateSprites.stationary.parent.removeChild(this._rotateSprites.stationary);
			this._rotateSprites.stationary.destroy();
			this._rotateSprites = undefined;
		}
	}
}

MiraMultitouch.NAME = "mira.multitouch";

MiraMultitouch.CACHES_PARAMS = true;
MiraMultitouch.GESTURES = true;
MiraMultitouch.MIN_TOUCH_ID = 1;
MiraMultitouch.MAX_NUM_TOUCHES = 12;
MiraMultitouch.TOUCH_PHASE_START = 0;
MiraMultitouch.TOUCH_PHASE_MOVE = 1;
MiraMultitouch.TOUCH_PHASE_END = 3;
MiraMultitouch.TOUCH_PHASE_CANCEL = 2;
