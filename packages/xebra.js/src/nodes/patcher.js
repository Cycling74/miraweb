import { VIEW_MODES } from "../lib/constants.js";
import ObjectNode from "./objectNode.js";

/**
 * @desc <strong>Constructor for internal use only</strong>
 *
 * Represent a single Max patcher. Use `getFrames` and `getObjects` to iterate over instances of {@link FrameNode} and
 * {@link ObjectNode}, respectively. The very handy `getObjectByScriptingName` function can be used to get the
 * {@link ObjectNode} instance bound to a Max object with the given `varname` attribute.
 * @class
 * @extends ObjectNode
 * @extends XebraNode
 */
class PatcherNode extends ObjectNode {

	/**
	 * @param  {number} id - The id of the node
	 * @param  {string} type - Type identifier of the node
	 * @param  {number} creationSeq - The sequence number for the creation of this node
	 * @param  {number} parentId - The id of the parent node
	 */
	constructor(id, type, creationSeq, parentId) {
		super(id, type, creationSeq, parentId);

		this._frames = new Set();
		this._objects = new Set();

		this._idsByScriptingName = new Map();
		this._scriptingNamesById = new Map();

		this._view = null;

		this.on("initialized", this._updateViewMode);
	}

	// Bound callbacks using fat arrow notation
	/**
	 * @private
	 * @param {FrameNode} frame - the changed frame
	 * @param {ParamNode} param - the changed parameter
	 * @fires XebraState.frame_changed
	 */
	_onFrameChange = (frame, param) => {
		// position changed? We might have to figure out if this object needs
		// to be added to frame instances
		if (
			(frame.viewMode === VIEW_MODES.PATCHING && param.type === "patching_rect") ||
			(frame.viewMode === VIEW_MODES.PRESENTATION && param.type === "presentation_rect")
		) {
			this._assignObjectsToFrame(frame);
		}

		/**
		 * @event PatcherNode.frame_changed
		 * @param {FrameNode} frame - The changed frame
		 * @param {ParamNode} param - The parameter node
		 */
		if (frame.isReady) this.emit("frame_changed", frame, param);
	}

	/**
	 * @private
	 * @param {FrameNode} frame - the initialized frame
	 */
	_onFrameInitialized = (frame) => {
		this.emit("frame_added", frame);
	}

	/**
	 * @private
	 * @param {FrameNode} frame - The changed frame
	 */
	_onFrameViewModeChange = (frame) => {
		this._assignObjectsToFrame(frame);
	}

	/**
	 * @private
	 * @param {Xebra.NodeId} objectId - The id of the object
	 */
	_removeScriptingNameLookup(objectId) {
		const scriptName = this._scriptingNamesById.get(objectId);
		if (!scriptName) return;

		this._idsByScriptingName.delete(scriptName);
		this._scriptingNamesById.delete(objectId);
	}

	/**
	 * @private
	 * @param {Xebra.NodeId} objectId - The id of the object
	 * @param {string} scriptingName - The scriptingName of the object
	 */
	_storeScriptingNameLookup(objectId, scriptingName) {
		this._idsByScriptingName.set(scriptingName, objectId);
		this._scriptingNamesById.set(objectId, scriptingName);
	}

	/**
	 * @private
	 * @param {ObjectNode} obj - The new object
	 * @fires PatcherNode.object_added
	 */
	_onObjectInitialized = (object) => {
		const varname = object.getParamValue("varname");
		if (varname) {
			this._storeScriptingNameLookup(object.id, varname);
		}
		this._assignObjectToFrames(object);
		this.emit("object_added", object);
	}

	/**
	 * @private
	 * @param {ObjectNode} obj - The changed object
	 * @param {ParamNode} param - The changed parameter
	 * @fires PatcherNode.object_changed
	 */
	_onObjectChange = (obj, param) => {
		// position changed? We might have to figure out if this object needs
		// to be added to frame instances
		//
		if (param.type === "presentation" ||
			param.type === "patching_rect" ||
			param.type === "presentation_rect"
		) {
			this._assignObjectToFrames(obj);
		}

		// varname changed? We have to update maps to/from the varname
		if (param.type === "varname") {
			this._removeScriptingNameLookup(obj.id);
			this._storeScriptingNameLookup(obj.id, param.value);
		}

		/**
		 * @event PatcherNode.object_changed
		 * @param {ObjectNode} object 	The changed object
		 * @param {ParamNode}		param   The changed parameter
		 */
		if (obj.isReady) this.emit("object_changed", obj, param);
	}
	/**
	 * @private
	 * @param {ObjectNode} obj - The destroyed object
	 */
	_onObjectDestroy = (obj) => {
		this.removeObject(obj.id);
	}

	/**
	 * @private
	 * @param {ObjectNode} view - The PatcherView object node
	 * @param {ParamNode} param - the changed parameter
	 */
	_onViewChange = (view, param) => {
		if (param.type === "presentation") this._updateViewMode();
		this.emit("param_changed", this, param);
	}

	/**
	 * @private
	 * @param {ObjectNode} view - The PatcherView object node
	 */
	_onViewDestroy = (view) => {
		view.removeListener("param_changed", this._onViewChange);
		view.removeListener("destroy", this._onViewDestroy);
		this._view = null;
	}

	// End of bound callbacks

	/**
	 * Name of the patcher (same as the filename for saved patchers).
	 * @type {string}
	 */
	get name() {
		return this._view ? this._view.getParamValue("name") : "";
	}

	/**
	 * Indicates whether the patcher is currently locked or not
	 * @return {boolean}
	 */
	get locked() {
		const locked = this._view ? this._view.getParamValue("locked") : 0;
		return locked ? true : false;
	}

	/**
	 * Returns the current background color of the patcher considering whether it's currently locked or not
	 * @return {Color}
	 */
	get bgColor() {
		const bgcolor = this.locked ? this.getParamValue("locked_bgcolor") : this.getParamValue("editing_bgcolor");
		return bgcolor || [1, 1, 1, 1];
	}

	/**
	 * Returns whether the Max patcher is currently in Presentation or Patching display.
	 * @type {number}
	 * @see Xebra.VIEW_MODES
	 */
	get viewMode() {
		if (!this._view) {
			return this.getParamValue("openinpresentation") ? VIEW_MODES.PRESENTATION : VIEW_MODES.PATCHING;
		}
		return this._view.getParamValue("presentation") ? VIEW_MODES.PRESENTATION : VIEW_MODES.PATCHING;
	}

	/**
	 * @private
	 */
	_viewModeToRectParam(mode) {
		return mode === VIEW_MODES.PATCHING ? "patching_rect" : "presentation_rect";
	}

	/**
	 * Assigns an object to the contained frames based on its rect position.
	 * @private
	 * @param {ObjectNode} obj - the object to assign
	 */
	_assignObjectToFrames(obj) {

		this._frames.forEach((frameId) => {

			const frame = this.getChild(frameId);
			const objRect = obj.getParamValue(this._viewModeToRectParam(frame.viewMode));
			const containsObject = frame.containsObject(obj.id);


			if (!objRect && !containsObject) return;

			// if we got no rect for the object or all vals are 0 (indicates not present in that view mode)
			// make sure to remove the obj from the frame if it has been there.
			if (containsObject && (!objRect || (frame.viewMode === VIEW_MODES.PRESENTATION && !obj.getParamValue("presentation")))) {
				frame.removeObject(obj.id);
			} else {
				const containsRect = frame.containsRect(objRect);

				if (containsObject && !containsRect) {
					frame.removeObject(obj.id);
				} else if (!containsObject && containsRect) {
					frame.addObject(obj);
				}
			}
		}, this);
	}

	/**
	 * Assigns the contained objects to the given frame based on the rect.
	 * @private
	 * @param {FrameNode} frame - the frame to assign objects to
	 */
	_assignObjectsToFrame(frame) {
		const rectParamName = this._viewModeToRectParam(frame.viewMode);

		this._objects.forEach((objId) => {

			const obj = this.getChild(objId);

			const objRect = obj.getParamValue(rectParamName);
			const containsObject = frame.containsObject(obj.id);

			if (!objRect && !containsObject) return;

			// if we got no rect for the object or all vals are 0 (indicates not present in that view mode)
			// make sure to remove the obj from the frame if it has been there.
			if (containsObject && (!objRect || (frame.viewMode === VIEW_MODES.PRESENTATION && !obj.getParamValue("presentation")))) {
				frame.removeObject(obj.id);
			} else {
				const containsRect = frame.containsRect(objRect);

				if (containsObject && !containsRect) {
					frame.removeObject(obj.id);
				} else if (!containsObject && containsRect) {
					frame.addObject(obj);
				}
			}
		}, this);
	}

	/**
	 * @private
	 */
	_updateViewMode() {
		const mode = this.viewMode;

		this._frames.forEach((frameId) => {

			const frame = this.getChild(frameId);
			frame.patcherViewMode = mode;
		}, this);
	}

	/**
	 * Adds a frame to the patcher.
	 * @ignore
	 * @param {FrameNode} frame
	 * @fires XebraState.frame_added
	 * @listens ObjectNode.param_changed
	 */
	addFrame(frame) {
		// we add the frame to the frames list but don't directly assign objects. This
		// is due to the design of the protocol delivering objects without an initial state so we
		// don't have the "patching_rect" from the beginning on. Ouch! Luckily this will be emitted
		// as an "param_changed" event so the assignment will happen there as we need to redo it whenever
		// the frame is moved anyway.

		frame.patcherViewMode = this.viewMode; // set the patcher's view mode

		this.addChild(frame.id, frame);
		this._frames.add(frame.id);

		frame.on("param_changed", this._onFrameChange);
		frame.on("viewmode_change", this._onFrameViewModeChange);

		if (frame.isReady) {
			this.emit("frame_added", frame);
		} else {
			frame.once("initialized", this._onFrameInitialized);
		}
	}

	/**
	 * Adds an object to the patcher.
	 * @ignore
	 * @param {ObjectNode} obj
	 * @listens ObjectNode.param_changed
	 * @listens ObjectNode.destroy
	 * @fires XebraState.object_added
	 */
	addObject(obj) {
		this.addChild(obj.id, obj);

		if (obj.type === "patcherview") {
			this._view = obj;
			obj.on("param_changed", this._onViewChange);
			obj.on("destroy", this._onViewDestroy);
		} else {
			this._objects.add(obj.id);
			obj.on("param_changed", this._onObjectChange);
			obj.on("destroy", this._onObjectDestroy);

			if (obj.isReady) {
				this.emit("object_added", obj);
				this._assignObjectToFrames(obj);
			} else {
				obj.once("initialized", this._onObjectInitialized);
			}
		}
	}

	/**
	 * Returns a list of the names of all mira.channel objects
	 * @return {string[]}
	 */
	getChannelNames() {
		const names = new Set();
		this._objects.forEach((id) => {
			const obj = this.getChild(id);
			if (obj.type === "mira.channel") {
				names.add(obj.getParamValue("name"));
			}
		}, this);
		return Array.from(names);
	}

	/**
	 * Returns the frame with the given id.
	 * @param  {Xebra.NodeId} id
	 * @return {Frame|null}
	 */
	getFrame(id) {
		return this.getChild(id);
	}

	/**
	 * Returns a list of frames that are present in this patch.
	 * @return {FrameNode[]}

	 */
	getFrames() {
		const frames = [];
		this._frames.forEach((id) => {
			frames.push(this.getChild(id));
		}, this);

		return frames;
	}

	/**
	 * Returns the object with the given id.
	 * @param  {Xebra.NodeId} id
	 * @return {ObjectNode|null}
	 */
	getObject(id) {
		return this.getChild(id);
	}

	/**
	 * Returns the object with the given scripting name.
	 * @param  {String} scripting_name
	 * @return {ObjectNode|null}
	 */
	getObjectByScriptingName(scriptingName) {
		if (this._idsByScriptingName.has(scriptingName)) return this.getChild(this._idsByScriptingName.get(scriptingName));
		return null;
	}

	/**
	 * Returns a list of objects that are present in this patch.
	 * @return {ObjectNode[]}
	 */
	getObjects() {
		const objects = [];

		this._objects.forEach((id) => {
			objects.push(this.getChild(id));
		}, this);

		return objects;
	}

	/**
	 * Removes the frame identified by the given id from the patch.
	 * @ignore
	 * @param  {Xebra.NodeId} id
	 * @fires XebraState.frame_removed
	 */
	removeFrame(id) {
		const frame = this.removeChild(id);

		if (frame) {

			this._frames.delete(id);

			// make sure to clean up attached event listeners
			frame.removeListener("param_changed", this._onFrameChange);
			frame.removeListener("viewmode_change", this._onFrameViewModeChange);
			frame.removeListener("initialized", this._onFrameInitialized);

			if (frame.isReady) this.emit("frame_removed", frame);
		}
	}

	/**
	 * Removes the object identified by the given id from the patch.
	 * @ignore
	 * @fires XebraState.object_removed
	 * @param  {Xebra.NodeId} id
	 */
	removeObject(id) {
		const obj = this.removeChild(id);

		if (obj) {

			this._objects.delete(id);
			this._removeScriptingNameLookup(id);

			// make sure to clean up attached event listeners
			obj.removeListener("param_changed", this._onObjectChange);
			obj.removeListener("destroy", this._onObjectDestroy);
			obj.removeListener("initialized", this._onObjectInitialized);

			if (obj.isReady) this.emit("object_removed", obj);
		}
	}
}

export default PatcherNode;
