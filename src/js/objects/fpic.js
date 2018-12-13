import MiraUIObject from "./base.js";
import RemoteSprite from "../lib/remoteSprite.js";

export default class Fpic extends MiraUIObject {

	constructor(stateObj) {
		super(stateObj);

		this._pic = new RemoteSprite(this._state.getResourceAtIndex(0));
		this._displayNode.addDisplayChild(this._pic.display);
		this._updateCb = this.render.bind(this);
		this._pic.on("update", this._updateCb);
	}

	destroy() {
		this._pic.destroy();
		super.destroy();
	}

	paint(mgraphics, params) {
		const { autofit, destrect, xoffset, yoffset} = params;
		const scale = this._getActiveFrameScale();

		if (autofit) {
			const rect = this.getScreenRect();
			this._pic.dimensions = { width: rect[2], height: rect[3] };
			this._pic.display.x = xoffset * scale;
			this._pic.display.y = yoffset * scale;

		} else {
			this._pic.dimensions = { width: (scale * destrect[2]), height: (scale * destrect[3]) };
			this._pic.display.x = scale * (xoffset + destrect[0]);
			this._pic.display.y = scale * (yoffset + destrect[1]);
		}
	}
}

Fpic.NAME = "fpic";
