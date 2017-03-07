import { OBJECTS } from "../lib/objectList.js";
import { ResourceController } from "../lib/resource.js";

/**
 * Request and manage remote resources from the Max seach path. A resource includes both metadata, like image size and
 * file type, as well as the file data itself. Only images are currently supported.
 *
 * This Mixin is currently applied to instances of ObjectNode representing fpic, live.tab and live.text.
 *
 * @mixin ResourceObjectMixin
 * @example
 * // An ObjectNode that uses resources will return a nonzero value from getResourceCount
 * const fpicObject;
 * const resourceCount = fpicObject.getResourceCount(); // Will always be one
 *
 * // To get a specific resource, use the getResourceAtIndex function
 * const resource = fpicObject.getResourceAtIndex(0);
 *
 * // ObjectNodes that use resources will manage those resources on their own. If you'd like
 * // to handle the data for that resource as well, then you must register another listener.
 * // The resource doesn't hold on to data from Max once it receives it, so be sure to listen for {@link Resource.event:data_received}
 * // events in order to handle resource data.
 * resource.on("data_received", (filename, data_uri) => {
 * // Do something with the data
 * });
 *
 * // For resources that belong to an ObjectNode, it doesn't make sense to set the filename and
 * // dimensions properties of the resource directly. Rather, you can set the parameters of the
 * // ObjectNode, and it will manage resources itself.
 * fpicObject.setParamValue("pic", "alex.png"); // Will request new resource data.
 */
export default (objClass) => class extends objClass {

	constructor(id, type, creationSeq, patcherId) {
		super(...arguments);

		this._resources = [];
		this._resourceController = new ResourceController();
		let resourceCount = 0;

		if (type === OBJECTS.FPIC) {
			resourceCount = 1;
		} else if (type === OBJECTS.LIVE_TEXT) {
			resourceCount = 2;
		}

		for (let i = 0; i < resourceCount; i++) {
			let resource = this._resourceController.createResource(this.id);
			this._resources.push(resource);
		}
	}

	// Bound callbacks using fat arrow notation

	/**
	 * Callback for handling resource related parameter events
	 * @private
	 * @memberof ResourceObjectMixin
	 * @param {ParamNode}
	 */
	_onParamChangeForResources = (param) => {
		if (this._type === OBJECTS.FPIC) {
			if (param.type === "pic") {
				this._resources[0].filename = param.value;
			}
		} else if (this._type === OBJECTS.LIVE_TEXT) {
			if (param.type === "pictures") {
				for (let i = 0; i < param.value.length; i++) {
					this._resources[i].filename = param.value[i];
				}
			}
		} else if (this._type === OBJECTS.LIVE_TAB) {
			if (param.type === "pictures") {

				// For now, create a whole new array of resources
				this._resources.forEach(r => {
					r.destroy();
				});

				this._resources = [];

				if (param.value) {
					let enumerableValue = param.value;
					if (!(param.value instanceof Array)) {
						enumerableValue = [param.value];
					}

					enumerableValue.forEach((filename) => {
						let res = this._resourceController.createResource(this.id);
						this._resources.push(res);
						res.filename = filename;
					});
				}

				/**
				 * Resources Changed event. Fired internally whenever an object node has a new array of resources.
				 * @event ResourceObjectMixin.resources_changed
				 * @param {ObjectNode} object     This
				 */
				this.emit("resources_changed", this);
			}
		}
	}

	// End of bound callbacks

	/**
	 * @ignore
	 * @override
	 * @memberof ResourceObjectMixin
	 * @instance
	 */
	addParam(param) {
		super.addParam(param);
		param.on("change", this._onParamChangeForResources);
	}

	/**
	 * @memberof ResourceObjectMixin
	 * @instance
	 * @private
	 * @return {Object} the ResourceController for this object's Resources
	 */
	get resourceController() {
		return this._resourceController;
	}

	/**
	 * @memberof ResourceObjectMixin
	 * @instance
	 * @return {number} number of available resources
	 */
	getResourceCount() {
		return this._resources ? this._resources.length : 0;
	}

	/**
	 * @param {number} idx - The resource index
	 * @memberof ResourceObjectMixin
	 * @instance
	 * @throws throws an error if the resource index is out of bounds
	 */
	getResourceAtIndex(idx) {
		if (idx < 0 || idx >= this._resources.length) throw new Error(`Invalid Resource Index. Object has ${this.getResourceCount()} resources.`);
		return this._resources[idx];
	}

	/**
	 * @ignore
	 * @override
	 * @memberof ResourceObjectMixin
	 * @instance
	 */
	destroy() {
		super.destroy();
		this._resourceController.removeAllListeners();
		if (this._resources && this._resources.length) {
			this._resources.forEach((res) => {
				res.destroy();
			});
		}
	}

};
