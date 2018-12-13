import * as PIXI from "pixi.js";

// Load Textures as data-urls by overriding the global file-loader config with the leading "!"
// Also note that we have to type these out here so that webpack can properly pick these up.
let assets = [

	// gain textures
	{
		name: "hatching-horizontal",
		data: require(`!url-loader!${__ASSETDIR__}/hatching-horizontal.svg`)
	},
	{
		name: "hatching-vertical",
		data: require(`!url-loader!${__ASSETDIR__}/hatching-vertical.svg`)
	},

	// mira.multitouch gestures
	{
		name: "multitouch-pinch",
		data: require(`!url-loader!${__ASSETDIR__}/multitouch-pinch.png`)
	},
	{
		name: "multitouch-rotation",
		data: require(`!url-loader!${__ASSETDIR__}/multitouch-rotation.png`)
	},
	{
		name: "multitouch-swipe",
		data: require(`!url-loader!${__ASSETDIR__}/multitouch-swipe.png`)
	},
	{
		name: "multitouch-tap",
		data: require(`!url-loader!${__ASSETDIR__}/multitouch-tap.png`)
	},
	{
		name: "multitouch-touch",
		data: require(`!url-loader!${__ASSETDIR__}/multitouch-touch.png`)
	}
];

class Assets {

	constructor(loader) {
		this._loader = loader;
		this._loader.on("error", this._onLoadError.bind(this));
	}

	_onLoadError(error, loader, resource) {
		console.error(`Could not load resource "${resource.name}"`);
	}

	load(onceDone, onProgress) {

		// Progress handling
		if (onProgress && typeof onProgress === "function") {
			this._loader.on("progress", () => {
				onProgress(this.progress);
			});
		}


		for (let i = 0, il = assets.length; i < il; i++) {
			PIXI.loader.add(assets[i].name, assets[i].data);
		}

		PIXI.loader.load((loader, resources) => {
			// free the assets
			assets = [];

			this._loader.removeAllListeners("progress");
			if (onceDone && typeof onceDone === "function") return onceDone(resources);

			return null;
		});
	}

	get loading() {
		return this._loader.loading;
	}

	get progress() {
		return this._loader.progress;
	}

	get resources() {
		return this._loader.resources || {};
	}

	getResource(name) {
		return this.resources[name] || null;
	}

	getResourceTexture(name) {
		const res = this.getResource(name);
		return res ? res.texture : null;
	}
}

export default new Assets(PIXI.loader);
