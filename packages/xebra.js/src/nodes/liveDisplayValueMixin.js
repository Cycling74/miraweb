import { LIVE_VALUE_TYPES, LIVE_UNIT_STYLES } from "../lib/constants.js";
import { PARAMETER_ATTR } from "../lib/objectList.js";
import { sprintf } from "sprintf-js";

function stringForLiveValue(liveValue, unitStyle, paramValueType, customUnit) {
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
			if (Math.abs(liveValue) >= 100 || paramValueType === LIVE_VALUE_TYPES.INT) {
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

			if (customUnit.indexOf("%") >= 0) {
				// wrap in try catch here in order to catch invalid sprintf format strings
				try {
					outVal = sprintf(customUnit, liveValue);
				} catch (e) {
					outVal = customUnit;
				}
			} else {
				outVal = `${paramValueType === LIVE_VALUE_TYPES.INT ? Math.round(liveValue) : (liveValue).toFixed(2)} ${customUnit}`;
			}

			break;

		case LIVE_UNIT_STYLES.LIVE_UNIT_NATIVE:
			outVal = paramValueType === LIVE_VALUE_TYPES.INT ? Math.round(liveValue) : (liveValue).toFixed(2);
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

			const paramValueType = this.getParamValue(PARAMETER_ATTR.TYPE);
			const val = this.getParamValue("value");

			if (paramValueType === LIVE_VALUE_TYPES.ENUM) {
				const enums = this.getParamValue(PARAMETER_ATTR.RANGE);

				const roundedVal = Math.round(val);

				if (!enums.length) return "";

				if (roundedVal <= 0) return enums[0];
				if (roundedVal >= enums.length) return enums[enums.length - 1];

				return enums[roundedVal];
			}

			return stringForLiveValue(val, this.getParamValue(PARAMETER_ATTR.UNIT_STYLE), paramValueType, this.getParamValue(PARAMETER_ATTR.CUSTOM_UNITS));
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
