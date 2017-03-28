import * as PatcherActions from "../actions/patcher.js";
import Store from "./base.js";
import { DEFAULT_BG } from "../lib/constants.js";
import toArray from "lodash/toArray.js";

class PatcherStore extends Store {

	constructor() {
		super();
		this._patchers = {};

		// Attach Action Listeners
		this.listenTo(PatcherActions.addPatcher, this._onAddPatcher.bind(this));
		this.listenTo(PatcherActions.changePatcher, this._onChangePatcher.bind(this));
		this.listenTo(PatcherActions.removePatcher, this._onRemovePatcher.bind(this));
		this.listenTo(PatcherActions.reset, this._onReset.bind(this));
	}

	_onAddPatcher(patcher) {
		if (!this.getPatcher(patcher.id)) this._patchers[patcher.id] = patcher;
		this.triggerEvent("patcher_added");
	}

	_onChangePatcher(patcher, param) {
		if (param.type === "editing_bgcolor" || param.type === "locked_bgcolor" || param.type === "locked") this.triggerEvent("patcher_tint", patcher);
	}

	_onRemovePatcher(patcher) {
		delete this._patchers[patcher.id];
		this.triggerEvent("patcher_removed");
	}

	_onReset() {
		const patchers = this.getPatchers();
		patchers.forEach((patcher) => {
			delete this._patchers[patcher.id];
		});

		this.triggerEvent("reset");
	}

	getPatcher(id) {
		return this._patchers[id] || null;
	}

	getBackgroundColorForFrame(frame) {
		if (!frame) return DEFAULT_BG;

		const frameBg = frame.getParamValue("color");
		if (!frameBg) return DEFAULT_BG;

		// no alpha applied
		if (frameBg.length < 4 || frameBg[3] === 1) return frameBg;

		// consider locked state of parentPatcher and apply bg color mixing accordingly
		const parentPatcher = this.getPatcher(frame.patcherId);
		if (!parentPatcher) return frameBg;

		const patcherBg = parentPatcher.bgColor;
		if (!patcherBg) return frameBg;

		const alpha = frameBg[3];
		const bgAlpha = 1 - alpha;
		return [
			alpha * frameBg[0] + bgAlpha * patcherBg[0],
			alpha * frameBg[1] + bgAlpha * patcherBg[1],
			alpha * frameBg[2] + bgAlpha * patcherBg[2],
			1
		];
	}

	getPatcherCount() {
		return Object.keys(this._patchers).length;
	}

	getPatchers() {
		return toArray(this._patchers);
	}
}

export default new PatcherStore();
