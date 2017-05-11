import { LIVE_VALUE_TYPES } from "../lib/constants.js";
import { OBJECTS, PARAMETER_ATTR } from "../lib/objectList.js";

function clamp(v, lo, hi) {
	return v < hi ? v > lo ? v : lo : hi;
}

function alignStep(min, max, value, steps) {
	const range = max - min;
	const singleStep = range / steps;
	return Math.floor(value / singleStep) * singleStep;
}

/**
 * Certain live.* objects, for example live.slider and live.dial, manage their internal state using two separate but
 * related parameters: "distance" and "value". The "distance" parameter is always a value between 0 and 1, ignoring the
 * range and possible nonlinear scaling applied to the object. The "value" parameter is the one that the object will
 * display, and is computed by applying the exponent and range parameters to the "distance" parameter. This mixin
 * simply performs this calculation automatically whenever the "distance" parameter is set.
 *
 * @mixin LiveScalingObjectMixin
 * @example
 * // dialNode is the ObjectNode for the live.dial
 * dialNode.setParamValue("_parameter_range", [10, 20]);
 * dialNode.setParamValue("_parameter_exponent", 1);
 * dialNode.setParamValue("distance", 0.5);
 * dialNode.getParamValue("value"); // returns 15
 *
 * dialNode.setParamValue("_parameter_exponent", 2);
 * dialNode.getParamValue("value"); // returns 12.5
 */
export default (objClass) => class extends objClass {

	constructor(id, type, creationSeq, patcherId) {
		super(...arguments);
		this._ignoredValueSeq = 0;
	}

	/**
	 * @ignore
	 * @override
	 * @memberof LiveScalingObjectMixin
	 * @instance
	 */
	setParamValue(type, value) {
		// Handle live.slider and live.dial distance
		if (type === "distance") {

			const distParam = this._getParamForType(type);

			if (!distParam) return;

			let dist = clamp(value, 0, 1);

			const parameterType = this.getParamValue(PARAMETER_ATTR.TYPE);
			const parameterSteps = this.getParamValue(PARAMETER_ATTR.STEPS);

			let [min, max] = this.getParamValue(PARAMETER_ATTR.RANGE);

			// Steps and enum handler
			if (parameterType === LIVE_VALUE_TYPES.ENUM) {
				[min, max] = [0, this.getParamValue(PARAMETER_ATTR.RANGE).length - 1];
				dist = alignStep(0, 1, dist, max);
			} else if (parameterSteps > 1) {
				dist = alignStep(0, 1, dist, parameterSteps - 1);
			} else if (parameterType === LIVE_VALUE_TYPES.INT) {
				dist = alignStep(0, 1, dist, max - min);
			}

			// set distance
			distParam.value = dist;

			// calc and set scaled value
			const valueParam = this._getParamForType("value");
			if (!valueParam) return;

			let expDist = dist;
			const pExpo = this.getParamValue(PARAMETER_ATTR.EXPONENT) || 1;
			if (pExpo !== 1) expDist = Math.pow(expDist, pExpo);

			let val = (expDist * (max - min)) + min;
			if (parameterType !== LIVE_VALUE_TYPES.FLOAT) val = Math.round(val);

			valueParam.modify(val, valueParam.types, valueParam.remoteSequence + 1);

		}
		// Handle live.numbox
		else if (type === "value" && this.type === OBJECTS.LIVE_NUMBOX) {

			const parameterType = this.getParamValue(PARAMETER_ATTR.TYPE);
			const parameterSteps = this.getParamValue(PARAMETER_ATTR.STEPS);

			const [min, max] = parameterType === LIVE_VALUE_TYPES.ENUM ? [0, this.getParamValue(PARAMETER_ATTR.RANGE).length - 1] : this.getParamValue(PARAMETER_ATTR.RANGE);
			let val = clamp(value, min, max);

			if (parameterType === LIVE_VALUE_TYPES.ENUM) {
				val = alignStep(min, max, val, max);
			} else if (parameterSteps > 1) {
				val = alignStep(min, max, val, parameterSteps - 1);
			} else {
				val = Math.round(val);
			}

			const param = this._getParamForType(type);
			if (param) param.value = val;

		} else {
			super.setParamValue(type, value);
			return;
		}
	}
};
