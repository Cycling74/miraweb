import Store from "./base.js";
import * as SettingsActions from "../actions/settings.js";

import { supportsFullScreen, supportsiOSHomeScreenApp } from "../lib/utils.js";
import { FULLSCREEN_STATES, SETTING_SCREENS } from "../lib/constants.js";


function toggleFullScreen() {
	const doc = window.document;
	const docEl = doc.documentElement;

	const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
	const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

	if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
		requestFullScreen.call(docEl);
	} else {
		cancelFullScreen.call(doc);
	}
}

class SettingsStore extends Store {
	constructor() {
		super();
		this._currentTab = "general";
		this._shown = false;

		this._settings = {
			fullscreen : FULLSCREEN_STATES.OFF
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

		this._settings.fullscreen = fullScreenEl ? FULLSCREEN_STATES.ON : FULLSCREEN_STATES.OFF;
		this.triggerEvent("change_setting");
	}

	_onChangeSetting(name, value) {
		let v = value;

		if (name === "fullscreen" && v === FULLSCREEN_STATES.ON) {

			// We only toggle the fullscreen here but wait for the listener to fire in order to actually change
			// the setting when the transition happened
			if (supportsFullScreen()) {
				toggleFullScreen();
				return;
			}

			// iOS can't do fullscreen BUT Homescreen! So trigger the PopUp to be displayed
			if (supportsiOSHomeScreenApp()) {
				v = FULLSCREEN_STATES.POPUP;
			}
		}

		this._settings[name] = v;
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
