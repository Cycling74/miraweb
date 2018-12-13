import MiraUIObject from "./base.js";
import { POPOVER_TYPES } from "../stores/popover.js";
import Assets from "../lib/assets.js";

const KNOBHEIGHT = 6;
const PADDING = 2;
const KNOBPADDING = 2;
const ORIENTATION = Object.freeze({
	HORIZONTAL: 1,
	VERTICAL: 2
});

export default class Gain extends MiraUIObject {

	constructor(stateObj) {
		super(stateObj);

		this._orientation = ORIENTATION.HORIZONTAL;
	}

	_popoverType() {
		return POPOVER_TYPES.VALUE_LABEL;
	}

	_popoverDescription(params) {
		const { distance } = params;
		return `${distance}`;
	}

	paint(mgraphics, params) {
		const {
			orientation,
			bgcolor,
			stripecolor,
			knobcolor,
			width,
			height
		} = params;
		let size = params.size;
		let distance = params.distance;
		const scale = this._getActiveFrameScale();

		if (size > 1) size = size - 1;
		if (distance > size) distance = size;

		// draw background
		mgraphics.set_source_rgba(bgcolor);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();

		// Set the orientation
		if (orientation === "Vertical") this._orientation = ORIENTATION.VERTICAL;
		if (orientation === "Horizontal") this._orientation = ORIENTATION.HORIZONTAL;
		if (orientation === "Automatic") this._orientation = (width < height) ? ORIENTATION.VERTICAL : ORIENTATION.HORIZONTAL;

		// Set the region with which you can interact
		if (this._orientation === ORIENTATION.HORIZONTAL) {
			this.interactionRect = [
				PADDING + KNOBHEIGHT / 2,
				PADDING,
				width - 2 * PADDING - KNOBHEIGHT,
				height - 2 * PADDING
			];
		} else {
			this.interactionRect = [
				PADDING,
				PADDING + KNOBHEIGHT / 2,
				width - 2 * PADDING,
				height - 2 * PADDING - KNOBHEIGHT
			];
		}

		if (this._orientation === ORIENTATION.VERTICAL) {
			let knobCenterY = (1 - distance / size) * this.interactionRect[3] + this.interactionRect[1];

			// draw inactive stripes
			const inactiveHeight = knobCenterY - PADDING - KNOBHEIGHT / 2 - KNOBPADDING;
			if (inactiveHeight > 0) {
				mgraphics.rectangle(PADDING, PADDING, width - 2 * PADDING, inactiveHeight);
				mgraphics.set_pattern(Assets.getResourceTexture("hatching-vertical"), stripecolor);
				mgraphics.fill();
			}

			// draw active stripes
			const activeHeight = height - knobCenterY - PADDING - KNOBHEIGHT / 2 - KNOBPADDING;
			if (activeHeight > 0) {
				mgraphics.rectangle(PADDING, height - PADDING, width - 2 * PADDING, -activeHeight);
				mgraphics.set_pattern(Assets.getResourceTexture("hatching-vertical"), knobcolor);
				mgraphics.fill();
			}

			// draw the knob
			mgraphics.rectangle(PADDING + 0.5 / scale, knobCenterY - KNOBHEIGHT / 2, width - 2 * PADDING, KNOBHEIGHT);
			mgraphics.set_source_rgba(knobcolor);
			mgraphics.fill();
		} else {
			let knobCenterX = (distance / size) * this.interactionRect[2] + this.interactionRect[0];

			// draw inactive stripes
			const inactiveWidth = width - knobCenterX - PADDING - KNOBPADDING - KNOBHEIGHT / 2;
			if (inactiveWidth > 0) {
				mgraphics.rectangle(width - PADDING, PADDING, -inactiveWidth, height - 2 * PADDING);
				mgraphics.set_pattern(Assets.getResourceTexture("hatching-horizontal"), stripecolor);
				mgraphics.fill();
			}

			// draw active stripes
			const activeWidth = knobCenterX - PADDING - KNOBPADDING - KNOBHEIGHT / 2;
			if (activeWidth > 0) {
				mgraphics.rectangle(PADDING, PADDING, activeWidth, height - 2 * PADDING);
				mgraphics.set_pattern(Assets.getResourceTexture("hatching-horizontal"), knobcolor);
				mgraphics.fill();
			}

			// draw knob
			mgraphics.rectangle(knobCenterX - KNOBHEIGHT / 2, PADDING + 0.5 / scale, KNOBHEIGHT, height - 2 * PADDING);
			mgraphics.set_source_rgba(knobcolor);
			mgraphics.fill();
		}

		if (this.isPopoverVisible()) this.updatePopover(this._popoverDescription(params));
	}

	pointerDown(event, params) {
		this._inTouch = true;
		this.showPopover(this._popoverType(), this._popoverDescription(params));
		this.pointerMove(event, params);
	}

	pointerMove(event, params) {
		const size = params.size - 1;
		const interactionCoords = this.interactionCoordsForEvent(event);

		if (interactionCoords) {
			let newVal = size * ((this._orientation === ORIENTATION.VERTICAL) ? 1 - interactionCoords[1] : interactionCoords[0]);
			newVal = Math.round(newVal);
			newVal = (newVal > size) ? size : newVal;
			newVal = (newVal < 0) ? 0 : newVal;
			this.setParamValue("distance", newVal);
		}
	}

	pointerUp(event, params) {
		this._inTouch = false;
		this.render();
		this.hidePopover();
	}
}

Gain.NAME = "gain~";
