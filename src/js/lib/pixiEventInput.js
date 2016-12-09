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

const MOUSE_EVENTS = ["mousemove", "mousedown", "mouseup"];
const TOUCH_EVENTS = ["touchstart", "touchmove", "touchend", "touchcancel"];
const PIXI_TARGET_EVENTS = [TOUCH_EVENTS.join(" "), MOUSE_EVENTS.join(" ")].join(" ");

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
	}

	get evTarget() {
		return PIXI_TARGET_EVENTS;
	}

	_handler(ev) {
		const type = PIXI_INPUT_MAP[ev.type];
		let pointerType;
		let pointers;
		let changedPointers;

		if (MOUSE_EVENTS.indexOf(ev.type) > -1) {
			pointerType = "mouse";
			pointers = [ev.data.originalEvent];
			changedPointers = [ev.data.originalEvent];
		} else {
			pointerType = "touch";
			const touches = this.getTouches(ev, type);
			if (!touches) {
				return;
			}
			pointers = touches[0];
			changedPointers = touches[1];
		}

		this.callback(this.manager, type, {
			pointers : pointers,
			changedPointers : changedPointers,
			pointerType : pointerType,
			srcEvent : ev.data.originalEvent
		});
	}

	/**
	 * @this {TouchInput}
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
