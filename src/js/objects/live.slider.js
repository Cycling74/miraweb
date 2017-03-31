import MiraUIObject from "./base.js";
import { POPOVER_TYPES } from "../stores/popover.js";

const LINE_WIDTH = 2;
const PADDING = 8;
const POPOVER_TYPE = POPOVER_TYPES.VALUE_LABEL;

export default class LiveSlider extends MiraUIObject {

	constructor(stateObj) {
		super(stateObj);
		this._inTouch = false;
		this._previousPointerPosition = null;
		this._relativeAccum = null;
	}

	_handlePointerEvent(event, params) {
		const {
			distance,
			orientation,
			relative
		} = params;
		let newVal;

		const interactionCoords = this.interactionCoordsForEvent(event);

		if (relative === "Relative") {
			if (this._previousPointerPosition === null) {
				this._previousPointerPosition = interactionCoords;
				this._relativeAccum = distance;
			}
			let delta = 0;
			if (orientation === "Vertical") {
				delta = (1 - interactionCoords[1]) - (1 - this._previousPointerPosition[1]);
			} else if (orientation === "Horizontal") {
				delta = interactionCoords[0] - this._previousPointerPosition[0];
			}
			this._relativeAccum += delta;
			this._relativeAccum = Math.max(0, Math.min(1, this._relativeAccum));
			newVal = this._relativeAccum;
		} else {
			if (orientation === "Vertical") {
				newVal = 1 - interactionCoords[1];
			} else if (orientation === "Horizontal") {
				newVal = interactionCoords[0];
			}
		}

		newVal = (newVal > 1) ? 1 : newVal;
		newVal = (newVal < 0) ? 0 : newVal;
		this.setParamValue("distance", newVal);
		const displayvalue = this._state.getParamValue("displayvalue");

		if (!this._inTouch) {
			this._inTouch = true;
			this.render();
			this.showPopover(POPOVER_TYPE, displayvalue);
		} else {
			this.updatePopover(displayvalue);
		}

		this._previousPointerPosition = interactionCoords;
	}

	paint(mgraphics, params) {
		const {
			width,
			height,
			displayvalue,
			fontname,
			fontsize,
			fontface,
			orientation,
			showname,
			shownumber,
			slidercolor,
			textcolor,
			tribordercolor,
			trioncolor,
			tricolor,
			_parameter_shortname,
			distance
		} = params;

		mgraphics.set_source_rgba(slidercolor);
		mgraphics.set_line_width(LINE_WIDTH);

		if (orientation === "Vertical") {
			mgraphics.move_to(width * 0.5, fontsize + PADDING);
			mgraphics.line_to(width * 0.5, height - (fontsize + PADDING));
			mgraphics.stroke();

			this.interactionRect = [
				width * 0.5 - LINE_WIDTH / 2,
				fontsize + PADDING,
				LINE_WIDTH,
				height - 2 * (fontsize + PADDING)
			];

			mgraphics.set_line_width(1);
			mgraphics.set_source_rgba(tribordercolor);
			mgraphics.polygon(
				this.interactionRect[0] + LINE_WIDTH + 0.5,
				(this.interactionRect[1] - 4) + this.interactionRect[3] * (1 - distance),
				[[0, 4], [8, 0], [8, 8], [0, 4]]
			);
			mgraphics.stroke();

			if (this._inTouch === true) {
				mgraphics.set_source_rgba(trioncolor);
				mgraphics.fill();
			}

			else {
				mgraphics.set_source_rgba(tricolor);
				mgraphics.fill();
			}

			mgraphics.set_font_name(fontname);
			mgraphics.set_font_weight(fontface);
			mgraphics.set_font_size(fontsize);
			mgraphics.set_font_justification("center");
			mgraphics.set_source_rgba(textcolor);
			if (showname === 1) {
				mgraphics.textLine(0, 0, width, height, _parameter_shortname);
			}
			if (shownumber === 1) {
				mgraphics.textLine(0, height - fontsize, width, height, this._state.getParamValue("displayvalue"));
				mgraphics.fill();
			}
		}
		if (orientation === "Horizontal") {
			mgraphics.move_to(PADDING, height * 0.5);
			mgraphics.line_to(width - PADDING, height * 0.5);
			mgraphics.stroke();

			this.interactionRect = [
				PADDING,
				height * 0.5 - LINE_WIDTH,
				width - 2 * PADDING,
				LINE_WIDTH
			];

			mgraphics.set_line_width(1);
			mgraphics.set_source_rgba(tribordercolor);
			mgraphics.polygon(
				this.interactionRect[0] + this.interactionRect[2] * distance - 4,
				this.interactionRect[1] + this.interactionRect[3] + 2,
				[[0, 8], [4, 0], [8, 8], [0, 8]]
			);
			mgraphics.stroke();

			if (this._inTouch === true) {
				mgraphics.set_source_rgba(trioncolor);
				mgraphics.fill();
			}

			else {
				mgraphics.set_source_rgba(tricolor);
				mgraphics.fill();
			}

			mgraphics.set_font_name(fontname);
			mgraphics.set_font_weight(fontface);
			mgraphics.set_font_size(fontsize);
			mgraphics.set_font_justification("center");
			mgraphics.set_source_rgba(textcolor);
			if (showname === 1) {
				mgraphics.textLine(0, 0, width, height, _parameter_shortname);
			}
			if (shownumber === 1) {
				mgraphics.set_font_justification("left");
				mgraphics.textLine(4, height - fontsize, width, height, displayvalue);
				mgraphics.fill();
			}
		}
		if (this.isPopoverVisible()) this.updatePopover(displayvalue);
	}

	pointerDown(event, params) {
		this._handlePointerEvent(event, params);
	}

	pointerMove(event, params) {
		this._handlePointerEvent(event, params);
	}

	pointerUp(event, params) {
		this.resetPointers();
		this.hidePopover();
		this.render();
	}

	resetPointers() {
		this._inTouch = false;
		this._previousPointerPosition = null;
		this._relativeAccum = null;
	}
}

LiveSlider.NAME = "live.slider";
