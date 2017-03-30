import * as ActiveFrameActions from "../actions/activeFrame.js";
import * as FrameActions from "../actions/frame.js";
import ActiveFrameStore from "./activeFrame.js";
import SettingsStore from "./settings.js";
import Store from "./base.js";
import findIndex from "lodash/findIndex.js";
import toArray from "lodash/toArray.js";

const NONE_ORDER = "<none>";

class FrameStore extends Store {

	constructor() {
		super();

		this._frames = {};

		// Attach Action Listeners
		this.listenTo(FrameActions.addFrame, this._onAddFrame.bind(this));
		this.listenTo(FrameActions.changeFrame, this._onChangeFrame.bind(this));
		this.listenTo(FrameActions.removeFrame, this._onRemoveFrame.bind(this));
		this.listenTo(FrameActions.reset, this._onReset.bind(this));
		SettingsStore.on("change_setting", this._onSetGlobalViewMode.bind(this));
	}

	_onAddFrame(frame) {
		if (!this.getFrame(frame.id)) this._frames[frame.id] = frame;

		// the viewMode to our global view mode
		frame.viewMode = SettingsStore.getSettingState("viewMode");

		if (!ActiveFrameStore.hasActiveFrame()) ActiveFrameActions.set(frame);

		this.triggerEvent("frame_added");
	}

	_onChangeFrame(frame, param) {
		if (param.type === "taborder") this.triggerEvent("frame_resort");
		if (param.type === "tabname") this.triggerEvent("frame_rename");
		if (param.type === "color") this.triggerEvent("frame_tint");
		if (param.type === "mira_focus" && param.value === 1) ActiveFrameActions.set(frame);
	}

	_onRemoveFrame(frame) {
		if (ActiveFrameStore.isActiveFrame(frame)) {
			ActiveFrameActions.unset();

			const frames = this.getFrames();

			// we got more frames?
			if (frames.length > 1) {
				const activeIndex = findIndex(frames, function(f) {
					return f.id === frame.id;
				});


				const newActiveIndex = frames.length > activeIndex + 1 ? activeIndex + 1 : activeIndex - 1;
				ActiveFrameActions.set(frames[newActiveIndex]);
			}
		}

		delete this._frames[frame.id];
		this.triggerEvent("frame_removed");
	}

	_onReset() {
		const frames = this.getFrames();
		frames.forEach(function(frame) {
			delete this._frames[frame.id];
		}.bind(this));

		this.triggerEvent("reset");
	}

	_onSetGlobalViewMode(setting, mode) {
		if (setting === "viewMode") {
			this.getFrames().forEach(function(frame) {
				frame.viewMode = mode;
			});
		}
	}

	getFrame(id) {
		return this._frames[id] || null;
	}

	getFrameCount() {
		return Object.keys(this._frames).length;
	}

	getFrames() {
		const frames = toArray(this._frames);

		frames.sort(function(a, b) {

			// check if we've got tabindex values
			const indexA = a.getParamValue("taborder");
			const indexB = b.getParamValue("taborder");

			if (indexA !== NONE_ORDER && indexB !== NONE_ORDER) {
				if (indexA < indexB) return -1;
				if (indexA > indexB) return 1;
			} else if (indexA === NONE_ORDER) {
				return -1;
			} else if (indexB === NONE_ORDER) {
				return 1;
			}

			// sort by patch
			if (a.patcherId < b.patcherId) return -1;
			if (a.patcherId > b.patcherId) return 1;

			// last but not least use the creation sequence number
			if (a.creationSequence < b.creationSequence) return -1;
			if (a.creationSequence > b.creationSequence) return 1;

			return 0; // should never happen
		});

		return frames;
	}
}

export default new FrameStore();
