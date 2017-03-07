import MiraUIObject from "./base.js";

const BORDER_WIDTH = 0.5;

export default class LiveButton extends MiraUIObject {

	constructor(stateObj) {
		super(stateObj);
		this._inTouch = false;
	}

	paint(mgraphics, params) {
		const {
			active,
			activebgcolor,
			activebgoncolor,
			bgcolor,
			bgoncolor,
			bordercolor,
			focusbordercolor,
			value,
			width,
			height
		} = params;

		mgraphics.set_line_width(BORDER_WIDTH);

		let buttonBgColor = (active === 1) ? ((value === 1) ? activebgoncolor : activebgcolor) : ((value === 1) ? bgoncolor : bgcolor);
		let buttonBorderColor = (value === 1) ? focusbordercolor : bordercolor;

		// draw background
		mgraphics.set_source_rgba(buttonBgColor);
		mgraphics.ellipse(width * 0.5, height * 0.5, (width * 0.5) - (2 * BORDER_WIDTH), (height * 0.5) - (2 * BORDER_WIDTH));
		mgraphics.fill();

		mgraphics.set_source_rgba(buttonBorderColor);
		mgraphics.stroke();

		if (value === 1) {

			if (!this._inTouch) {
				setTimeout(function() {
					this.setParamValue("value", 0);
				}.bind(this), 100);
			}
		}
	}

	pointerDown() {
		this._inTouch = true;
		this.setParamValue("value", 1);
	}

	pointerUp() {
		this._inTouch = false;
		this.setParamValue("value", 0);
	}

	resetPointers() {
		this._inTouch = false;
	}
}

LiveButton.NAME = "live.button";
