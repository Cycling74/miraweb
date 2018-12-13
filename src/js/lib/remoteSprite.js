import { EventEmitter } from "events";
import * as PIXI from "pixi.js";

export default class RemoteSprite extends EventEmitter {

	constructor(xebraResource) {
		super();
		this._display = new PIXI.Container();
		this._handleData = this._handleData.bind(this);
		this._clear = this._clear.bind(this);
		this._resource = xebraResource;
		this._resource.on("data_received", this._handleData);
		this._resource.on("clear", this._clear);
		this._sprite = null;
	}

	get display() {
		return this._display;
	}

	get dimensions() {
		return this._resource.dimensions;
	}

	set dimensions(d) {
		if (d.width !== this.dimensions.width || d.height !== this.dimensions.height) {
			this._resource.dimensions = d;
			if (this._sprite) {
				this._sprite.width = d.width;
				this._sprite.height = d.height;
			}
		}
	}

	_destroySprite() {
		if (this._sprite) {
			this._sprite.parent.removeChild(this._sprite);
			this._sprite.destroy();
			this._sprite = null;
		}
	}

	_handleData(filenamename, data_uri_string) {

		this._destroySprite();

		// eslint-disable-next-line new-cap
		let newSprite = new PIXI.Sprite.fromImage(data_uri_string);
		this._display.addChild(newSprite);

		this._sprite = newSprite;
		this._sprite.width = this.dimensions.width;
		this._sprite.height = this.dimensions.height;
		this.emit("update");
	}

	_clear() {
		this._destroySprite();
		this.emit("update");
	}

	destroy() {
		this._resource.removeListener("data_received", this._handleData);
		this.removeAllListeners();
	}
}
