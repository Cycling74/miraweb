import * as ActiveFrameActions from "../actions/activeFrame.js";
import * as UIObjectActions from "../actions/uiObject.js";
import Store from "./base.js";
import { VIEW_MODES } from "xebra.js";

class ActiveFrameStore extends Store {

	constructor() {
		super();

		this._frame = null;
		this._scaleFactor = 1.0;
		this._resolution = window.devicePixelRatio || 1;

		// Attach Action Listeners
		this.listenTo(ActiveFrameActions.change, this._onFrameChanged.bind(this));
		this.listenTo(ActiveFrameActions.changeViewMode, this._onFrameViewModeChanged.bind(this));
		this.listenTo(ActiveFrameActions.setDOMRect, this._onSetDOMRect.bind(this));
		this.listenTo(ActiveFrameActions.setScale, this._onSetScale.bind(this));
		this.listenTo(ActiveFrameActions.set, this._onSetActiveFrame.bind(this));

		this.listenTo(ActiveFrameActions.unset, this._onUnsetActiveFrame.bind(this));
	}

	_onFrameChanged(frame, param) {
		if ((this._frame.viewMode === VIEW_MODES.PATCHING && param.type === "patching_rect") ||
			(this._frame.viewMode === VIEW_MODES.PRESENTATION && param.type === "presentation_rect")
		) {
			this.triggerEvent("resize");
		}
	}

	_onFrameViewModeChanged() {
		this.triggerEvent("viewmode_change");
	}

	_onSetActiveFrame(frame) {
		if (this.isActiveFrame(frame)) return;
		if (this.hasActiveFrame()) this._onUnsetActiveFrame();

		// attach event listeners
		frame.on("object_added", UIObjectActions.addObject);
		frame.on("object_removed", UIObjectActions.removeObject);
		frame.on("param_changed", ActiveFrameActions.change);
		frame.on("viewmode_change", ActiveFrameActions.changeViewMode);

		this._frame = frame;
		UIObjectActions.setObjects(this._frame.getObjects());

		this.triggerEvent("set");
	}

	_onSetDOMRect(rect) {
		this._domRect = rect;
		this.triggerEvent("update_dom_rect", this._domRect);
	}

	_onSetScale(factor) {
		this._scaleFactor = factor;
		this.triggerEvent("update_scale", this._scaleFactor);
	}

	_onUnsetActiveFrame() {
		if (this._frame) {

			this._frame.removeListener("object_removed", UIObjectActions.removeObject);
			this._frame.removeListener("param_changed", ActiveFrameActions.change);
			this._frame.removeListener("object_added", UIObjectActions.addObject);
			this._frame.removeListener("viewmode_change", ActiveFrameActions.changeViewMode);

			this._frame = null;
			UIObjectActions.clear();
			this.triggerEvent("unset");
		}
	}

	/**
	 * Maps x and y coords in the DOM frame to global PIXI view coords. The resulting value is stored in the point.
	 * Since the PIXI renderer is at the same scale as the canvas, this function ignores scaling
	 *
	 * @param  {number} x     the x coord of the position to map
	 * @param  {number} y     the y coord of the position to map
	 */
	mapPositionToPoint(x, y) {
		const point = {};
		const rect = this._domRect;

		point.x = ( x - rect.left );
		point.y = ( y - rect.top );
		return point;
	}

	getFrame() {
		return this._frame || null;
	}

	getDimensions() {
		if (!this.hasActiveFrame()) return null;

		if (this._frame.viewMode === VIEW_MODES.PATCHING) return this._frame.getParamValue("patching_rect");
		if (this._frame.viewMode === VIEW_MODES.PRESENTATION) return this._frame.getParamValue("presentation_rect");

		return null;
	}

	getResolution() {
		return this._resolution;
	}

	getScale() {
		return this._scaleFactor;
	}

	getViewMode() {
		return this._frame ? this._frame.viewMode : null;
	}

	hasActiveFrame() {
		return !!this._frame;
	}

	isActiveFrame(frame) {
		return this.hasActiveFrame() && this._frame.id === frame.id;
	}
}

// There can only be one
export default new ActiveFrameStore();
