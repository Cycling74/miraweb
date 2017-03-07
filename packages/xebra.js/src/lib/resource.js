import { EventEmitter } from "events";
import { extname } from "path";

let XEBRA_RESOURCE_ID = 0;

/**
 * @desc Represents some data that the remote Max instance has access to. The intended use is to support Max objects
 * like fpic and live.tab, which may want to display images. Can also be used to fetch data from files in Max's search
 * path. Setting `filename` (or setting `dimensions` in the case of .svg files) will query Max for that data in Max's
 * search path. Listen for the {@link Resource.event:data_received} event to receive the data as a data URI string.
 * Only images are currently supported.
 * @class
 * @extends EventEmitter
 * @example
 * // To use a resource without an ObjectNode, first create the resource.
 * const xebraState; // Instance of Xebra.State
 * const resource = xebraState.createResource();
 *
 * // The resource doesn't hold on to data from Max once it receives it, so be sure to listen for {@link Resource.event:data_received}
 * // events in order to handle resource data.
 * resource.on("data_received", (filename, data_uri) => {
 * // Do something with the data
 * });
 *
 * // Setting the filename property will cause the Resource object to fetch the data from Max. filename should be the
 * // name of a file in Max's search path. If Max is able to load the file successfully, it will send the data back
 * // to the Resource object, which will fire a {@link Resource.event:data_received} event with the data and filename.
 * resource.filename = "alex.png";
 *
 * // If the requested file is an .svg file, then Max will render the file before sending the data back to the Resource
 * // object. In this case, the dimensions property of the resource must be set as well as filename.
 * resource.filename = "maxelement.svg";
 * resource.dimensions = {width: 100, height: 50};
 */
class Resource extends EventEmitter {

	/**
	 * @constructor
	 * @param  {Xebra.NodeId} [0] parentObjectId - The id of the ObjectNode that owns this resource
	 */
	constructor(parentObjectId = 0) {
		super();
		this._id = ++XEBRA_RESOURCE_ID;
		this._width = 1;
		this._height = 1;
		this._objectContext = parentObjectId;
	}

	/**
	 * Unique identifier associated with each resource.
	 * @readonly
	 * @type {Xebra.NodeId}
	 */
	get id() {
		return this._id;
	}

	/**
	 * Name of a file in Max's search path. Setting this will query Max for data from the corresponding file. Listen to
	 * the {@link Resource.event:data_received} event for the data in the form of a data-uri string.
	 * @type {string}
	 */
	get filename() {
		return this._filename;
	}

	set filename(fn) {
		this._filename = fn;
		this._doFetch();
	}

	/**
	 * Id of the ObjectNode that owns the resource. If the resource is not bound to an ObjectNode, returns null. Max can
	 * use the object id to augment the search path with the parent patcher of the object, if the object id is supplied.
	 * @type {Xebra.NodeId}
	 */
	get objectContext() {
		return this._objectContext;
	}

	/**
	 * Whether the resource is a SVG image or not
	 * @readonly
	 * @type {boolean}
	 */
	get isSVG() {
		return this._filename ? extname(this._filename) === ".svg" : false;
	}

	/**
	 * @typedef {object} ResourceDimensions
	 * @property {number} height The height
	 * @property {number} width The width
	 */

	/**
	 * Dimensions of the resource. These are <strong>not</strong> updated automatically, and <strong>cannot</strong> be
	 * used to determine the dimensions of a raster image in Max's filepath. Instead, use the data URI returned with the
	 * {@link Resource.event:data_received} event to determine size. Setting these dimensions will trigger a new data
	 * fetch, if the resource is an .svg image. Max will be used to render the image and a .png data-uri will be
	 * returned.
	 * @type {ResourceDimensions}
	 */
	get dimensions() {
		return {
			width : this._width,
			height : this._height
		};
	}

	set dimensions(dim) {
		if (this._width !== dim.width || this._height !== dim.height) {
			this._width = dim.width;
			this._height = dim.height;
			if (this.isSVG) this._doFetch();
		}
	}

  /**
   * @private
   */
	on(event, fn) {
		super.on(event, fn);
		if (event === "data_received") this._doFetch();
	}

	/**
	 * Be sure to call this when the Resource is no longer needed.
	 */
	destroy() {
		this.removeAllListeners();
	}

	/**
	 * Fetch the resource data
	 * @private
	 */
	_doFetch() {
		this.emit("needs_data", this);
	}

	/**
	 * Handle incoming resource data.
	 * @private
	 * @param {object} data - The resource data
	 */
	handleData(data) {
		let filetype = extname(data.request.name);
		if (filetype.length && filetype[0] === ".") filetype = filetype.substr(1);

		if (filetype === "svg") filetype = "png"; // Max will convert rendered svg surfaces to png for us
		let data_uri_string = "data:image/" + filetype + ";base64," + data.data;

		/**
		 * @event Resource.data_received
		 * @param {string} name - name of the resource
		 * @param {string} datauri - data-uri representation of the resource
		 */
		this.emit("data_received", data.request.name, data_uri_string);
	}
}

export default Resource;

class ResourceController extends EventEmitter {
	constructor() {
		super();
	}

	_fetchResourceData = (resource) => {
		this.emit("get_resource_info", resource);
	}

	createResource(parentObjectId = 0) {
		const resource = new Resource(parentObjectId);
		resource.on("needs_data", this._fetchResourceData);
		return resource;
	}
}

export { ResourceController };
