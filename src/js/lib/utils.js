import bowser from "bowser";

const VENDOR_PREFIXES = [
	"moz",
	"webkit",
	"ms"
];

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

export function ensureWithin(value, min, max) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

export function supportsFullScreen() {

	// first check for FullscreenAPI support
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

export function runningFromHomeScreen() {
	return window.navigator.standalone;
}

export function isiOSDevice() {
	return bowser.ios;
}

export function whichiOSDevice() {
	if (!isiOSDevice()) return null;
	const devices = ["ipad", "iphone", "ipod"];
	for (let i = 0, il = devices.length; i < il; i++) {
		if (bowser[devices[i]]) return devices[i];
	}

	return null;
}

export function supportsiOSHomeScreenApp() {
	return isiOSDevice();
}

export function showFullScreenToggle() {
	return !runningFromHomeScreen() && (supportsFullScreen() || supportsiOSHomeScreenApp());
}
