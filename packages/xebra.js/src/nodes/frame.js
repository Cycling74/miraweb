import { VIEW_MODES } from "../lib/constants.js";
import ObjectNode from "./objectNode.js";

/**
 * @desc <strong>Constructor for internal use only</strong>
 *
 * FrameNode instances represent mira.frame objects in a Max patcher. Using the FrameNode object, it is possible to see
 * which Max objects intersect a given mira.frame object, in both Patching as well as Presentation Modes.
 * @class
 * @extends ObjectNode
 * @extends XebraNode
 */
class FrameNode extends ObjectNode {

	/**
	 * @param  {number} id - The id of the node
	 * @param  {string} type - Type identifier of the node
	 * @param  {number} creationSeq - The sequence number for the creation of this node
	 * @param  {number} patcherId - The id of the parent node
	 */
	constructor(id, type, creationSeq, patcherId) {
		super(id, type, creationSeq, patcherId);

		this._objects = new Set();
		this._viewMode = VIEW_MODES.LINKED;
		this._patcherViewMode = VIEW_MODES.PATCHING;
	}

	/**
	 * The view mode of the FrameNode. In Patching mode, object positions and visibility will be calculated relative to
	 * the patching_rect of the mira.frame object. In Presentation mode, the presentation_rect will be used. Linked mode
	 * will defer to Max. If Max is in Presentation mode, Xebra will use Presentation mode, and if Max is in Patching
	 * mode, Xebra will use Patching mode as well.
	 * @type {number}
	 * @see Xebra.VIEW_MODES
	 */
	get viewMode() {
		if (this._viewMode === VIEW_MODES.LINKED) return this._patcherViewMode;
		return this._viewMode;
	}

	set viewMode(mode) {
		this._viewMode = mode;
		this.emit("viewmode_change", this, mode);
	}

	/**
	 * Sets the view mode of the containing patcher
	 * @private
	 * @type {number}
	 */
	get patcherViewMode() {
		return this._patcherViewMode;
	}

	set patcherViewMode(mode) {
		this._patcherViewMode = mode;
		if (this.isViewModeLinked()) this.emit("viewmode_change", this, mode);
	}

	// Bound callbacks using fat arrow notation

	/**
	 * @private
	 * @fires XebraState.object_added
	 * @param {ObjectNode} obj - The new object
	 */
	_onObjectInitialized = (obj) => {
		this.emit("object_added", obj);
	}

	/**
	 * @private
	 * @fires XebraState.object_changed
	 * @param {ObjectNode} obj - The changed object
	 * @param {ParamNode} param - The changed parameter
	 */
	_onObjectChange = (obj, param) => {
		if (this.getChild(obj.id)) this.emit("object_changed", obj, param);
	}

	/**
	 * Callback called when a contained object is destroyed.
	 * @private
	 * @param {ObjectNode} obj - The destroyed object
	 */
	_onObjectDestroy = (obj) => {
		this.removeObject(obj.id);
	}

	// End of bound callbacks

	/**
	 * Adds the given object to the frame.
	 * @ignore
	 * @param {ObjectNode} obj
	 * @listens ObjectNode.param_changed
	 * @listens ObjectNode.destroy
	 * @fires XebraState.object_added
	 */
	addObject(obj) {
		this._objects.add(obj.id);
		this.addChild(obj.id, obj);

		obj.on("param_changed", this._onObjectChange);
		obj.on("destroy", this._onObjectDestroy);

		if (obj.isReady) {
			this.emit("object_added", obj);
		} else {
			obj.once("initialized", this._onObjectInitialized);
		}
	}

	/**
	 * Checks whether the frame contains the object identified by the given id.
	 * @param  {Xebra.NodeId} id - The id of the object
	 * @return {boolean}
	 */
	containsObject(id) {
		return this.hasChild(id);
	}

	/**
	 * Boundary check whether the given rect is visible within the frame.
	 * @param  {Xebra.PatchingRect} rect - The rectangle to check
	 * @return {boolean} whether the rect is contained or not
	 */
	containsRect(rect) {
		const frameRect = this.viewMode === VIEW_MODES.PATCHING ? this.getParamValue("patching_rect") : this.getParamValue("presentation_rect");

		if (!frameRect) return false; // don't have the rect yet

		if (rect[0] < frameRect[0] + frameRect[2] && // x
			rect[0] + rect[2] >= frameRect[0] &&
			rect[1] < frameRect[1] + frameRect[3] && // y
			rect[1] + rect[3] >= frameRect[1]
		) {
			return true;
		}

		return false;
	}

	/**
	 * Returns the object with the given id.
	 * @param  {Xebra.NodeId} id - The id of the object
	 * @return {ObjectNode|null} The object (if contained) or null
	 */
	getObject(id) {
		return this.getChild(id);
	}

	/**
	 * Returns a list of all objects contained in the frame.
	 * @return {ObjectNode[]} An array of all contained objects
	 */
	getObjects() {
		const objects = [];

		this._objects.forEach((id) => {
			objects.push(this.getChild(id));
		}, this);

		return objects;
	}

	/**
	 * Returns the frame of the object relative the the frame, in the current view mode, or null if the object is not in
	 * the frame.
	 * @return {Xebra.PatchingRect|null} Relative object frame.
	 */
	getRelativeRect(object) {
		if (!this.containsObject(object.id)) return null;
		const viewMode = this.viewMode;
		const objectRect = object.getParamValue(viewMode === VIEW_MODES.PATCHING ? "patching_rect" : "presentation_rect");
		const thisRect = this.getParamValue(viewMode === VIEW_MODES.PATCHING ? "patching_rect" : "presentation_rect");
		return [objectRect[0] - thisRect[0], objectRect[1] - thisRect[1], objectRect[2], objectRect[3]];
	}

	/**
	 * Checks whether the current view mode is linked.
	 * @return {boolean} Whether the frame defers to Max for it's viewMode or not
	 */
	isViewModeLinked() {
		return this._viewMode === VIEW_MODES.LINKED;
	}

	/**
	 * Removes the object with the given id from the frame.
	 * @ignore
	 * @fires XebraState.object_removed
	 * @param  {Xebra.NodeId} id - The id of the object to remove
	 */
	removeObject(id) {
		const obj = this.removeChild(id);

		if (obj) {

			this._objects.delete(id);

			// make sure to clean up attached event listeners
			obj.removeListener("param_changed", this._onObjectChange);
			obj.removeListener("destroy", this._onObjectDestroy);
			obj.removeListener("initialized", this._onObjectInitialized);

			if (obj.isReady) this.emit("object_removed", obj);
		}
	}
}

export default FrameNode;
