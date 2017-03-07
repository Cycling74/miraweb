import { EventEmitter } from "events";
import { OBJECT_PARAMETERS, OPTIONAL_OBJECT_PARAMETERS, MANDATORY_OBJECTS } from "../lib/objectList.js";

/**
 * @desc <strong>Constructor for internal use only</strong>
 * Base class for Max nodes in the Xebra state tree. Through Xebra, Max exposes patchers, mira.frame objects, other Max
 * objects and assignable parameters for each object. Each of these is represented by a different XebraNode subclass.
 * @class
 */
class XebraNode extends EventEmitter {
	/**
	 * @param  {number} id          The id of the node
	 * @param  {string} type        Type identifier of the node
	 * @param  {number} creationSeq The sequence number for the creation of this node
	 */
	constructor(id, type, creationSeq) {
		super();

		this._id = id;
		this._type = type;
		this._creationSeq = creationSeq;
		this._children = new Map();
		this._paramsNameLookup = new Map();
	}

	/**
	 * Destroys the node by destroying all child nodes and removing all attached listeners.
	 * @ignore
	 */
	destroy() {
		/**
		 * Object Destroyed event
		 * @alias XebraNode.destroy
		 * @event XebraNode.destroy
		 * @param {XebraNode} object     The destroyed object
		 */
		this.emit("destroy", this);

		this.removeAllListeners();
	}

	/**
	 * The creation sequence number associated with this node. This number is an increasing integer unique to each node.
	 * @member {number}
	 */
	get creationSequence() {
		return this._creationSeq;
	}

	/**
	 * Unique id associated with each XebraNode.
	 * @readonly
	 * @member {Xebra.NodeId}
	 */
	get id() {
		return this._id;
	}

	/**
	 * @desc Returns whether all of the parameters for the object have been added yet.
	 * @readonly
	 * @private
	 * @type {boolean}
	 */
	get isReady() {
		return true;
	}

	/**
	 * Type associated with this node. For Objects, Frames and Patchers, this will correspond to the class name of the
	 * Max object. For parameters, this will be the name of the associated parameter. Parameters usually correspond to
	 * the name of a Max object's attribute.
	 * @member {string}
	 */
	get type() {
		return this._type;
	}

	/**
	 * @private
	 */
	_getParamForType(type) {
		const id = this._paramsNameLookup.get(type);
		return this.getChild(id);
	}

	/**
	 * Callback when a parameter value is changed due to a modification in Max.
	 * @abstract
	 * @method
	 * @private
	 */
	_onParamChange() {
		throw new Error("Missing subclass implementation for _onParamChange");
	}

	/**
	 * Callback when a parameter value was set by the client.
	 * @abstract
	 * @method
	 * @private
	 */
	_onParamSet() {
		throw new Error("Missing subclass implementation for _onParamSet");
	}

	/**
	 * Adds a child.
	 * @ignore
	 * @param {Xebra.NodeId} id - The id of the child to be added
	 * @param {XebraNode} node - The child to add
	 */
	addChild(id, node) {
		this._children.set(id, node);
	}

	/**
	 * Execute callback function for each child of the node.
	 * @ignore
	 * @param {function} callback - The callback to execute
	 * @param {object} context - The context of the callback
	 */
	forEachChild(callback, context) {
		this._children.forEach(callback, context);
	}

	/**
	 * Returns the child with the given id.
	 * @ignore
	 * @param {Xebra.NodeId}
	 * @return {XebraNode|null}
	 */
	getChild(id) {
		return this._children.get(id) || null;
	}

	/**
	 * Returns all children of the node.
	 * @ignore
	 * @return {XebraNode[]}
	 */
	getChildren() {
		return Array.from(this._children.values());
	}

	/**
	 * Returns whether the given id is a direct child.
	 * @ignore
	 * @param {Xebra.NodeId} id - The id of the potential child
	 * @return {boolean}
	 */
	hasChild(id) {
		return this._children.has(id);
	}

	/**
	 * Removes the direct child connection to the node with the given id.
	 * @ignore
	 * @param {Xebra.NodeId} id - The id of the child to remove the connection to
	 */
	removeChild(id) {
		const child = this.getChild(id);
		if (child) this._children.delete(id);
		return child;
	}

	/**
	 * Adds a Parameter node to this node's children. Also adds the node as a listener for the Parameter node, so local
	 * and remote changes to that node will trigger {@link State.object_changed} events.
	 * @ignore
	 * @listens ParamNode#change
	 * @listens ParamNode#set
	 * @param {ParamNode} param The parameter to add
	 */
	addParam(param) {
		this._paramsNameLookup.set(param.type, param.id);

		param.on("change", this._onParamChange);
		param.on("set", this._onParamSet);

		this.addChild(param.id, param);
	}

	/**
	 * Returns a list of the names of all available parameters.
	 * @return {string[]}
	 */
	getParamTypes() {
		if (OBJECT_PARAMETERS.hasOwnProperty(this.type)) {
			return Object.freeze(OBJECT_PARAMETERS[this.type] || []);
		}
		return Object.freeze(MANDATORY_OBJECTS[this.type] || []);
	}

	/**
	 * Returns a list of the parameters that are not required for this object to be initialized.
	 * @ignore
	 * @return {string[]}
	 */
	getOptionalParamTypes() {
		return Object.freeze(OPTIONAL_OBJECT_PARAMETERS[this.type] || []);
	}

	/**
	 * Returns the value for the parameter with the name <i>type</i>.
	 * @param  {String} type - Parameter type identifier
	 * @return {Xebra.ParamValueType} returns the value(s) of the given parameter type or null
	 */
	getParamValue(type) {
		const param = this._getParamForType(type);
		if (param) return param.value;
		return null;
	}

	/**
	 * Sets the value for the parameter with the name <i>type</i> to the given value.
	 * @param {String} type - Parameter type identifier
	 * @param {Object} value - Parameter value
	 */
	setParamValue(type, value) {
		const param = this._getParamForType(type);
		if (param) param.value = value;
	}
}

export default XebraNode;
