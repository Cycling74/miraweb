import MiraUIObject from "./base.js";
import { clamp, toRad } from "../lib/utils.js";
import { POPOVER_TYPES } from "../stores/popover.js";

const POPOVER_TYPE = POPOVER_TYPES.VALUE_LABEL;

export default class LiveDial extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);

		this._inTouch = false;
		this._touchPreviousDistance = 0;
		this._touchPreviousYCoord = 0;
	}

	paint(mgraphics, params) {
		const {
			width,
			height,
			fontname,
			fontsize,
			fontface,
			active,
			activedialcolor,
			activeneedlecolor,
			appearance,
			bordercolor,
			dialcolor,
			displayvalue,
			needlecolor,
			panelcolor,
			showname,
			shownumber,
			textcolor,
			triangle,
			tribordercolor,
			tricolor,
			distance,
			_parameter_shortname
		} = params;

		// Total arc length is 315° or 2PI - PI/4
		let start = Math.PI - 3 * Math.PI / 8;
		let end = 2 * Math.PI + 3 * Math.PI / 8;
		let valPos = start + toRad(distance * 315);

		const triangleHeight = 4;
		const triangleLineWidth = 0.6;

		let dialheight = 25;
		if (appearance === "Tiny") {
			dialheight = 18;
			start = -3 * Math.PI / 2;
			end = 0;
			valPos = start + toRad(distance * 270);
		}
		const dialRadius = dialheight / 2;

		let dialCenterX = width * 0.5;
		let dialCenterY = height * 0.5 + 1;
		if (appearance === "Panel") {
			dialCenterY += 10;
		} else if (appearance === "Vertical") {
			if (shownumber) {
				dialCenterY -= (fontsize - 5);
			}
			if (showname) {
				dialCenterY += (fontsize  - 5);
			}
			if (triangle) {
				dialCenterY += (triangleHeight - 1);
			}
		} else if (appearance === "Tiny") {
			if (showname) {
				dialCenterY += 6;
				dialCenterX = 10;
			}
		}

		const arcStartX = dialCenterX + (dialheight * 0.5 * Math.cos(start));
		const arcStartY = dialCenterY + (dialheight * 0.5 * Math.sin(start));
		const arcEndX = dialCenterX + (dialheight * 0.5 * Math.cos(end));
		const arcEndY = dialCenterY + (dialheight * 0.5 * Math.sin(end));
		const valuePosX = dialCenterX + (dialheight * 0.5 * Math.cos(valPos));
		const valuePosY = dialCenterY + (dialheight * 0.5 * Math.sin(valPos));
		const endCapRadius = 1;
		const lineWidth = 2;
		let panelOffset = 0;

		if (appearance === "Panel") {
			panelOffset = 5;
			mgraphics.set_source_rgba(bordercolor);
			mgraphics.set_line_width(0.4);
			mgraphics.rectangle(1, 1, width - 2, height - 2, 5);
			mgraphics.stroke();

			// to draw the panel background with curved and sharp edges,
			// this draws a rectangle, two arcs, and a trapezoid
			mgraphics.set_source_rgba(panelcolor);
			mgraphics.rectangle(1.2, 5.5, width - 2.4, 25.5);
			mgraphics.fill();

			mgraphics.arc(5.4, 5.4, 4.2, Math.PI, 3 * Math.PI / 2);
			mgraphics.fill();
			mgraphics.arc(width - 5.4, 5.4, 4.2, 3 * Math.PI / 2, 0);
			mgraphics.fill();

			mgraphics.polygon(0, 0, [
				[1.1, 5.5],
				[5.4, 1.2],
				[width - 5.4, 1.2],
				[width - 1.1, 5.5],
				[1.1, 5.5]
			]);
			mgraphics.fill();
		}

		mgraphics.set_source_rgba(((active === 1) ? activeneedlecolor : needlecolor));
		mgraphics.set_line_width(lineWidth);

		// draw background arc
		// draw background arc endcaps
		mgraphics.circle(arcStartX, arcStartY, endCapRadius);
		mgraphics.fill();
		mgraphics.circle(arcEndX, arcEndY, endCapRadius);
		mgraphics.fill();

		// draw background arc
		mgraphics.arc(dialCenterX, dialCenterY, dialRadius, start, end);
		mgraphics.stroke();

		// draw value arc, which changes if triangle is enabled
		if (triangle) {
			const midpoint = (start + end) / 2;
			mgraphics.set_source_rgba(((active === 1) ? activedialcolor : dialcolor));
			if (distance > 0.5) {
				mgraphics.arc(dialCenterX, dialCenterY, dialRadius, midpoint, valPos);
				mgraphics.stroke();
			} else {
				mgraphics.arc(dialCenterX, dialCenterY, dialRadius, valPos, midpoint);
				mgraphics.stroke();
			}
		} else {
			// draw value arc endcap
			mgraphics.set_source_rgba(((active === 1) ? activedialcolor : dialcolor));
			mgraphics.circle(arcStartX, arcStartY, endCapRadius);
			mgraphics.fill();

			// draw value arc
			mgraphics.arc(dialCenterX, dialCenterY, dialRadius, start, valPos);
			mgraphics.stroke();
		}

		// draw dial
		mgraphics.set_source_rgba(((active === 1) ? activeneedlecolor : needlecolor));

		// draw dial round endcaps
		mgraphics.circle(dialCenterX, dialCenterY, endCapRadius);
		mgraphics.fill();
		mgraphics.circle(valuePosX, valuePosY, endCapRadius);
		mgraphics.fill();

		// draw dial line
		mgraphics.move_to(dialCenterX, dialCenterY);
		mgraphics.line_to(valuePosX, valuePosY);
		mgraphics.stroke();

		// add text if it is enabled
		mgraphics.set_source_rgba(textcolor);
		mgraphics.set_font_name(fontname);
		mgraphics.set_font_weight(fontface);
		mgraphics.set_font_size(fontsize);
		mgraphics.set_font_justification("center");

		if (showname === 1) {
			if (appearance === "Tiny") mgraphics.set_font_justification("left");
			else mgraphics.set_font_justification("center");
			mgraphics.textLine(0, panelOffset, width, fontsize, _parameter_shortname);
		}

		if (shownumber === 1) {
			const tinyOffset = appearance === "Tiny" ? 12 : 0;
			if (appearance === "Tiny") {
				mgraphics.set_font_justification("left");
			}
			mgraphics.textLine(tinyOffset, height - fontsize - panelOffset, width, fontsize, displayvalue);
		}

		// draw triangle if it is enabled
		if (triangle) {
			if (distance === 0) {
				mgraphics.set_source_rgba(tricolor);
			} else if (active === 0) {
				mgraphics.set_source_rgba(dialcolor);
			}
			else {
				mgraphics.set_source_rgba(activedialcolor);
			}
			if (appearance === "Tiny") {
				const tipPositionX = dialCenterX + (dialheight * 0.5 * Math.cos(-3 * Math.PI / 4)) - 1;
				const tipPositionY = dialCenterY + (dialheight * 0.5 * Math.sin(-3 * Math.PI / 4)) - 1;
				mgraphics.polygon(0, 0, [
					[tipPositionX, tipPositionY],
					[tipPositionX - triangleHeight, tipPositionY],
					[tipPositionX, tipPositionY - triangleHeight],
					[tipPositionX, tipPositionY]
				]);
			} else {
				mgraphics.polygon(0, 0, [
					[dialCenterX, dialCenterY - dialRadius - 1],
					[dialCenterX - triangleHeight, dialCenterY - dialRadius - 1 - triangleHeight],
					[dialCenterX + triangleHeight, dialCenterY - dialRadius - 1 - triangleHeight],
					[dialCenterX, dialCenterY - dialRadius - 1]
				]);
			}

			mgraphics.fill();
			mgraphics.set_source_rgba(tribordercolor || [0, 0, 0, 0]);
			mgraphics.set_line_width(triangleLineWidth);
			mgraphics.stroke();
		}
	}

	pointerDown(event, params) {
		const { displayvalue, distance } = params;
		const height = this.getScreenRect()[3];

		// cache initial coord and distance
		this._touchPreviousYCoord = event.normTargetY * height;
		this._touchPreviousDistance = distance;

		if (!this._inTouch) {
			this._inTouch = true;
			this.showPopover(POPOVER_TYPE, displayvalue);
		}
	}

	pointerMove(event, params) {
		const { displayvalue } = params;
		const height = this.getScreenRect()[3];

		let currentY = event.normTargetY * height;
		let newVal;

		newVal = this._touchPreviousDistance + (0.005) * (this._touchPreviousYCoord - currentY);
		newVal = clamp(newVal, 0, 1);

		this.setParamValue("distance", newVal);
		this.updatePopover(displayvalue);

		this._touchPreviousYCoord = currentY;
		this._touchPreviousDistance = newVal;
	}

	pointerUp(event, params) {
		this._inTouch = false;
		this.render();
		this.hidePopover();
	}
}

LiveDial.NAME = "live.dial";
