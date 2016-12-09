import "add-to-homescreen";
/* global addToHomescreen */

const VENDOR_PREFIXES = [
	"moz",
	"webkit",
	"ms"
];

const homescreenAppPrompt = addToHomescreen({
	autostart : false,
	message : "iOS can only go fullscreen as a mobile app. To add this web app to the home screen: tap %icon and then <strong>Add to Home Screen</strong>.",
	modal : true,
	startDelay : 0
});
export { homescreenAppPrompt };

export function capitalize(text) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

function toPrefixed(prop) {
	const upperCaseProp = capitalize(prop);
	const props = [prop];
	VENDOR_PREFIXES.forEach((prefix) => {
		props.push([prefix, upperCaseProp].join(""));
	});
	return props;
}

export function toRad(degrees) {
	return degrees * Math.PI / 180;
}

export function displaysHomescreenAppPrompt() {
	return homescreenAppPrompt.session !== undefined;
}

export function ensureWithin(value, min, max) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

export const LIVE_UNIT_STYLES = Object.freeze({
	LIVE_UNIT_INT : "Int",
	LIVE_UNIT_FLOAT : "Float",
	LIVE_UNIT_TIME : "Time",
	LIVE_UNIT_HZ : "Hertz",
	LIVE_UNIT_DB : "deciBel",
	LIVE_UNIT_PERCENT : "%",
	LIVE_UNIT_PAN : "Pan",
	LIVE_UNIT_SEMITONES : "Semitones",
	LIVE_UNIT_MIDI : "MIDI",
	LIVE_UNIT_CUSTOM : "Custom",
	LIVE_UNIT_NATIVE : "Native"
});

export function stringForLiveValue(liveValue, unitStyle) {
	let outVal = null;
	let dRes;
	let mRes;
	let notes;

	switch ( unitStyle ) {
		case exports.LIVE_UNIT_STYLES.LIVE_UNIT_INT:
			outVal = `${Math.round(liveValue)}`;
			break;
		case exports.LIVE_UNIT_STYLES.LIVE_UNIT_FLOAT:
			outVal = (liveValue).toFixed(2);
			break;
		case exports.LIVE_UNIT_STYLES.LIVE_UNIT_TIME:
			if (liveValue >= 10000) {
				outVal = (liveValue / 1000).toFixed(1) + " s";
			} else if (liveValue >= 1000) {
				outVal = (liveValue / 1000).toFixed(2) + " s";
			} else if (liveValue >= 100) {
				outVal = `${Math.round(liveValue)} ms`;
			} else if (liveValue >= 10) {
				outVal = (liveValue).toFixed(1) + " ms";
			} else {
				outVal = (liveValue).toFixed(2) + " ms";
			}
			break;
		case exports.LIVE_UNIT_STYLES.LIVE_UNIT_HZ:
			if (liveValue >= 10000) {
				outVal = (liveValue / 1000).toFixed(1) + " kHz";
			} else if (liveValue >= 1000) {
				outVal = (liveValue / 1000).toFixed(2) + " kHz";
			} else if (liveValue >= 100) {
				outVal = `${Math.round(liveValue)} Hz`;
			} else if (liveValue >= 10) {
				outVal = (liveValue).toFixed(1) + " Hz";
			} else {
				outVal = (liveValue).toFixed(2) + " Hz";
			}
			break;
		case exports.LIVE_UNIT_STYLES.LIVE_UNIT_DB:
			if (Math.abs(liveValue) >= 10) {
				outVal = `${Math.round(liveValue)} dB`;
			} else {
				outVal = (liveValue).toFixed(1) + " dB";
			}
			break;
		case exports.LIVE_UNIT_STYLES.LIVE_UNIT_PERCENT:
			if (Math.abs(liveValue) >= 100) {
				outVal = `${Math.round(liveValue)} ` + " %";
			} else if (Math.abs(liveValue) >= 10) {
				outVal = (liveValue).toFixed(1) + " %";
			} else {
				outVal = (liveValue).toFixed(2) + " %";
			}
			break;
		case exports.LIVE_UNIT_STYLES.LIVE_UNIT_PAN:
			if (liveValue === 0) {
				outVal = "C";
			} else if (liveValue > 0) {
				outVal = `${Math.round(liveValue)}R`;
			} else {
				outVal = `${Math.round(liveValue)}L`;
			}
			break;
		case exports.LIVE_UNIT_STYLES.LIVE_UNIT_SEMITONES:
			liveValue = Math.round(liveValue);
			if (liveValue === 0) {
				outVal = "0 st";
			} else if (liveValue > 0) {
				outVal = `+${liveValue} st`;
			} else {
				outVal = `${liveValue} st`;
			}
			break;
		case exports.LIVE_UNIT_STYLES.LIVE_UNIT_MIDI:
			liveValue = Math.round(liveValue);
			dRes = Math.floor(liveValue / 12);
			mRes = liveValue - (dRes * 12);
			notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
			outVal = `${notes[mRes]}${dRes - 2}`;
			if (liveValue > 127) outVal = "+";
			if (liveValue < 0) outVal = "-";
			break;
		case exports.LIVE_UNIT_STYLES.LIVE_UNIT_CUSTOM:
		case exports.LIVE_UNIT_STYLES.LIVE_UNIT_NATIVE:
			outVal = (liveValue).toFixed(2);
			break;
		default:
			console.log("Unsupported Live unit style", unitStyle);
	}
	return outVal;
}

export function supportsFullScreen() {
	const props = toPrefixed("requestFullscreen");
	const docEl = window.document.documentElement;
	let supports = false;

	for (let i = 0, il = props.length; i < il; i++) {
		if (docEl[props[i]]) {
			supports = true;
			break;
		}
	}

	return supports;
}

export function toggleFullScreen() {
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
