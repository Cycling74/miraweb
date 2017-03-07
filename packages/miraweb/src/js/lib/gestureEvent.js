class GestureEvent {

	constructor(options) {
		this._pointers = options.pointers;
		this._center = options.center;
	}

	get type() {
		return this.constructor.TYPE;
	}

	get numTouches() {
		return this._pointers.length;
	}

	get pointers() {
		return this._pointers;
	}

	get center() {
		return this._center;
	}
}

GestureEvent.TYPES = Object.freeze({
	PINCH : "pinch",
	ROTATE : "rotate",
	SWIPE : "swipe",
	TAP : "tap"
});

GestureEvent.DIRECTIONS = Object.freeze({
	NONE : 0,
	RIGHT : 1,
	LEFT : 2,
	UP : 4,
	DOWN : 8
});


class PinchGesture extends GestureEvent {

	constructor(options) {
		super(options);

		this._ongoing = options.isFinal ? 0 : 1;
		this._scale = options.scale;
		this._velocity = options.velocity;
	}

	get ongoing() {
		return this._ongoing;
	}

	get scale() {
		return this._scale;
	}

	get velocity() {
		return this._velocity;
	}
}

PinchGesture.TYPE = GestureEvent.TYPES.PINCH;

class RotateGesture extends GestureEvent {

	constructor(options) {
		super(options);

		this._ongoing = options.isFinal ? 0 : 1;
		this._rotate = options.rotate;
		this._velocity = options.velocity;
	}

	get ongoing() {
		return this._ongoing;
	}

	get rotate() {
		return this._rotate;
	}

	get velocity() {
		return this._velocity;
	}
}

RotateGesture.TYPE = GestureEvent.TYPES.ROTATE;

class SwipeGesture extends GestureEvent {

	constructor(options) {
		super(options);

		this._direction = options.direction;
	}

	get direction() {
		return this._direction;
	}
}

SwipeGesture.TYPE = GestureEvent.TYPES.SWIPE;

class TapGesture extends GestureEvent { }

TapGesture.TYPE = GestureEvent.TYPES.TAP;

// factory function
GestureEvent.createInstance = function(type, options) {
	if (type === GestureEvent.TYPES.PINCH) return new PinchGesture(options);
	if (type === GestureEvent.TYPES.ROTATE) return new RotateGesture(options);
	if (type === GestureEvent.TYPES.SWIPE) return new SwipeGesture(options);
	if (type === GestureEvent.TYPES.TAP) return new TapGesture(options);

	return null;
};

export default GestureEvent;
