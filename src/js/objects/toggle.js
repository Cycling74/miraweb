import MiraUIObject from "./base.js";

export default class Toggle extends MiraUIObject {

	constructor(stateObj) {
		super(stateObj);
	}

	paint(mgraphics, params) {
		// draw background
		mgraphics.set_source_rgba(params.bgcolor);
		mgraphics.rectangle(0, 0, params.width, params.height);
		mgraphics.fill();

		// select color for lines based on state of toggle
		if (params.value === 1) {
			mgraphics.set_source_rgba(params.checkedcolor);
		}
		else {
			mgraphics.set_source_rgba(params.uncheckedcolor);
		}

		// draw the "X"
		mgraphics.set_line_width((2 / 12) * params.thickness * 0.01 * params.width);
		mgraphics.set_line_cap("square");

		let start = (7 / 24) * params.width;

		mgraphics.move_to(start, start);
		mgraphics.line_to(params.width - start, params.height - start);
		mgraphics.stroke();

		mgraphics.move_to(params.width - start, start);
		mgraphics.line_to(start, params.height - start);
		mgraphics.stroke();
	}

	pointerDown(event, params) {
		this.setParamValue("value", ((params.value === 1) ? 0 : 1));
	}
}

Toggle.NAME = "toggle";
