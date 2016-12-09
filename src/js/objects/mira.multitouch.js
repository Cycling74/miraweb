import MiraUIObject from "./base.js";
import * as PIXI from "pixi.js";
import XebraStateStore from "../stores/xebraState.js";
import lodash from "lodash";
import { Animation } from "../lib/animation.js";
import GestureEvent from "../lib/gestureEvent.js";


class Touch {
	constructor(options) {
		this.sequence = options.sequence;
		this.x = 0;
		this.y = 0;
		this.touchId = options.touchId;
		this.eventId = options.eventId;
		this.region = -1;

		this.sprite = PIXI.Sprite.fromImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAA6ppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxNi0xMS0wNFQxMjoxMTo1ODwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+UGl4ZWxtYXRvciAzLjMuMjwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpDb21wcmVzc2lvbj41PC90aWZmOkNvbXByZXNzaW9uPgogICAgICAgICA8dGlmZjpSZXNvbHV0aW9uVW5pdD4yPC90aWZmOlJlc29sdXRpb25Vbml0PgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzI8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xMDA8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpDb2xvclNwYWNlPjE8L2V4aWY6Q29sb3JTcGFj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");
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
		this.sprite.parent.removeChild(this.sprite);
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

		this._gestureChangeCb = this._configureGestureRecognizersForParam.bind(this);
		this._state.on("param_changed", this._gestureChangeCb);

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

		if (["pinch_enabled"].indexOf(paramType) > -1) {
			this._displayNode.setGestureOptions("pinch", {
				enable : stateObj.getParamValue("pinch_enabled")
			});
		} else if (["rotate_enabled"].indexOf(paramType) > -1) {
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

	_configureGestureRecognizersForParam(stateObj, param) {
		this._configureGestureRecognizersForType(stateObj, param.type);
	}

	/**
	 * Override destroy function to detach _configureGestureRecognizers properly
	 * @override
	 */
	destroy() {
		this._state.removeListener("param_changed", this._gestureChangeCb);
		super.destroy(arguments);
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
		lodash.forEach(lodash.uniqBy(lodash.values(this._deviceTouches), "region"), function(touch) {
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
		const sprite = new PIXI.Sprite.fromImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANwAAADcCAMAAAAshD+zAAABuVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////91YlUsAAAAknRSTlMAAQIDBAUGBw0QEhMUFRYXGBodHiAiJS0wMTQ1Njc5Ojs9Pj9AQUJDREVGR0xQUVNUVWBhZWZpamtsbW5vcXJzdXZ3eXp7fX5/gYKDh4uQk5SYmZ6jpKWnqKmqq62usLG0tre4u7y9vsHDxMXHycrLzc/Q0dbY297f4uPk5ebn6Onq7/Dx8vP09fb3+Pn6+/z9/om7NRUAAAkKSURBVHgB5d0LVxNJHgXw20Fa5MFGIomrLojKQHyMD4ko4IjIomOQiTqogPgAH6Kg+DCKEd/IoNEk9xPvcWd3Z2arutMh3Z2u8vcN6pyc7vS/qu6Fx8xovGto5Nep++mFN+9WcrmVd28W0venfh0Z6opHTahqXdvhczOZAm3kMzPnDretg1LM1v4rC3Rs4Up/qwkVVO8YnvnMkn2eGd5RjUBr6ppc4qotTXY1IaCafppj2eZ+akLgNPTeK9AVhXu99QgQo3MsSxdlxzoNBEPd4DO67tlgHSovfOYjPfHxTBiVFUl9omc+pSKonOj5L/TUl/NRVEbsYp6ey1+MwX+RiQJ9UZiIwF/VA8v0zfJANXzU/oS+etIOv4RH6bvRMPxQ1fOBFfChpwqe2/KQFfJwC7xlDHxlxXwdMOCh+uss2cqjsWTPwX27WmMb6kyzbkOsdde+gz3JsUcrLNn1enimLcNSvL2R6olHDFgwIvGe1I23LEWmDd4wTuTo2PurfTEDDhixvqvv6VjuhAEPNEzToeXp45urUIKqzcenl+nQdANct/0lHclO/mhiFcwfJ7N05OU2uCyRoxOz3bVYtdruWTqRS8BVQ3TgeTKKMkWTz+nAENwTSrG42d0GXGDsnmVxqRBcYo6zqNsdcE3HbRY1bsIVNTdZzLUWuKrlGou5WQMXNM4X/ZrcCNf9vei38Hwjytacpr3HW+GJrY9pL92MMjUv0tbS0TXwyJqjS7S12IyyNKZp69J6eGj9JdpKN6IMNfO087QTHut8SjvzNVg18xZt5JMmPGcm87Rxy8QqhcZp43UHfNHxmjbGQ1idFG3cCsMn4Vu0kXL//2T+VAi+CZ3Ku/0/M0Frr9rhq/ZXtJZAybbnaOlOI3zWeIeWcttRooaXtHR5LXy39jItvWxASYxpWjobQgWEztLStIFSDNLSz6iQn2lpECVoy9FCvhsV052nhVwbHKvP0EJ2Pypof5YWMvVwyLhOC9k4KiqepYXrBpwZoIX8flTY/jwtDMCRf3ylhW5UXDctfN0CB6oeOnpOBu6Z+bAKxfXSwlkEwlla6EVR4Q+UuxxCIIQuU+5DGMVcoNydtQiItXcodwFFtFNusRGB0bhIuXbYqn5CqXw7AqQ9T6kn1at6xZ1EoJxczcsu8hulboUQKKFblFqOwNoEpV6HETDh15SagKVYgTL5DgROR54yhRisXKRUEgGUpNRFWIjmKfPURACZTymTj0LuPKU6EUidlDoPqcgXylxCQF2izJdICQPmpfUIqPVLzkfQ4U+UOYrAOkqZT2GIzlDm8RoE1prHlDkDQd1HShS2IsC2FijxsRb/75+UmUCgTTibYhrPKLMRgbaRMs8M/FWcMtcQcNcoE8dfjVOmBQHXQpkx/EVDlhK3EXi3KZFtwJ/1UeYHBF6Hg0HYPUrMQgGzlLiHP2kqUGI3FLCbEoUm/OEYJZ4bUIDxnBLH8Ic5SpyGEk5TYg7/00SZKJQQpUyT/amMWShilhJd+K9JShyCIg5RYhL/Ub1EUbYWiqjNUrRUjd/tkC9dGZOU2IHfDVNiD5SxhxLD+N1dipZNKMNcpugu/s38TNE0FDJN0WcT37RS4jgUcpwSrfimnxKboJBNlOjHN1coel8FhVS9p+gKvlmg6CqUcpWiBQBYR4k+KKWPEusAbKNEDEqJUaINwGGK3hpQivGWosMAzlF0A4q5QdE5ADMU/QLFpCiaAZCh6AgUc4SiDGAWKIpDMXGK8iailIhAMRFKRKVrXjGgGGOFojgSFD2Cch5RlMAQRWNQzhhFQxih6DSUk6RoBKMU9UA5PRSNYoqiA1DOAYqm8ICivVDOXooeIE3RTihnJ0VpvKCoBcppoegF3lAUg3JiFL3BO4o2QDkbKHqHFYrqoJw6ilaQo8iEckyKcnovTuufpdYPFK1fBQsUtUI5rRQtIE3RLihnF0Vp3KdoH5Szj6L7mKLoIJRzkKIpnT9Wf8UIRUldxgxaD4i69B3tdek9lNV6nG7m9d0I0WQLq4eijMXmY0qLzUett4113/Bv0/mohtaHbLQ+HqX3wbZ+SmyGQjZTol//w6RaHwPW8wD3jCZH73+kxLD+lyY0v+4iX3o3FNFNiUn9r5hpfzkQc5RIqjux5JzOF3J/0v8qtf6X4IFeneMLtA6ewJjGkSHo1CnspfN7iunBoMYBSzpFY9XpH2qmfxyd/kGC2kdAah3eqXfsqtaBuXpHHWsdUo3Issbx4hig3CkEyinKDXy/kf5op9yrIJUxvKJcu8Y1GqNaF6BoXF3T872XDmGLPnVR+hd96V/Rpn+5nv61iMAJtQotT2hdRapziazG9b/b3C1uXvS7uHmR1hKuV26f9LNy+6Rt5bYXZel/U7YsXf+ae5g3aSOfNOE5M5mnjZsmVq1mnnaedsJjnU9pZ74GZWhM09al9fDQ+ku0lW5EWZoXaWvp6Bp4ZM3RJdpabEaZmtO093grPLH1Me2lm1G2xnnaK0xshOs2ThRob74RLqi5yWKutcBVLddYzM0auMIcZ1G3f4BrfrjNosZNuCSUYnGzuw24wNg9y+JSIbhniA48Px1FmaKnn9OBIbgqkaMTs4dqsWq1h2bpRC4Bl21/SUeyk3tMrIK5ZzJLR15uh+sapunQ8vTxTVUoQdWm49PLdGi6AR4wBnN07P3VvpgBB4xY39X3dCw3aMAbbRmW4u2NX47EIwYsGJH4kV9uvGUpMm3wTP11lmzl0Viy58DenS2xDXWmWbch1rJz74Ge5NijFZbsej08ZAx8ZcV8HTDgrS0PWSEPt8BzVb0fWAEfeqvgh/AF+u5CGH5pf0JfPWmHj6oHfqNvfhuohr8iEwX6ojARgf9iF/P0XP5iDJURPf+FnvpyPorKiaQ+0TOfUhFUVvjMR3ri45kwKq9u8Bld92ywDsFgxMezdFF2PG4gQBp67xXoisK93gYETtOxOZZt7lgTAqopMbnEVVuaTDQh0Kp3DN/9zJJ9vju8oxoqMFv7ryzQsYUr/a0mlLJu2+FzM5kCbRQyM+cOb1sHVZnReGJoZHTqQfrFm3crudzKuzcv0g+mRkeGEvGoCW/9C5Th9K/90bRAAAAAAElFTkSuQmCC");
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
		const sprite = new PIXI.Sprite.fromImage("data:image/png;base64,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");
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
		const spriteImageString = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATcAAAC4CAMAAACxbVu5AAABvFBMVEX////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////sdgZ/AAAAk3RSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKDw9Pj9AQUJDREVGR4+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn8/T19vcVXCwIAAAFF0lEQVR4AeTbSVLjUBCE4RchyYMk9z3cQ7uHPkYzY8BgZs82HMUY8sLUykQtcIRTaIHyv0F9q9pk2FC7nwfd6t1/gaq9xDTXZbvECwX3dQkYnC4bDI5kAya5LNsajmAThav3gTUcwebgBNkM7u9WbE/AG1wmyObgKDY5uPoFQMF9MzY5OM/m4Ug2YJzpshncH5LNw2mweTiSTQaudg5QcJ7Nw2mwUXDfPZuHU2PzcCQbMMqqztbD+z3/ptgE4IwNBJxjk4HzbAScY5OB82wU3I8VoAtXOwMIOMe2ES7VZTO4XyQbMEwV2TycZ9OFq50CBJxjE4RLjI2C+2lsBJwOm4dzbLJwyQmwHVzHsRFwQmwejmQDBqkam4dzbAScJBuw6oQeoAuXdMHVC+mAhtNls9uF4Qqx8XC4Tz832zGo1t9EOqThVNmKwjU12XThkiNwjYxNFy6m2bLgykY0nDIbD4e7pg7b2Nh04eLDomwebkzD6bDJwvFsE2PThYsPWLY8hA+Hu21WnW3zkiOb0HACbLJw8X45bFbOw1WXbWZsJcIpsxnctJpw8R7L1gqhVLibRhXZ5samCxeVz2ZwMxpOgE0ILtoF18LYJOHKZ/O1WLjrhjKbwc2rAhftgOvhSwiScMXZJOGKs+nCRf/B9WhsNNwCXFeN1/btorluJA4CeEvr53dbM4O9Gwe+QJgZcgrzNbfEzMzg+DtnKreUy1WpHuu9Ubr7PlL/fxeBRsps5Yfj2ZoAXbh/npPtRyPZgH+/0XCibPFwmmzxcNX6sj0je48FtrrCfakqswW47+WDy2m2ZkAXjmYbD2y6cPnTJNiAJh5OmS3AjZJVPlfLwzYR2HTh8icsWwugCxfPJglHs00WxBbgxtKHyx/Hs6UD96mqzAY0Jw5Hs00FNl24/BHL1goUDDfOwwmzpQxHs00HNl24/GE8W5pwHxuV2QLcRHpwPFsbapaW5ODyB2SjmcCmCxfPJgmXlYUtwE2SVT+cPlx2n+wyG9h04Xi2dkAXLp5NEi67R7aYqxMb0DrFwymyxcO9bxRmSwAuu0uef74D0IUrLVuAm+bhFNkSgMvuxLOVEe5dY33YFpJgA9rqAsezdQKJwM2wcBWe7XY8myAczbYY2HThys8WC/eWgctusWxdQGJwszycMBvQXjM4mm0psOnCZTdj2QTgBNgC3Bw50ptK8WzL3YAuXHYjnk0QLp5NEo5mW0mcDegoEu46y9YDJA83Tw73uqLMFg8nylYY3DXyqKuBTRdOgC3ALZw6HM3WixKlk4V7dQLc1Xg2RTiWbS2wqcA14FiuyLAFuMV4uFi2PkAYjmVbD2xScC9/g7ssxgZ0xcPFs4nC0Wz9QInhliLhLpHrNwKbMJwqWwTciwZlthi4ykVhNqB7mR2fXLc5AEjD1ZDNcBSb4bYSZiPgVmrFNggYTp4N6FlJlc1w2wyb4baHgL8SbtVsJJzZqPQWB7fDsBluZxgwnNmOw62ZLRW4XYbNcLv/QSJ9a2bj4NbNVm+4vf8BwxXBZjizAf3rZuPgNqLZ9s8AhiuezXA0m+EoNsMdjEA4A5vFsxnObDyc2Xi4g7NmI+AOzfYrg1vFsxnu8JzBCDizUXA/zHYMzmxEhrb/hO28oQg4s1FwR2Zj4I4umOgkOLNRGd4xGw/HXxIMx9+3GY5/uDIc/wbEcAdmY+D2R0xCwFHfSQ23ZzYCjttxZLhdsxFw1N5dw3G/cxjua8JsPwHDPOw2ytHCkwAAAABJRU5ErkJggg==";
		if (event._ongoing === 1 && !this._pinchSprites) {
			this._pinchSprites = [
				new PIXI.Sprite.fromImage(spriteImageString),
				new PIXI.Sprite.fromImage(spriteImageString),
				new PIXI.Sprite.fromImage(spriteImageString),
				new PIXI.Sprite.fromImage(spriteImageString)
			];
			this._pinchSprites.forEach((sprite, spriteIndex) => {
				sprite.anchor.set(0.5, 0.5);
				sprite.width = 50;
				sprite.height = 30;
				sprite.x = event._center.x;
				sprite.y = event._center.y;
				this._displayNode.addDisplayChild(sprite);

			});
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
			this._pinchSprites.forEach((sprite) => {
				sprite.parent.removeChild(sprite);
				sprite.destroy();
			});
			this._pinchSprites = undefined;
		}
	}

	stopAnimatingPinch() {
		if ((!this._state.getParamValue("pinch_enabled") || Object.keys(this._deviceTouches).length !== 2) && this._pinchSprites) {
			this._pinchSprites.forEach((sprite) => {
				sprite.parent.removeChild(sprite);
				sprite.destroy();
			});
			this._pinchSprites = undefined;
		}
	}

	animateRotate(event) {
		const stationaryImageString = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAHPCAMAAADNrcLzAAABdFBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wdlxEAAAAe3RSTlMAAQIDBAYHCgsODxARExQWFxgZGh4fIiMlJiotLjM1Njw+P0FDRUdITlBSVllaXF5kZWZna2xub3B2eXyAgYOLjI6TlpeeoaKnqKqrrLCys7W4ury9vsHExsvNzs/T1tfY293e4uTo6err7O7v8PHy8/X29/j5+vv8/f64yzDZAAAB4ElEQVR4AZTU61sMYQCG8btt2ywisZSVs005XM4pIpac5SyHUiwhhyjVev75rt2ZZmd33nfmnd/3+3q+PVgUrpLSw+XdpHJYekQamfeSjpLCeUmabsfZ5q+quYCzG6r7vhVHfSvy3MTRE/lW9+JkQIFnuMh+UMNxHFxWyFwHibb9UNgIiW6pya9uEhTX1Ow2CV6qRbWfWEOKeE2c3EdFnSTGqAwqnVj1LMpkDKsJGf3dhcX+/zK7h1nblGwOYnRaVm8zGHR+lt0ZDK4pxnyeiMKS4lwn4r5i/eulxSElmDScYGD6mzyvqmoo0eSsAn9GsrPyDPS/UWAmS0h+XhseFyAoyFz8qQ3DhIzLVxmEcAE77sq30EWgd0V1q+ObaC3g2Jw8ZQKTqpvaB4aC3NiyataK+Ere6Lk2zAX0PVfNCzzZGUm6sx2sBZz6IklD1F2SNHsEYgu2lKvSpxxA14KWrnSQVMCBd9IoQFlP94BDQfvw78UeKFZOgFsBOx9MwGAe9wJK3UCqYr19OSQCAAABGJiCHFj6J0MgMDjsz+5+IwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAjiLQiCIAiCIAiCIAiCIAiCIAiCIAgia4prNoP60kOVHfWKAAAAAElFTkSuQmCC";
		const rotatingImageString = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAHPCAMAAADNrcLzAAABdFBMVEUAAAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AABW/LiuAAAAe3RSTlMAAQIDBAYHCgsODxARExQWFxgZGh4fIiMlJiotLjM1Njw+P0FDRUdITlBSVllaXF5kZWZna2xub3B2eXyAgYOLjI6TlpeeoaKnqKqrrLCys7W4ury9vsHExsvNzs/T1tfY293e4uTo6err7O7v8PHy8/X29/j5+vv8/f64yzDZAAAB4ElEQVR4AZTU61sMYQCG8btt2ywisZSVs005XM4pIpac5SyHUiwhhyjVev75rt2ZZmd33nfmnd/3+3q+PVgUrpLSw+XdpHJYekQamfeSjpLCeUmabsfZ5q+quYCzG6r7vhVHfSvy3MTRE/lW9+JkQIFnuMh+UMNxHFxWyFwHibb9UNgIiW6pya9uEhTX1Ow2CV6qRbWfWEOKeE2c3EdFnSTGqAwqnVj1LMpkDKsJGf3dhcX+/zK7h1nblGwOYnRaVm8zGHR+lt0ZDK4pxnyeiMKS4lwn4r5i/eulxSElmDScYGD6mzyvqmoo0eSsAn9GsrPyDPS/UWAmS0h+XhseFyAoyFz8qQ3DhIzLVxmEcAE77sq30EWgd0V1q+ObaC3g2Jw8ZQKTqpvaB4aC3NiyataK+Ere6Lk2zAX0PVfNCzzZGUm6sx2sBZz6IklD1F2SNHsEYgu2lKvSpxxA14KWrnSQVMCBd9IoQFlP94BDQfvw78UeKFZOgFsBOx9MwGAe9wJK3UCqYr19OSQCAAABGJiCHFj6J0MgMDjsz+5+IwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAjiLQiCIAiCIAiCIAiCIAiCIAiCIAgia4prNoP60kOVHfWKAAAAAElFTkSuQmCC";
		if (event._ongoing === 1 && !this._rotateSprites && event._pointers.length === 2) {
			this._rotateSprites = {
				stationary : new PIXI.Sprite.fromImage(stationaryImageString),
				rotating : new PIXI.Sprite.fromImage(rotatingImageString)
			};

			this._rotateSprites.stationary.x = this._rotateSprites.rotating.x = event._center.x;
			this._rotateSprites.stationary.y = this._rotateSprites.rotating.y = event._center.y;
			this._rotateSprites.stationary.width = this._rotateSprites.rotating.width = 16;
			this._rotateSprites.stationary.height = this._rotateSprites.rotating.height = 150;
			this._rotateSprites.stationary.anchor.set(0.5, 0.5);
			this._rotateSprites.rotating.anchor.set(0.5, 0.5);
			this._rotateSprites.rotating._tint = 0xFF0000;
			this._rotateSprites.stationary._tint = 0x000000;
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
