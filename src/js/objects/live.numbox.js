import MiraUIObject from "./base.js";
import { LIVE_VALUE_TYPES } from "xebra.js";

export default class LiveNumbox extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);

		this._inTouch = false;
		this._touchInitialVal = 0;
		this._touchInitialYCoord = 0;
	}

	// TODO: mode button
	paint(mgraphics, params) {
		const {
			width,
			height,
			activebgcolor,
			active,
			activeslidercolor,
			activetricolor,
			activetricolor2,
			appearance,
			bordercolor,
			displayvalue,
			textcolor,
			tricolor,
			tricolor2,
			value,
			fontname,
			fontface,
			fontsize,
			_parameter_range
		} = params;
		let padding = 2;
		// draw background
		mgraphics.set_source_rgba(activebgcolor);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();

		// draw border (eventually we might need to redefine the shape)
		mgraphics.set_line_width(1);
		mgraphics.set_source_rgba(bordercolor);
		mgraphics.stroke();

		// display the text
		mgraphics.set_font_name(fontname);
		mgraphics.set_font_weight(fontface);
		mgraphics.set_font_size(fontsize);
		mgraphics.set_font_justification("center");
		mgraphics.set_source_rgba(textcolor);
		mgraphics.textLine(0, (height - 2 - fontsize) * 0.5, width - (padding / 2), height, displayvalue);
		if (appearance === "Slider" && active === 1 && value > _parameter_range[0]) {
			let sliderWidth = (value / _parameter_range[1]) * width;
			mgraphics.set_source_rgba(activeslidercolor);
			mgraphics.rectangle(0.5, 0.5, sliderWidth - 1, height - 1);
			mgraphics.fill();
		}
		if (appearance === "Triangle") {
			let triangleBase = height - 4;
			let triangleHeight = 8;
			mgraphics.set_source_rgba((active === 1) ? ((value > _parameter_range[0]) ? activetricolor2 : activetricolor) : ((value > _parameter_range[0]) ? tricolor2 : tricolor));
			mgraphics.polygon(width - triangleHeight - 0.5, 2, [[0, triangleBase / 2], [triangleHeight, 0], [triangleHeight, triangleBase]]);
			mgraphics.fill();
		}
	}

	pointerDown(event, params) {
		const { value } = params;
		const [ , , , height ] = this.getScreenRect();

		this._touchInitialYCoord = event.normTargetY * height;
		this._touchInitialVal = value;
		this._inTouch = true;
		this.render();
	}

	pointerMove(event, params) {
		const { _parameter_type } = params;
		const [ , , , height ] = this.getScreenRect();
		const moveFactor = _parameter_type === LIVE_VALUE_TYPES.ENUM ? 0.1 : 0.6;

		let currentY = event.normTargetY * height;
		let newVal = this._touchInitialVal + moveFactor * (this._touchInitialYCoord - currentY);
		this.setParamValue("value", Math.round(newVal));
	}

	pointerUp(event, params) {
		this._inTouch = false;
		this.render();
	}
}

LiveNumbox.NAME = "live.numbox";
