import assign from "lodash/assign.js";
import Store from "./base.js";
import * as SettingsActions from "../actions/settings.js";

import { supportsFullScreen, supportsiOSHomeScreenApp } from "../lib/utils.js";
import { DEFAULT_BG, FULLSCREEN_STATES, SETTING_SCREENS, TAB_COLOR_MODES } from "../lib/constants.js";
import { VIEW_MODES } from "xebra.js";

import * as Storage from "../lib/storage.js";

const SETTINGS_STORAGE_KEY = "__mw_settings__";

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

		let storedSettings = Storage.read(SETTINGS_STORAGE_KEY);
		if (storedSettings instanceof Error || !storedSettings ) storedSettings = {};
		this._settings = assign({
			name : "",
			fullscreen : FULLSCREEN_STATES.OFF,
			tabColorMode : TAB_COLOR_MODES.DARKEN,
			tabColor : DEFAULT_BG,
			viewMode : VIEW_MODES.LINKED
		}, storedSettings);

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
		this.triggerEvent("change_setting", "fullscreen", this._settings.fullscreen);
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

		if (name !== "fullscreen") {
			const keys = Object.keys(this._settings);
			const toStore = {};
			for (let i = 0, il = keys.length; i < il; i++) {
				const key = keys[i];
				if (key !== "fullscreen") toStore[key] = this._settings[key];
			}
			Storage.write(SETTINGS_STORAGE_KEY, toStore);
		}

		this.triggerEvent("change_setting", name, v);
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
