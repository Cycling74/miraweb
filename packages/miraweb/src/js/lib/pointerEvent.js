export default class PointerEvent {

	constructor(options) {

		this.id = options.id;
		this.objectId = options.objectId;
		this.type = options.type;

		this.screenFrameX = options.screenFrameX || 0;
		this.screenFrameY = options.screenFrameY || 0;
		this.targetX = options.targetX || 0;
		this.targetY = options.targetY || 0;
		this.normTargetX = options.normTargetX || 0;
		this.normTargetY = options.normTargetY || 0;
		this.screenDeltaX = options.screenDeltaX || 0;
		this.screenDeltaY = options.screenDeltaY || 0;

		this.attributes = options.attributes || {};
	}
}

PointerEvent.TYPES = Object.freeze({
	POINTER_DOWN : "pointerDown",
	POINTER_MOVE : "pointerMove",
	POINTER_UP : "pointerUp"
});
