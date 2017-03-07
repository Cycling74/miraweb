import { LIVE_UNIT_STYLES } from "../lib/constants.js";

function stringForLiveValue(liveValue, unitStyle) {
	if (liveValue === undefined || unitStyle === undefined) return "";

	let outVal = null;

	switch (unitStyle) {
		case LIVE_UNIT_STYLES.LIVE_UNIT_INT:
			outVal = `${Math.round(liveValue)}`;
			break;
		case LIVE_UNIT_STYLES.LIVE_UNIT_FLOAT:
			outVal = (liveValue).toFixed(2);
			break;
		case LIVE_UNIT_STYLES.LIVE_UNIT_TIME:
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
		case LIVE_UNIT_STYLES.LIVE_UNIT_HZ:
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
		case LIVE_UNIT_STYLES.LIVE_UNIT_DB:
			if (Math.abs(liveValue) >= 10) {
				outVal = `${Math.round(liveValue)} dB`;
			} else {
				outVal = (liveValue).toFixed(1) + " dB";
			}
			break;
		case LIVE_UNIT_STYLES.LIVE_UNIT_PERCENT:
			if (Math.abs(liveValue) >= 100) {
				outVal = `${Math.round(liveValue)} %`;
			} else if (Math.abs(liveValue) >= 10) {
				outVal = (liveValue).toFixed(1) + " %";
			} else {
				outVal = (liveValue).toFixed(2) + " %";
			}
			break;
		case LIVE_UNIT_STYLES.LIVE_UNIT_PAN:
			if (liveValue === 0) {
				outVal = "C";
			} else if (liveValue > 0) {
				outVal = `${Math.round(liveValue)}R`;
			} else {
				outVal = `${Math.round(liveValue)}L`;
			}
			break;
		case LIVE_UNIT_STYLES.LIVE_UNIT_SEMITONES: {
			const val = Math.round(liveValue);
			if (val === 0) {
				outVal = "0 st";
			} else if (val > 0) {
				outVal = `+${val} st`;
			} else {
				outVal = `${val} st`;
			}
			break;
		} case LIVE_UNIT_STYLES.LIVE_UNIT_MIDI: {
			const val = Math.round(liveValue);
			let dRes = Math.floor(val / 12);
			let mRes = val - (dRes * 12);
			let notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
			outVal = `${notes[mRes]}${dRes - 2}`;
			if (val > 127) outVal = "+";
			if (val < 0) outVal = "-";
			break;
		}
		case LIVE_UNIT_STYLES.LIVE_UNIT_CUSTOM:
		case LIVE_UNIT_STYLES.LIVE_UNIT_NATIVE:
			outVal = (liveValue).toFixed(2);
			break;
		default:
			outVal = "";
	}
	return outVal;
}

/**
 * Adds a virtual, readonly "displayvalue" parameter to the object in order to simplify reading the different display
 * and unit styles of certain live objects.
 *
 * For example, if the value of the "distance" parameter is 0.5, then depending on the configuration of the object, the
 * "displayvalue" parameter could be "400 Hz" or "C3#".
 *
 * This mixin is currently added to ObjectNodes representing live.dial, live.numbox and live.slider objects.
 *
 * @mixin LiveDisplayValueMixin
 * @example
 * // dialNode is the ObjectNode for the live.dial
 * dialNode.setParamValue("_parameter_range", [10, 20]);
 * dialNode.setParamValue("_parameter_exponent", 1);
 * dialNode.setParamValue("distance", 0.5);
 * dialNode.setParamValue("_parameter_unitstyle", "Pan");
 * dialNode.getParamValue("displayvalue"); // returns "15R"
 *
 * dialNode.setParamValue("_parameter_unitstyle", "Semitones");
 * dialNode.getParamValue("displayvalue"); // returns "+ 15 st"
 *
 * @see Xebra.LIVE_UNIT_STYLES
 */
export default (objClass) => class extends objClass {
	/**
	 * Returns the value for the parameter specified by the given parameter type identifier.
	 * @param  {string} type Parameter type identifier
	 * @return {Xebra.ParamValueType}
	 * @ignore
	 * @override
	 * @memberof LiveDisplayValueMixin
	 * @instance
	*/
	getParamValue(type) {
		if (type === "displayvalue") {
			const val = this.getParamValue("value");
			const unitStyle = this.getParamValue("_parameter_unitstyle");
			return stringForLiveValue(val, unitStyle);
		}
		return super.getParamValue(type);
	}

	/**
	 * Adds the virtual displayvalue parameter to the paramTypes array
 	 * @ignore
 	 * @override
 	 * @memberof LiveDisplayValueMixin
 	 * @instance
	 */
	getParamTypes() {
		return super.getParamTypes().concat("displayvalue");
	}

	/**
	 * Adds the virtual displayvalue parameter to the optionalParamTypes array
 	 * @ignore
 	 * @override
 	 * @memberof LiveDisplayValueMixin
 	 * @instance
	 */
	getOptionalParamTypes() {
		return super.getOptionalParamTypes().concat("displayvalue");
	}
};
