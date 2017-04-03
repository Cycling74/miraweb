import MiraUIObject from "./base.js";
import { POPOVER_TYPES } from "../stores/popover.js";
import { clamp, isMobileOrTabletDevice } from "../lib/utils.js";

const USE_PSEUDORELATIVE_MODE = !isMobileOrTabletDevice();

export default class Slider extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
		this._orientation = null;

		this._touchPreviousCoord = 0;
		this._touchPreviousDist = 0;
	}

	_handlePointerEvent(event, params, isPointerDown = false) {
		const {
			floatoutput,
			relative
		} = params;

		let { size } = params;
		if (floatoutput === 0) size -= 1;

		let currentPos = this.interactionCoordsForEvent(event);
		currentPos = this._orientation === "vertical" ? currentPos[1] : currentPos[0];

		if (isPointerDown && relative !== "Relative" && USE_PSEUDORELATIVE_MODE) {
			this._touchPreviousDist = this._orientation === "vertical" ? 1 - currentPos : currentPos;
			this._touchPreviousDist *= size;
			this._touchPreviousDist = clamp(this._touchPreviousDist, 0, size);
		}

		if (relative === "Relative" || USE_PSEUDORELATIVE_MODE) {
			const delta = currentPos - this._touchPreviousCoord;
			this._touchPreviousDist += (this._orientation === "vertical" ?  -delta * size : delta * size);
		} else {
			this._touchPreviousDist = this._orientation === "vertical" ? 1 - currentPos : currentPos;
			this._touchPreviousDist *= size;
		}

		this._touchPreviousDist = clamp(this._touchPreviousDist, 0, size);

		const newVal = floatoutput ? this._touchPreviousDist : Math.round(this._touchPreviousDist);

		this.setParamValue("distance", newVal);
		params.distance = newVal; // Need to set this before passing params to the popover

		if (!this.isPopoverVisible()) {
			this.showPopover(this._popoverType(), this._popoverDescription(params));
		}
		this.updatePopover(this._popoverDescription(params));

		this._touchPreviousCoord = currentPos;
	}

	_popoverType() {
		return POPOVER_TYPES.VALUE_LABEL;
	}

	_popoverDescription(params) {
		const { floatoutput, distance } = params;
		return `${floatoutput ? distance.toFixed(3) : Math.round(distance)}`;
	}

	paint(mgraphics, params) {
		const {
			width,
			height,
			bgcolor,
			distance,
			elementcolor,
			floatoutput,
			knobcolor,
			knobshape,
			min,
			orientation
		} = params;
		let { size } = params;

		let knobHeight = 6;
		let padding = 4;
		let borderRad = 3;
		if (floatoutput === 0) {
			size -= 1;
		}

		// draw background
		mgraphics.set_source_rgba(bgcolor);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();

		if ((orientation === "Automatic" && (width < height)) || orientation === "Vertical") {
			this._orientation = "vertical";

			if (knobshape === "Less Rounded" || knobshape === "Rounded" || knobshape === "Triangle") {
				this.interactionRect = [0, padding, width, height - width / 2 - 2 * padding];
			} else if (knobshape === "Rectangle") {
				this.interactionRect = [0, padding, width, height - 2 * padding];
			} else {
				this.interactionRect = [0, padding + knobHeight / 2, width, height - knobHeight - 2 * padding];
			}

			let onHeight = Math.ceil(((height - (2 * padding) - knobHeight) / size) * distance);
			if (knobshape === "Indicator+") {
				mgraphics.set_source_rgba(elementcolor);
				mgraphics.rectangle(0, padding, width, height - (2 * padding));
				mgraphics.fill();
				mgraphics.set_source_rgba(knobcolor);
				mgraphics.rectangle(0, height - knobHeight - padding - onHeight, width, knobHeight);
				mgraphics.fill();
				if ((distance + min) > min) {
					mgraphics.rectangle(0, height - padding - onHeight + 1, width, onHeight - 1);
					mgraphics.fill();
				}
			}
			else if (knobshape === "Less Rounded") {
				knobHeight = width * 0.5;
				onHeight = Math.ceil(((height - (2 * padding) - knobHeight) / size) * distance);

				mgraphics.set_source_rgba(elementcolor);
				mgraphics.rectangle(0, padding, width, height - (2 * padding), borderRad);
				mgraphics.fill();
				mgraphics.set_source_rgba(knobcolor);
				mgraphics.rectangle(0, height - padding - onHeight - knobHeight, width, onHeight + knobHeight, borderRad);
				mgraphics.fill();
			}
			else if (knobshape === "Rounded") {
				knobHeight = width * 0.5;
				onHeight = Math.ceil(((height - (2 * padding) - knobHeight) / size) * distance);
				mgraphics.pie(width * 0.5, padding + knobHeight, knobHeight, Math.PI, 0);
				mgraphics.set_source_rgba(elementcolor);
				mgraphics.fill();
				mgraphics.rectangle(0, padding + knobHeight, width, height - (2 * padding) - knobHeight);
				mgraphics.fill();
				mgraphics.pie(width * 0.5, height - padding - onHeight, knobHeight, Math.PI, 0);
				mgraphics.set_source_rgba(knobcolor);
				mgraphics.fill();
				if ((distance + min) > min) {
					mgraphics.rectangle(0, height - padding - onHeight - 0.25, width, onHeight);
					mgraphics.fill();
				}
			}
			else if (knobshape === "Triangle") {
				knobHeight = width * 0.5;
				onHeight = Math.ceil(((height - (2 * padding) - knobHeight) / size) * distance);
				mgraphics.set_source_rgba(elementcolor);
				mgraphics.polygon(0, padding, [[0, knobHeight], [width, knobHeight], [width / 2, 0]]);
				mgraphics.fill();
				mgraphics.rectangle(0, padding + knobHeight, width, height - (2 * padding) - knobHeight);
				mgraphics.fill();
				mgraphics.set_source_rgba(knobcolor);
				mgraphics.polygon(0, height - padding - onHeight - knobHeight, [[0, knobHeight], [width, knobHeight], [width / 2, 0]]);
				mgraphics.fill();
				if ((distance + min) > min) {
					mgraphics.rectangle(0, height - padding - onHeight - 0.25, width, onHeight);
					mgraphics.fill();
				}
			}
			else if (knobshape === "Rectangle") {
				onHeight = Math.ceil(((height - (2 * padding)) / size) * distance);
				mgraphics.set_source_rgba(elementcolor);
				mgraphics.rectangle(0, padding, width, height - (2 * padding));
				mgraphics.fill();
				if ((distance + min) > min) {
					mgraphics.set_source_rgba(knobcolor);
					mgraphics.rectangle(0, height - padding - onHeight, width, onHeight);
					mgraphics.fill();
				}
			}
			else if (knobshape === "Indicator") {
				mgraphics.set_source_rgba(knobcolor);
				mgraphics.rectangle(padding, height - knobHeight - padding - onHeight, width - (2 * padding), knobHeight);
				mgraphics.fill();

			}

		} else {
			this._orientation = "horizontal";

			if (knobshape === "Less Rounded" || knobshape === "Rounded" || knobshape === "Triangle") {
				this.interactionRect = [padding + height / 2, 0, width - height / 2 - 2 * padding, height];
			} else if (knobshape === "Rectangle") {
				this.interactionRect = [padding, 0, width - 2 * padding, height];
			} else {
				this.interactionRect = [padding + knobHeight / 2, 0, width - knobHeight - 2 * padding, height];
			}

			let onWidth = Math.floor(((width - (2 * padding) - knobHeight) / size) * distance);
			if (knobshape === "Indicator+") {
				mgraphics.set_source_rgba(elementcolor);
				mgraphics.rectangle(padding, 0, width - (2 * padding), height);
				mgraphics.fill();
				mgraphics.set_source_rgba(knobcolor);
				mgraphics.rectangle(padding + onWidth, 0, knobHeight, height);
				mgraphics.fill();
				if ((distance + min) > min) {
					mgraphics.rectangle(padding, 0, onWidth - 1, height);
					mgraphics.fill();
				}
			}
			else if (knobshape === "Less Rounded") {
				knobHeight = height * 0.5;
				onWidth = Math.floor(((width - (2 * padding) - knobHeight) / size) * distance);
				mgraphics.set_source_rgba(elementcolor);
				mgraphics.rectangle(padding, 0, width - (2 * padding), height, borderRad);
				mgraphics.fill();
				mgraphics.set_source_rgba(knobcolor);
				mgraphics.rectangle(padding, 0, onWidth + knobHeight, height, borderRad);
				mgraphics.fill();
			}
			else if (knobshape === "Rounded") {
				knobHeight = height * 0.5;
				onWidth = Math.floor(((width - (2 * padding) - knobHeight) / size) * distance);
				mgraphics.pie(width - padding - knobHeight, knobHeight, knobHeight, Math.PI * 1.5, Math.PI * 0.5);
				mgraphics.set_source_rgba(elementcolor);
				mgraphics.fill();
				mgraphics.rectangle(padding, 0, width - (2 * padding) - knobHeight, height);
				mgraphics.fill();
				mgraphics.pie(padding + onWidth, knobHeight, knobHeight, Math.PI * 1.5, Math.PI * 0.5);
				mgraphics.set_source_rgba(knobcolor);
				mgraphics.fill();
				if ((distance + min) > min) {
					mgraphics.rectangle(padding, 0, onWidth + 0.25, height);
					mgraphics.fill();
				}
			}
			else if (knobshape === "Triangle") {
				knobHeight = height * 0.5;
				onWidth = Math.floor(((width - (2 * padding) - knobHeight) / size) * distance);
				mgraphics.set_source_rgba(elementcolor);
				mgraphics.polygon(width - padding - knobHeight, 0, [[0, 0], [0, height], [knobHeight, height / 2]]);
				mgraphics.fill();
				mgraphics.rectangle(padding, 0, width - (2 * padding) - knobHeight, height);
				mgraphics.fill();
				mgraphics.set_source_rgba(knobcolor);
				mgraphics.polygon(onWidth + padding, 0, [[0, 0], [0, height], [knobHeight, height / 2]]);
				mgraphics.fill();
				if ((distance + min) > min) {
					mgraphics.rectangle(padding, 0, onWidth + 0.25, height);
					mgraphics.fill();
				}
			}
			else if (knobshape === "Rectangle") {
				onWidth = Math.floor(((width - (2 * padding)) / size) * distance);
				mgraphics.set_source_rgba(elementcolor);
				mgraphics.rectangle(padding, 0, width - (2 * padding), height);
				mgraphics.fill();
				if ((distance + min) > min) {
					mgraphics.set_source_rgba(knobcolor);
					mgraphics.rectangle(padding, 0, onWidth, height);
					mgraphics.fill();
				}

			}
			else if (knobshape === "Indicator") {
				mgraphics.set_source_rgba(knobcolor);
				mgraphics.rectangle(padding + onWidth, padding, knobHeight, height - (2 * padding));
				mgraphics.fill();
			}
		}
	}

	pointerDown(event, params) {
		const { distance } = params;
		this._touchPreviousDist = distance;
		this._touchPreviousCoord = this._orientation === "vertical" ? this.interactionCoordsForEvent(event)[1] : this.interactionCoordsForEvent(event)[0];
		this._handlePointerEvent(event, params, true);
	}

	pointerMove(event, params) {
		this._handlePointerEvent(event, params, false);
	}

	pointerUp(event, params) {
		this._touchPreviousCoord = 0;
		this._touchPreviousDist = 0;
		if (this.isPopoverVisible()) this.hidePopover();
		this.render();
	}
}

Slider.NAME = "slider";
