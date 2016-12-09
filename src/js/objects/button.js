import MiraUIObject from "./base.js";

export default class Button extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);

		this._inTouch = false;
	}

	paint(mgraphics, params) {

		const { width, height, bgcolor, blinkcolor, outlinecolor } = params;

		// draw background
		mgraphics.set_source_rgba(bgcolor);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();

		mgraphics.circle(width / 2, height / 2, width * 0.3);
		mgraphics.fill();
		mgraphics.set_source_rgba(outlinecolor);
		mgraphics.set_line_width((2.0 / 24.0) * width); // proportional

		mgraphics.stroke();

		if (params.value === 1) {
			mgraphics.set_source_rgba(blinkcolor);
			mgraphics.circle(width / 2, height / 2, width * 0.15);
			mgraphics.fill();

			if (!this._inTouch) {
				setTimeout(function() {
					this.setParamValue("value", 0);
				}.bind(this), 100);
			}
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

Button.NAME = "button";
