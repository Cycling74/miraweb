let MiraUIObject = require("./base.js");
let RemoteSprite = require("../lib/remoteSprite.js");

export default class LiveText extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
		this._offImage = new RemoteSprite(this._state.getResourceAtIndex(0));
		this._onImage = new RemoteSprite(this._state.getResourceAtIndex(1));
		this._displayNode.addDisplayChild(this._offImage.display);
		this._displayNode.addDisplayChild(this._onImage.display);
		this._updateCb = this.render.bind(this);
		this._offImage.on("update", this._updateCb);
		this._onImage.on("update", this._updateCb);
	}

	destroy() {
		this._offImage.destroy();
		this._onImage.destroy();
		super.destroy();
	}

	paint(mgraphics, params) {
		const {
			width,
			height,
			activebgcolor,
			active,
			bgcolor,
			activebgoncolor,
			bgoncolor,
			bordercolor,
			textcolor,
			activetextoncolor,
			activetextcolor,
			text,
			texton,
			value,
			fontsize,
			fontname,
			fontface,
			usepicture,
			mode
		} = params;
		const rect = this.getScreenRect();

		// configure on/off image visibility
		this._offImage.dimensions = { width: rect[2], height: rect[3] };
		this._onImage.dimensions = { width: rect[2], height: rect[3] };
		this._offImage.display.visible = (usepicture && !value);
		this._onImage.display.visible = (usepicture && value);

		// draw background
		if (active === 1) {
			if (value === 1) {
				mgraphics.set_source_rgba(activebgoncolor);
			} else {
				mgraphics.set_source_rgba(activebgcolor);
			}
		} else {
			if (value === 1) {
				mgraphics.set_source_rgba(bgoncolor);
			} else {
				mgraphics.set_source_rgba(bgcolor);
			}
		}
		if (mode === "Button") {
			mgraphics.rectangle(0.5, 0.5, width - 1, height - 1, (height / 2) - 1);
		}
		else mgraphics.rectangle(0.5, 0.5, width - 1, height - 1);
		mgraphics.fill();

		// draw border (eventually we might need to redefine the shape)
		mgraphics.set_line_width(0.5);
		mgraphics.set_source_rgba(bordercolor);
		mgraphics.stroke();

		// display the text
		if (!usepicture) {
			mgraphics.set_font_name(fontname);
			mgraphics.set_font_weight(fontface);
			mgraphics.set_font_size(fontsize);
			mgraphics.set_font_justification("center");
			if (value === 1 && mode !== "Button") {
				mgraphics.set_source_rgba(active === 1 ? activetextoncolor : textcolor);
				mgraphics.textLine(0, (height - 2 - fontsize) * 0.5, width, fontsize, texton);
			} else {
				mgraphics.set_source_rgba(active === 1  ? activetextcolor : textcolor);
				mgraphics.textLine(0, (height - 2 - fontsize) * 0.5, width, fontsize, text);
			}
		}
	}

	pointerDown(event, params) {
		const { value, mode } = params;
		this._inTouch = true;
		if (mode === "Button") this.setParamValue("value", 1);
		else this.setParamValue("value", ((value === 1) ? 0 : 1));
	}

	pointerUp(event, params) {
		const { mode } = params;
		if (mode === "Button") this.setParamValue("value", 0);
		this._inTouch = false;
	}

	resetPointers() {
		this._inTouch = false;
	}
}

LiveText.NAME = "live.text";
