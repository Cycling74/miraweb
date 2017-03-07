function clamp(v, lo, hi) {
	return v < hi ? v > lo ? v : lo : hi;
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

	// Bound callbacks using fat arrow notation

	/**
	 * Callback for handling scaling related parameter events
	 * @private
	 */
	_onParamSetForScaling = (param) => {
		if (param.type === "distance") {
			let dist = clamp(param.value, 0, 1);
			const [min, max] = this.getParamValue("_parameter_range");
			const pExpo = this.getParamValue("_parameter_exponent") || 1;

			if (pExpo !== 1) dist = Math.pow(dist, pExpo);
			const val = (dist * (max - min)) + min;
			const valueParam = this._getParamForType("value");
			if (valueParam) valueParam.modify(val, valueParam.types, valueParam.remoteSequence + 1);
		}
	}
	// End of bound callbacks

	/**
	 * @ignore
	 * @override
	 * @memberof LiveScalingObjectMixin
	 * @instance
	 */
	addParam(param) {
		super.addParam(param);
		param.on("set", this._onParamSetForScaling);
	}
};
