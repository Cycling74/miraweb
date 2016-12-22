import Hammer from "hammerjs";
import findIndex from "lodash/findIndex.js";

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

const POINTER_EVENTS = ["pointerdown", "pointermove", "pointerup", "pointerupoutside", "pointercancel"];
const PIXI_TARGET_EVENTS = POINTER_EVENTS.join(" ");

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
		this._handlePointerEvent(ev);
	}

	_handlePointerEvent(pixiEvent) {
		let ev = pixiEvent.data.originalEvent;
		let { store } = this;
		let removePointer = false;

		let eventTypeNormalized = pixiEvent.type.toLowerCase();
		let eventType = POINTER_INPUT_MAP[eventTypeNormalized];

		let pointerType;
		let pointerId;
		if (ev.pointerType) {
			pointerId = ev.pointerId;
			pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;
		} else if (ev instanceof MouseEvent) {
			pointerId = pixiEvent.data.identifier;
			pointerType = INPUT_TYPE.MOUSE;

			ev.pointerId = pointerId;
			ev.pointerType = pointerType;
		} else if (ev instanceof TouchEvent) {
			pointerId = pixiEvent.data.identifier;
			pointerType = INPUT_TYPE.TOUCH;

			ev.pointerId = pointerId;
			ev.pointerType = pointerType;
		}

		let isTouch = (pointerType === INPUT_TYPE.TOUCH);

		// get index of the event in the store
		let storeIndex = findIndex(store, ["pointerId", pointerId]);

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
}
