import MiraUIObject from "./base.js";

export default class Message extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
	}

	paint(mgraphics, params) {
		const {
			textfield,
			fontsize,
			textjustification,
			fontname,
			fontface,
			bgfillcolor_color,
			bgfillcolor_type,
			bgfillcolor_pt1,
			bgfillcolor_pt2,
			bgfillcolor_color1,
			bgfillcolor_color2,
			textcolor,
			value,
			width,
			height
		} = params;
		const padding = 4;
		const borderRadius = 5;
		let {
			bgfillcolor_proportion,
			bgfillcolor_angle
		} = params;
		if (bgfillcolor_angle === null) bgfillcolor_angle = 270;
		if (bgfillcolor_proportion === null) bgfillcolor_proportion = 0.5;
		// draw background
		if (bgfillcolor_type === "gradient") {
			mgraphics.set_source_gradient(
				[ bgfillcolor_color1, bgfillcolor_color2 ],
				bgfillcolor_pt1,
				bgfillcolor_pt2,
				bgfillcolor_proportion,
				bgfillcolor_angle
			);
		} else {
			mgraphics.set_source_rgba(bgfillcolor_color);
		}

		mgraphics.rectangle(0, 0, width, height, borderRadius);
		mgraphics.fill();

		if (!this.cachedText) {
			const textRect = [padding + value, padding + value, width - (2 * padding), height];
			mgraphics.set_font_name(fontname);
			mgraphics.set_font_weight(fontface);
			mgraphics.set_font_size(fontsize);
			mgraphics.set_font_justification(textjustification);
			mgraphics.set_source_rgba(textcolor);
			this.cachedText = mgraphics.text(...textRect, textfield);
		} else {
			this.displayElement.addChild(this.cachedText);
		}
	}

	pointerDown(event, params) {
		this._inTouch = true;
		this.setParamValue("value", 1);
	}

	pointerUp(event, params) {
		this.setParamValue("value", 0);
		this._inTouch = false;
	}

	resetPointers() {
		this._inTouch = false;
	}
}

Message.NAME = "message";
