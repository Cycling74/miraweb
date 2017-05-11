import XebraNode from "./base.js";

/**
 * @desc <strong>Constructor for internal use only</strong>
 *
 * Representation of a Max object in the Xebra state tree. The `nodeType` property returns the type of the ObjectNode,
 * which corresponds to the Max class of the object it represents. The `getParamTypes` function will return an array of
 * the parameters supported by this object, which usually corresponds to the attributes of the Max object. To listen to
 * parameter changes from Max, subscribe to the {@link ObjectNode.event:param_changed} event.
 * @extends XebraNode
 */
class ObjectNode extends XebraNode {

	/**
	 * @param  {Xebra.NodeId} id - The id of the node
	 * @param  {string} type - Type identifier of the node
	 * @param  {number} creationSeq - The sequence number for the creation of this node
	 * @param  {number} patcherId - The id of the parent node
	 */
	constructor(id, type, creationSeq, patcherId) {
		super(id, type, creationSeq);

		this._patcherId = patcherId;
		this._isReady = false;
	}

	/**
	 * @desc Have all of the parameters for the object been added yet
	 * @readonly
	 * @private
	 * @type {boolean}
	 */
	get isReady() {
		return this._isReady;
	}

	/**
	 * @desc Unique id of the parent patcher of the Max object.
	 * @readonly
	 * @type {Xebra.NodeId}
	 */
	get patcherId() {
		return this._patcherId;
	}

	// Bound callbacks using fat arrow notation
	/**
	 * @private
	 * @param {ParamNode}
	 * @fires ObjectNode.param_changed
	 */
	_onParamChange = (param) => {

		/**
		 * Parameter Changed event. Listen to this event to be notified when the value of a parameter changes.
		 * @event ObjectNode.param_changed
		 * @param {ObjectNode} object     This
		 * @param {ParamNode}  param      The parameter node
		 */
		if (!this._isReady) {
			let paramTypes = this.getParamTypes();
			let optionalParamTypes = this.getOptionalParamTypes();
			let isReady = true;
			for (let i = 0; i < paramTypes.length; i++) {
				const type = paramTypes[i];
				const value = this.getParamValue(type);
				if (( value === null || value === undefined) && (optionalParamTypes.indexOf(type) === -1)) {
					isReady = false;
					break;
				}
			}

			if (isReady) {
				this._isReady = true;
				this.emit("initialized", this);
			}
		} else {
			this.emit("param_changed", this, param);
		}
	}

	/**
	 * @private
	 * @param {ParamNode}
	 * @fires ObjectNode.param_set
	 */
	_onParamSet = (param) => {
		/**
		 * Parameter set event. Used internally in order to communicate parameter changes to Max. Use param_changed instead
		 * if you'd like to keep track of parameter changes.
		 *
		 * @event ObjectNode.param_set
		 * @param {ObjectNode} object     This
		 * @param {ParamNode}  param      The parameter node
		 */
		this.emit("param_set", this, param);
		this.emit("param_changed", this, param);
	}

	// End of bound callbacks
}

export default ObjectNode;
