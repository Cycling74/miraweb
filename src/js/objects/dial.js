import MiraUIObject from "./base.js";
import { toRad } from "../lib/utils.js";
import { POPOVER_TYPES } from "../stores/popover.js";

const INDICATOR_WIDTH = toRad(3);

export default class Dial extends MiraUIObject {

	constructor(stateObj) {
		super(stateObj);
		this._lastY = 0;
	}

	paint(mgraphics, params) {

		const {
			bgcolor,
			degrees,
			floatoutput,
			min,
			mode,
			needlecolor,
			outlinecolor,
			thickness,
			width,
			height
		} = params;

		let { distance, size } = params;
		if (floatoutput === 0) size -= 1;
		// draw rect
		mgraphics.set_source_rgba(bgcolor);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();

		const cx = width * 0.5;
		const cy = height * 0.5;
		const radius = width * 0.375;

		const start = toRad(270 - degrees * 0.5);
		const end = toRad(270 + degrees * 0.5);
		const valPos = start + toRad((distance / size) * degrees);

		// draw background
		if (mode === "Arc" || mode === "Indicator") {
			mgraphics.set_source_rgba(outlinecolor);
			mgraphics.set_line_width(width * 0.1 * (thickness * 0.01));
			mgraphics.arc(cx, cy, radius, start, end);
			mgraphics.stroke();

		} else if (mode === "Pie Slice") {
			mgraphics.set_source_rgba(outlinecolor);
			mgraphics.pie(cx, cy, radius, start, end);
			mgraphics.fill();
		}

		if (mode === "Arc" && distance > min) {

			mgraphics.set_source_rgba(needlecolor);
			mgraphics.arc(cx, cy, radius, start, valPos);
			mgraphics.stroke();

		} else if (mode === "Indicator") {

			mgraphics.set_source_rgba(needlecolor);
			mgraphics.arc(cx, cy, radius, valPos, valPos + INDICATOR_WIDTH);
			mgraphics.stroke();

		} else if (mode === "Pie Slice") {

			mgraphics.set_source_rgba(needlecolor);
			mgraphics.pie(cx, cy, radius, start, valPos);
			mgraphics.fill();
		}
	}

	pointerDown(event, params) {
		const rect = this.getScreenRect();
		this._lastY = event.normTargetY * rect[3];
		if (!this.isPopoverVisible()) this.showPopover(this.popoverType(), this.popoverDescription(params));
	}

	pointerMove(event, params) {
		const rect = this.getScreenRect();
		const currentY = event.normTargetY * rect[3];

		const { distance, min, floatoutput } = params;
		let { size } = params;
		if (floatoutput === 0) size -= 1;
		let newVal = distance + (0.005 * size) * (this._lastY - currentY);
		newVal = (newVal > size) ? size : newVal;
		newVal = (newVal < min) ? min : newVal;

		this._lastY = currentY;
		this.setParamValue("distance", newVal);
		params.distance = newVal;
		this.updatePopover(this.popoverDescription(params));
	}

	pointerUp(event, params) {
		if (this.isPopoverVisible()) this.hidePopover();
	}

	popoverType() {
		return POPOVER_TYPES.VALUE_LABEL;
	}

	popoverDescription(params) {
		const {floatoutput, distance} = params;
		return `${floatoutput ? distance.toFixed(3) : Math.round(distance)}`;
	}
}

Dial.NAME = "dial";
