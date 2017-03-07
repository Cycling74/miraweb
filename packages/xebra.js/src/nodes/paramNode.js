import XebraNode from "./base.js";


/*
 * Unfortunately Max doesn't set the values for gradient related parameters
 * properly when an object is created and the values are set to defaults.
 * That's why we set some default values here
 * see #10136
 */

const PARAM_DEFAULT_VALUES = {
	bgfillcolor_pt1 : [0.5, 0.05],
	bgfillcolor_pt2 : [0.5, 0.95]
};

/**
 * @private
 */
function _getDefaultParamValue(type, value) {
	if ((!value || (value.constructor === Array && !value.length)) &&
		PARAM_DEFAULT_VALUES.hasOwnProperty(type)
	) {
		return PARAM_DEFAULT_VALUES[type];
	}
	return value;
}

/*
 * Communication between xebra-state and Max uses a modified form of OSC,
 * which passes values along with types (h for integer, d for float, etc.).
 * Javascript doesn't differentiate between integers and floats. So,
 * xebra-state needs to store the types of each parameter when Max
 * updates the value of that parameter. There are some special parameters,
 * however, that are not initialized by Max. These types must be known
 * beforehand and are hardcoded.
 */
const HARDCODED_TYPES = {
	moved_touch : ["h", "h", "h", "h", "h", "h", "d", "d"],
	up_down_cancelled_touch : ["h", "h", "h", "h", "h", "h", "d", "d"],
	pinch : ["h", "h", "h", "d", "d", "h"],
	region : ["h", "h", "h", "h", "h", "h"],
	rotate : ["h", "h", "h", "d", "d", "h"],
	swipe : ["h", "h", "h", "h", "h"],
	tap : ["h", "h", "h", "d", "d", "h"],
	rawsend : ["h", "h"],
	rotationrate : ["h", "h", "d", "d", "d", "d"],
	gravity : ["h", "h", "d", "d", "d", "d"],
	accel : ["h", "h", "d", "d", "d", "d"],
	orientation : ["h", "h", "d", "d", "d", "d"],
	rawaccel : ["h", "h", "d", "d", "d", "d"],
	touchy : ["s", "s", "h", "h"],
	setcell : ["h", "h", "h"],
	directions : "h*",
	constraint : "h*"
};

function _getHardcodedOSCTypes(type) {
	if (HARDCODED_TYPES.hasOwnProperty(type)) return HARDCODED_TYPES[type];
	return null;
}

/**
 * @class
 * @desc <strong>Constructor for internal use only</strong>
 *
 * Representation of a Max object parameter. Usually, a parameter is simply a Max attribute. Setting the value of the
 * parameter will update the Max object attribute with the same name. Some parameters do not map to attributes, for
 * example the "distance" parameter of a slider object, which controls the value of the slider.
 * @extends XebraNode
 */
class ParamNode extends XebraNode {
	/**
	 * @param  {Number} id - The id of the node
	 * @param  {String} type - Type identifier of the node
	 * @param  {Number} creationSeq - The sequence number for the creation of this node
	 */
	constructor(id, type, creationSeq) {
		super(id, type, creationSeq);

		this._sequence = 0;
		this._currentRemoteSequence = 0;
		this._value = _getDefaultParamValue(type, null);

		// Not beautiful but given the way we have to mirror all OSC types across Max and the client
		// we hardcode the types for params that don't receive an initial value here
		this._types = _getHardcodedOSCTypes(type);
	}

	/**
	 * The sequence number associated with the most recent modification. Whenever the value of the parameter is updated
	 * in Max or some other remote endpoint, this sequence number will increase.
	 * @type {number}
	 */
	get remoteSequence() {
		return this._currentRemoteSequence;
	}

	// Bound callbacks using fat arrow notation

	/**
	 * @private
	 * @param {ParamNode} param - The changed parameter
	 */
	_onParamChange = (param) => {
		this.emit("change", this);
	}

	/**
	 * @private
	 * @param {ParamNode} param - The changed parameter
	 */
	_onParamSet = (param) => {
		this.emit("set", this);
	}
	// End of bound callbacks

	/**
	 * @private
	 */
	_storeValue(value) {
		const val = _getDefaultParamValue(this.type, value);

		if (val && val.length === 1) {
			this._value = val[0];
		} else {
			this._value = val;
		}
	}

	/**
	 * getter for the OSC value types
	 * @ignore
	 * @readonly
	 * @type {string[]}
	 */
	get types() {

		if (typeof this._types === "string") {
			if (this._types.charAt(1) === "*") {
				if (this._value === null) return [];
				return new Array(this._value.length).fill(this._types.charAt(0));
			}
		}

		return this._types;
	}

	/**
	 * The client modification sequence number
	 * @ignore
	 * @readonly
	 * @type {number}
	 */
	get sequence() {
		return this._sequence;
	}

	/**
	 * The current value of this parameter. Setting the value will trigger an update in Max, if connected. This will not
	 * cause an ObjectNode.param_changed event to fire, however, since this is only fired on changes that come from Max.
	 * @type {Xebra.ParamValueType}
	 * @fires ParamNode#set
	 */
	get value() {
		// handle enums
		if (this.getParamValue("style") === "enumindex") {
			const values = this.getParamValue("enumvals");
			if (!values) return null;
			return values[this._value];
		}
		return this._value;
	}

	set value(value) {
		this._storeValue(value);
		this._sequence++;
		/**
		 * Parameter set event
		 * @event ParamNode#set
		 * @ignore
		 * @param {ParamNode} param this
		 */
		this.emit("set", this);
	}

	/**
	 * Inits the node with the given value.
	 * @ignore
	 * @param  {Xebra.ParamValueType} value [description]
	 */
	init(value) {
		this._storeValue(value);
	}

	/**
	 * Modifies the value of the parameter. This is used in order to apply remote modifications. Use the param.value
	 * getter/setter if you want to read/change the value.
	 * @ignore
	 * @param  {Xebra.ParamValueType} value - The new value
	 * @param  {string[]} value - The OSC types
	 * @param  {number} remoteSequence - The remote sequence number
	 * @fires ParamNode.change
	 */
	modify(value, types, remoteSequence) {
		if (this._currentRemoteSequence && this._currentRemoteSequence >= remoteSequence) return;

		this._currentRemoteSequence = remoteSequence;
		this._storeValue(value);

		// don't overwrite types for certain value
		if (!HARDCODED_TYPES.hasOwnProperty(this.type)) {
			this._types = types;
		}

		/**
		 * Parameter change event
		 * @event ParamNode.change
		 * @param {ParamNode} param this
		 */
		this.emit("change", this);
	}
}

export default ParamNode;
