import MiraUIObject from "./base.js";

export default class Number extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
	}

	paint(mgraphics, params) {
		const {
			value,
			fontsize,
			fontname,
			fontface,
			bgcolor,
			textcolor,
			tricolor,
			htricolor,
			width,
			height
		} = params;
		const padding = 4;
		const triangleBase = 12;
		const triangleHeight = 6;
		const leftTextOffset = triangleHeight;

		// draw background
		mgraphics.set_source_rgba(bgcolor);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();

		mgraphics.set_font_name(fontname);
		mgraphics.set_font_weight(fontface);
		mgraphics.set_font_size(fontsize);

		mgraphics.set_source_rgba(textcolor);
		mgraphics.textLine(leftTextOffset + (3 * padding / 2), padding, width - leftTextOffset - (padding + 2), height - (2 * padding), value.toString());


		mgraphics.set_source_rgba((this._inTouch) ? htricolor : tricolor);
		mgraphics.polygon(padding, (height / 2) - (triangleBase / 2), [[0, 0], [0, triangleBase], [triangleHeight, triangleBase / 2]]);
		mgraphics.fill();
	}

	pointerDown(event, params) {
		const rect = this.getScreenRect();
		this.lastY = event.normTargetY * rect[3];
		this._inTouch = true;
		this.render();
	}

	pointerMove(event, params) {
		const rect = this.getScreenRect();
		let currentY = event.normTargetY * rect[3];
		let { value } = params;
		let newVal;
		newVal = value - event.screenDeltaY;
		this.lastY = currentY;
		this.setParamValue("value", newVal);
	}

	pointerUp(event, params) {
		this._inTouch = false;
		this.render();
	}
}


Number.NAME = "number";
