import MiraUIObject from "./base.js";

export default class LiveToggle extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
	}

	paint(mgraphics, params) {
		const {
			active,
			activebgcolor,
			activebgoncolor,
			bgcolor,
			bgoncolor,
			bordercolor,
			rounded,
			value,
			width,
			height
		} = params;

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

		// draw background
		mgraphics.set_line_width(0.5);
		mgraphics.rectangle(0.5, 0.5, width - 1, height - 1, rounded);
		mgraphics.fill();
		mgraphics.set_source_rgba(bordercolor);
		mgraphics.stroke();
	}

	pointerDown(event, params) {
		const { value } = params;
		this.setParamValue("value", ((value === 1) ? 0 : 1));
	}
}

LiveToggle.NAME = "live.toggle";
