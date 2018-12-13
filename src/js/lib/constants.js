export const LICENSE = __LICENSE__; // inserted by Webpack
export const VERSION = __VERSION__; // inserted by Webpack

export const ORIENTATION = Object.freeze({
	LANDSCAPE: "landscape",
	PORTRAIT: "portrait"
});

export const FULLSCREEN_STATES = Object.freeze({
	OFF: 0,
	ON: 1,
	POPUP: 2
});

export const SETTING_SCREENS = Object.freeze({
	ABOUT: "about",
	CONFIG: "config"
});

export const TAB_COLOR_MODES = Object.freeze({
	DARKEN: 0,
	LIGHTEN: 1,
	COLOR: 2
});
export const DEFAULT_BG = Object.freeze([0.964, 0.964, 0.964, 1]);
export const TAB_COLOR_CHANGE_AMT = 2;
