import forIn from "lodash/forIn.js";

/**
 * Class declaration for singleton class AnimationController
 */
class AnimationController {
	constructor() {
		this._animations = {};
	}

	register(animation) {
		this._animations[animation.id] = animation;
	}

	unregister(animation) {
		delete this._animations[animation.id];
	}

	update(timestamp) {
		forIn(this._animations, animation => {
			animation.update(timestamp);
		});
	}
}

const animationController = new AnimationController();
export default animationController;


let ANIMATION_RESOURCE_ID = 0;

/**
 * @param {object} options
 * @param {function} options.onAnimate
 * @param {number} options.onAnimate(progress) - normalized progress from 0 to 1
 * @param {function} options.onEnd
 * @param {number} options.duration
 */
export class Animation {
	constructor(options) {
		this._onAnimateCallback = options.onAnimate;
		this._onEndCallback = options.onEnd;
		this._duration = options.duration || 200;
		this._id = ++ANIMATION_RESOURCE_ID;
	}

	start() {
		animationController.register(this);
	}

	get id() {
		return this._id;
	}

	update(timestamp) {
		if (!this._startTime) {
			this._startTime = timestamp;
			this._endTime = this._startTime + this._duration;
		}

		if (timestamp >= this._endTime) {
			if (typeof this._onEndCallback === "function") {
				this._onEndCallback();
			}
			animationController.unregister(this);
		} else {
			if (typeof this._onAnimateCallback === "function") {
				this._onAnimateCallback((timestamp - this._startTime) / this._duration);
			}
		}
	}

}
