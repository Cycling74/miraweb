import * as ActiveFrameActions from "../actions/activeFrame.js";
import * as FrameActions from "../actions/frame.js";
import * as PatcherActions from "../actions/patcher.js";
import * as SettingsActions from "../actions/settings.js";
import * as XebraStateActions from "../actions/xebraState.js";
import Store from "./base.js";
import Motion from "../lib/motion.js";
import assign from "lodash/assign.js";
import forOwn from "lodash/forOwn.js";
import { State, CONNECTION_STATES, MOTION_TYPES } from "xebra.js";

class XebraStateStore extends Store {
	constructor() {
		super();

		this._state = null;
		this._supportedObjects = {};
		this._cachedName = null;

		this._onHandleMotionData = this._onHandleMotionData.bind(this);

		this.listenTo(XebraStateActions.changeClientName, this._onChangeClientName.bind(this));
		this.listenTo(XebraStateActions.connect, this._connect.bind(this));
		this.listenTo(XebraStateActions.disconnect, this._onDisconnect.bind(this));
		this.listenTo(XebraStateActions.init, this._init.bind(this));
		this.listenTo(XebraStateActions.setSupportedObjects, this._setSupportedObjects.bind(this));
	}

	_init(options) {

		// gotta clean up first?!
		if (this._state) this._onDisconnect();

		this._state = new State(assign({
			auto_connect : false,
			supported_objects : this._supportedObjects
		}, options));

		this._state.on("frame_added", FrameActions.addFrame);
		this._state.on("frame_changed", FrameActions.changeFrame);
		this._state.on("frame_removed", FrameActions.removeFrame);

		this._state.on("patcher_added", PatcherActions.addPatcher);
		this._state.on("patcher_changed", PatcherActions.changePatcher);
		this._state.on("patcher_removed", PatcherActions.removePatcher);

		this._state.on("loaded", this._onStateLoaded.bind(this));
		this._state.on("reset", () => {
			ActiveFrameActions.unset();
			FrameActions.reset();
			PatcherActions.reset();
			this.triggerEvent("reset");
		});

		this._state.on("connection_changed", this._onConnectionStateChange.bind(this));
		this._state.on("motion_enabled", this._onMotionEnabled.bind(this));
		this._state.on("motion_disabled", this._onMotionDisabled.bind(this));
	}

	_onChangeClientName(name) {
		this._cachedName = name;
		if (this._state) this._state.name = name;
		this.triggerEvent("name_change");
	}

	_onDisconnect() {
		if (this._state) this._state.close();
		this._state = null;

		ActiveFrameActions.unset();
		FrameActions.reset();
		SettingsActions.toggleView(false);
		this.triggerEvent("reset");
	}

	_connect() {
		if (this._state) this._state.connect();
	}

	_onConnectionStateChange(status) {
		// reapply cached name once we are connected
		if (status === CONNECTION_STATES.CONNECTED && this._cachedName && this._state.name !== this._cachedName) {
			this._state.name = this._cachedName;
		}

		this.triggerEvent("connection_change");
	}

	_onHandleMotionData(data) {
		if (this._state) {
			forOwn(data, (value, key) => {
				this._state.sendMotionData( XebraStateStore.motionTypeForKey[key], ...value );
			});
		}
	}

	_onMotionEnabled() {
		Motion.on("motion", this._onHandleMotionData);
	}

	_onMotionDisabled() {
		Motion.removeListener("motion", this._onHandleMotionData);
	}

	_onStateLoaded() {
		this.triggerEvent("loaded");
	}

	_setSupportedObjects(objs) {
		this._supportedObjects = objs;
	}

	getConnectionState() {
		if (!this._state) return CONNECTION_STATES.INIT;
		return this._state.connectionState;
	}

	getConnectionInfo() {
		return this._state ? this._state.wsUrl : "";
	}

	getIsStateLoaded() {
		return this._state ? this._state.isStateLoaded : false;
	}

	getUuid() {
		return this._state ? this._state.uuid : "";
	}

	getName() {
		return this._state ? this._state.name : "";
	}

	getPatcher(id) {
		if (!this._state) return null;
		return this._state.getPatcherById(id);
	}

	getXebraVersion() {
		return this._state ? this._state.xebraVersion : "";
	}

	getXebraUuid() {
		return this._state ? this._state.xebraUuid : -1;
	}
}

XebraStateStore.motionTypeForKey = Object.freeze({
	accel : MOTION_TYPES.ACCEL,
	gravity : MOTION_TYPES.GRAVITY,
	orientation : MOTION_TYPES.ORIENTATION,
	rawaccel : MOTION_TYPES.RAWACCEL,
	rotationrate : MOTION_TYPES.ROTATIONRATE
});

export default new XebraStateStore();
