import ActiveFrameStore from "../stores/activeFrame.js";
import EventEmitter from "events";
import PixiUIObject from "../lib/pixiUiObject.js";
import { VIEW_MODES } from "xebra.js";
import PopoverActions from "../actions/popover.js";
import PopoverStore from "../stores/popover.js";

export default class MiraUIObject extends EventEmitter {

	constructor(stateObj) {
		super();

		this._state = stateObj;

		const doGestures = this.constructor.GESTURES === undefined ? false : this.constructor.GESTURES;

		this._displayNode = new PixiUIObject(this._state.id, this._state.getParamValue("zorder"), {
			gestures : doGestures,
			interactive : !stateObj.getParamValue("ignoreclick"),
			mask : this.constructor.MASK === undefined ? true : this.constructor.MASK
		});

		// attach event listeners
		this._displayNode.on("pointer_event", this._triggerEvent.bind(this));
		if (doGestures) this._displayNode.on("gesture_event", this._triggerEvent.bind(this));

		this._paramChangeFunc = this._onParameterChange.bind(this);
		this._state.on("param_changed", this._paramChangeFunc);

		this._paramsReady = true; // Changes to xebra.js mean that the object won't be added until all its params are in

		ActiveFrameStore.on("update_scale", this._onScaleChange.bind(this));
	}

	_getActiveFrameDimensions() {
		const scale = this._getActiveFrameScale();
		return  ActiveFrameStore.getDimensions().map((v) => {
			return Math.round(v * scale);
		});
	}

	_getActiveFrameScale() {
		return ActiveFrameStore.getScale();
	}

	_onParameterChange(stateObj, param) {
		// we just reposition the object
		if ((param.type === "presentation_rect" && ActiveFrameStore.getViewMode() === VIEW_MODES.PRESENTATION) ||
			(param.type === "patching_rect" && ActiveFrameStore.getViewMode() === VIEW_MODES.PATCHING)
		) {
			if (this._displayNode) {
				this.reposition();
				this.needsRender = true;
			}
			return;
		}

		if (param.type === "zorder") {
			this._displayNode.setZIndex(param.value);
			this.emit("zindex_changed");
			return;
		}

		// if the ignoreclick attr was set to true we make sure to reset all pointer handling state (if child objects supports it)
		if (param.type === "ignoreclick") {
			this._displayNode.setInteractive(!param.value);
			if (this.resetPointers) this.resetPointers();
			return;
		}

		// Hidden vs. visible
		if (param.type === "hidden") {
			if (param.value === 1) {
				this._displayNode.hide();
			} else {
				this._displayNode.show();
			}
			this.emit("toggle_hide", this);
			return;
		}

		// If we've reached this point, then the parameter is one of those that should invalidate
		// the cached text
		this.invalidateCachedText();

		if (!stateObj.getParamValue("hidden")) this.needsRender = true;
	}

	_onScaleChange() {
		if (this._displayNode) {
			this.reposition();
			this.needsRender = true;
		}
	}

	_getParams() {
		if (this.constructor.CACHES_PARAMS && this._cachedParams) return this._cachedParams;

		const params = {};

		// flatten rect for convenience and notice that we are passing
		// the Max rectangle here
		const rect = this.getMaxRect();
		params.x = rect[0];
		params.y = rect[1];
		params.width = rect[2];
		params.height = rect[3];

		// attach parameter by name
		this.paramNames.forEach((paramName) => {
			params[paramName] = this._state.getParamValue(paramName);
		});

		this._cachedParams = params;
		return params;
	}

	_triggerEvent(event) {
		if (!this[event.type] || this._state.getParamValue("ignoreclick")) return;

		this[event.type](event, this._getParams());
	}

	get cachedText() {
		return this._cachedText;
	}

	set cachedText(t) {
		this._cachedText = t;
	}

	get displayElement() {
		return this._displayNode ? this._displayNode.return_node() : null;
	}

	get id() {
		return this._state.id;
	}

	get interactionRect() {
		return this._interactionRect;
	}

	set interactionRect(r) {
		this._interactionRect = r;
	}

	get name() {
		return this.constructor.NAME;
	}

	get needsRender() {
		return this._needsRender;
	}

	set needsRender(yn) {
		this._needsRender = yn;
	}

	get paramNames() {
		return this._state.getParamTypes();
	}

	get paramsReady() {
		// we cached the value if we were ready once
		if (this._paramsReady) return true;


		const paramNames = this.paramNames;
		let flag = true;

		for (let i = 0, il = paramNames.length; i < il; i++) {

			// use == here as value might be null or undefined
			if (this._state.getParamValue(paramNames[i]) == null) { // eslint-disable-line
				if (!this.parameterIsOptional(paramNames[i])) {
					flag = false;
					break;
				}
			}
		}

		this._paramsReady = flag;
		return this._paramsReady;
	}

	get zIndex() {
		return this._state.getParamValue("zorder");
	}

	destroy() {
		this._state.removeListener("param_changed", this._paramChangeFunc);

		this._displayNode.destroy();
		this._displayNode = null;

		this.removeAllListeners();
	}

	getMaxRect() {
		return ActiveFrameStore.getViewMode() === VIEW_MODES.PRESENTATION ? this._state.getParamValue("presentation_rect") : this._state.getParamValue("patching_rect");
	}

	getRelativeRect(relativeTo) {
		const objRect = this.getScreenRect();
		return [
			objRect[0] - relativeTo[0],
			objRect[1] - relativeTo[1],
			objRect[2],
			objRect[3]
		];
	}

	getScreenRect() {
		const rect = this.getMaxRect();
		const scale = this._getActiveFrameScale();

		return rect.map((v) => {
			return Math.round(v * scale);
		});
	}

	hidePopover() {
		PopoverActions.hidePopover( this._state.id );
	}

	interactionCoordsForEvent(e) {
		if (!this.interactionRect) return null;

		const scale = this._getActiveFrameScale();
		return [
			(e.targetX / scale - this.interactionRect[0]) / this.interactionRect[2],
			(e.targetY / scale - this.interactionRect[1]) / this.interactionRect[3]
		];
	}

	invalidateCachedText() {
		if (this._cachedText) {
			this._cachedText.parent.removeChild(this._cachedText);
			this._cachedText = null;
		}
	}

	isPopoverVisible() {
		return PopoverStore.isPopoverVisibleForId( this._state.id );
	}

	parameterIsOptional(paramName) {
		return false;
	}

	popover() {
		return PopoverStore.popoverForId( this._state.id );
	}

	render() {
		if (!this.paint || !this.paramsReady) return;

		// Fetch fresh params each time we render
		this._cachedParams = null;

		const screenRect = this.getScreenRect();
		if (this._lastPaintedWidth !== screenRect[2] || this._lastPaintedHeight !== screenRect[3]) {
			this.invalidateCachedText();
		}

		this._displayNode.clear();
		this.paint(this._displayNode, this._getParams());
		this.emit("render", this);

		this._lastPaintedWidth = screenRect[2];
		this._lastPaintedHeight = screenRect[3];
		this._needsRender = false;
	}

	reposition() {
		if (this._displayNode) {
			const canvasRect = this.getRelativeRect(this._getActiveFrameDimensions());
			this._displayNode.setRect(canvasRect);
			if (PopoverStore.isPopoverVisibleForId(this._state.id)) PopoverActions.movePopover(this._state.id, canvasRect);
		}
	}

	setParamValue(param, value) {
		this._state.setParamValue(param, value);
	}

	showPopover(type, description) {
		PopoverActions.showPopover(
			this._state.id,
			type,
			description,
			this.getRelativeRect(this._getActiveFrameDimensions())
		);
	}

	updatePopover(description) {
		PopoverActions.updatePopover(
			this._state.id,
			description
		);
	}
}
