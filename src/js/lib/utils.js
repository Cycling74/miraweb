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
