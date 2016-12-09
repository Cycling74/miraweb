import Store from "./base.js";
import * as SettingsActions from "../actions/settings.js";
import { toggleFullScreen } from "../lib/utils.js";
import { SETTING_SCREENS } from "../lib/constants.js";

class SettingsStore extends Store {
	constructor() {
		super();
		this._currentTab = "general";
		this._shown = false;

		this._settings = {
			fullscreen : false
		};

		// Attach Action Listeners
		this.listenTo(SettingsActions.switchTab, this._onSwitchTab.bind(this));
		this.listenTo(SettingsActions.toggleView, this._onToggleView.bind(this));
		this.listenTo(SettingsActions.changeSetting, this._onChangeSetting.bind(this));

		// Figure out vendor prefixing for proper fullscreen change event handler assignment
		let evtName;
		const fullScreenEvtNames = [
			"onwebkitfullscreenchange",
			"onmozfullscreenchange",
			"onmsfullscreenchange",
			"onfullscreenchange"
		];
		for (let i = 0, il = fullScreenEvtNames.length; i < il; i++) {
			if (document[fullScreenEvtNames[i]] === null) {
				evtName = fullScreenEvtNames[i];
				break;
			}
		}

		if (evtName) document[evtName] = this._onFullScreenChange.bind(this);
	}

	_onSwitchTab(tab) {
		this._currentTab = tab;
		this.triggerEvent("switch_tab");
	}

	_onToggleView(screen) {
		if (screen === undefined) {
			this._shown = this._shown ? false : SETTING_SCREENS.CONFIG;
		} else if (screen === false) {
			this._shown = false;
		} else if (screen === true) {
			this._shown = SETTING_SCREENS.CONFIG;
		} else {
			this._shown = screen;
		}
		this.triggerEvent("toggle_view");
	}

	_onFullScreenChange(evt) {
		const fullScreenEl = document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement	||
			document.msFullscreenElement;

		this._settings.fullscreen = !!fullScreenEl;
		this.triggerEvent("change_setting");
	}

	_onChangeSetting(name, value) {

		if (name === "fullscreen") {
			// We only toggle the fullscreen here but wait for the listener to fire in order to actually change
			// the setting when the transition happened
			toggleFullScreen();
			return;
		}

		this._settings[name] = value;
		this.triggerEvent("change_setting");
	}

	areShown() {
		return !!this._shown;
	}

	getShownScreen() {
		return this._shown;
	}

	getSelectedTab() {
		return this._currentTab;
	}

	getSettingState(name) {
		return this._settings[name];
	}

	getSettings() {
		return this._settings;
	}
}

export default new SettingsStore();
