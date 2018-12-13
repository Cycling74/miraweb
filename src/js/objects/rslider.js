import MiraUIObject from "./base.js";

export default class Rslider extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
	}

	paint(mgraphics, params) {
		const {
			width,
			height,
			distance,
			orientation,
			drawline,
			bgcolor,
			bordercolor,
			fgcolor
		} = params;
		let { size } = params;

		// draw background
		mgraphics.set_source_rgba(bgcolor);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();

		const topBottomPadding = 3;
		const leftRightPadding = 3;
		size -= 1;
		if ((orientation === "Automatic" && (width < height)) || orientation === "Vertical") {
			this.orientation = "vertical";
			let padding = 0.1 * width;

			if (drawline === 1) {
				mgraphics.set_source_rgba(bordercolor);
				mgraphics.set_line_width(1);
				mgraphics.move_to(width / 2, topBottomPadding);
				mgraphics.line_to(width / 2, height - 2 * topBottomPadding);
				mgraphics.stroke();
			}

			this.interactionRect = [
				padding,
				topBottomPadding,
				width - 2 * padding,
				height - 2 * topBottomPadding
			];

			let start = (this.interactionRect[3] / size) * distance[1];
			let barHeight = start - ((this.interactionRect[3] / size) * distance[0]);
			barHeight = (barHeight > 0) ? barHeight : 1;

			mgraphics.set_source_rgba(fgcolor);
			mgraphics.rectangle(padding, height - start - topBottomPadding, width - (2 * padding), barHeight);
			mgraphics.fill();

		} else {
			this.orientation = "horizontal";
			let padding = 0.1 * height;

			if (drawline === 1) {
				mgraphics.set_source_rgba(bordercolor);
				mgraphics.set_line_width(1);
				mgraphics.move_to(leftRightPadding, height / 2);
				mgraphics.line_to(width - 2 * leftRightPadding, height / 2);
				mgraphics.stroke();
			}

			this.interactionRect = [
				leftRightPadding,
				padding,
				width - 2 * leftRightPadding,
				height - 2 * padding
			];

			let start = (this.interactionRect[2] / size) * distance[0];
			let barWidth = ((this.interactionRect[2] / size) * distance[1]) - start;
			barWidth = (barWidth > 0) ? barWidth : 1;

			mgraphics.set_source_rgba(fgcolor);
			mgraphics.rectangle(start + leftRightPadding, padding, barWidth, height - (2 * padding));
			mgraphics.fill();
		}
	}

	pointerDown(event, params) {
		let { size } = params;
		size -= 1;
		const interactionCoords = this.interactionCoordsForEvent(event);

		if (interactionCoords) {
			let newVal = this.orientation === "vertical" ? 1 - interactionCoords[1] : interactionCoords[0];
			newVal *= size;
			newVal = (newVal > size) ? size : newVal;
			newVal = (newVal < 0) ? 0 : newVal;
			newVal = Math.round(newVal);
			newVal = [newVal, newVal];
			this.setParamValue("distance", newVal);
			this.currValue = newVal;
		}
	}

	pointerMove(event, params) {
		let { size } = params;
		size -= 1;
		const interactionCoords = this.interactionCoordsForEvent(event);

		if (interactionCoords) {
			let newVal = this.orientation === "vertical" ? 1 - interactionCoords[1] : interactionCoords[0];
			newVal *= size;
			newVal = (newVal > size) ? size : newVal;
			newVal = (newVal < 0) ? 0 : newVal;
			newVal = [Math.round(this.currValue[0]), Math.round(newVal)];
			newVal.sort(function (a, b) { return a - b; });
			this.setParamValue("distance", newVal);
		}
	}
}

Rslider.NAME = "rslider";
