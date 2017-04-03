import MiraUIObject from "./base.js";
import { POPOVER_TYPES } from "../stores/popover.js";
import { clamp, isMobileOrTabletDevice } from "../lib/utils.js";

const LINE_WIDTH = 2;
const PADDING = 8;
const PIXELS_PER_STEP = 3;
const POPOVER_TYPE = POPOVER_TYPES.VALUE_LABEL;
const USE_PSEUDORELATIVE_MODE = !isMobileOrTabletDevice();

export default class LiveSlider extends MiraUIObject {

	constructor(stateObj) {
		super(stateObj);

		this._inTouch = false;
		this._touchPreviousCoord = 0;
		this._touchPreviousDist = 0;
	}

	_getUsableStepsForParams(params) {
		const {
			_parameter_range,
			_parameter_steps,
			_parameter_type
		} = params;

		let usableSteps = 0;
		if (_parameter_type === "Enum") {
			usableSteps = _parameter_range.length;
		} else if (_parameter_steps !== 0) {
			usableSteps = _parameter_steps;
		} else if (_parameter_type === "Int (0-255)") {
			if (_parameter_range.length >= 2) {
				usableSteps = _parameter_range[1] - _parameter_range[0];
			}
		}

		return usableSteps;
	}

	_handlePointerEvent(event, params, isPointerDown = false) {
		const {
			orientation,
			relative
		} = params;

		let newVal;

		let currentPos = this.interactionCoordsForEvent(event);
		currentPos = orientation === "Vertical" ? currentPos[1] : currentPos[0];

		let usableSteps = this._getUsableStepsForParams(params);

		if (isPointerDown && relative !== "Relative" && USE_PSEUDORELATIVE_MODE) {
			this._touchPreviousDist = orientation === "Vertical" ? 1 - currentPos : currentPos;
			this._touchPreviousDist = clamp(this._touchPreviousDist, 0, 1);
		}

		if (relative === "Relative" || USE_PSEUDORELATIVE_MODE) {
			let delta = currentPos - this._touchPreviousCoord;
			if (usableSteps !== 0) {
				delta *= this.interactionRect[orientation === "Vertical" ? 3 : 2] / usableSteps;
				delta /= PIXELS_PER_STEP;
			}
			this._touchPreviousDist = orientation === "Vertical" ? this._touchPreviousDist - delta : this._touchPreviousDist + delta;
		} else {
			this._touchPreviousDist = orientation === "Vertical" ? 1 - currentPos : currentPos;
		}

		this._touchPreviousDist = clamp(this._touchPreviousDist, 0, 1);
		this.setParamValue("distance", this._touchPreviousDist);

		const displayvalue = this._state.getParamValue("displayvalue");

		if (!this._inTouch) {
			this._inTouch = true;
			this.render();
			this.showPopover(POPOVER_TYPE, displayvalue);
		} else {
			this.updatePopover(displayvalue);
		}

		this._touchPreviousCoord = currentPos;
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
		const { distance, orientation } = params;

		this._touchPreviousDist = distance;
		this._touchPreviousCoord = orientation === "Vertical" ? this.interactionCoordsForEvent(event)[1] : this.interactionCoordsForEvent(event)[0];

		this._handlePointerEvent(event, params, true);
	}

	pointerMove(event, params) {
		this._handlePointerEvent(event, params, false);
	}

	pointerUp(event, params) {
		this.resetPointers();
		this.hidePopover();
		this.render();
	}

	resetPointers() {
		this._inTouch = false;
		this._touchPreviousCoord = 0;
		this._touchPreviousDist = 0;
	}
}

LiveSlider.NAME = "live.slider";
