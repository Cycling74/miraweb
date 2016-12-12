import MiraUIObject from "./base.js";

const CANDICANE_9_23 = [
[ 204 / 255, 156.0 / 255.0, 97.0 / 255.0, 1.0],
[ 1.0, 189.0 / 255.0, 156.0 / 255.0, 1.0],
[ 204.0 / 255.0, 140.0 / 255.0,	140.0 / 255.0, 1.0],
[ 1.0, 156.0 / 255.0, 156.0 / 255.0, 1.0],
[ 1.0, 227.0 / 255.0, 23.0 / 255.0, 1.0],
[ 40.0 / 255.0,	204.0 / 255.0, 140.0 / 255.0, 1.0],
[ 74.0 / 255.0,	156.0 / 255.0, 97.0 / 255.0, 1.0],
[ 97.0 / 255.0,	156.0 / 255.0, 156.0 / 255.0, 1.0],
[ 156.0 / 255.0, 179.0 / 255.0,	1.0, 1.0],
[ 194.0 / 255.0, 181.0 / 255.0,	207.0 / 255.0, 1.0],
[ 153.0 / 255.0, 153.0 / 255.0,	1.0, 1.0],
[ 102.0 / 255.0, 102.0 / 255.0,	204.0 / 255.0, 1.0],
[ 153.0 / 255.0, 102.0 / 255.0,	153.0 / 255.0, 1.0],
[ 1.0, 92.0 / 255.0,	174.0 / 255.0, 1.0],
[ 1.0, 138.0 / 255.0, 215.0 / 255.0, 1.0]
];

export default class Multislider extends MiraUIObject {

	constructor(stateObj) {
		super(stateObj);
		this._values = [];
	}

	paint(mgraphics, params) {
		const {
			width,
			height,
			ghostbar,
			setstyle,
			candycane,
			size,
			setminmax,
			orientation,
			thickness,
			bgcolor,
			slidercolor,
			candicane2,
			candicane3,
			candicane4,
			candicane5,
			candicane6,
			candicane7,
			candicane8,
			peakcolor,
			drawpeaks,
			signed,
			spacing
		} = params;
		let { distance } = params;

		if (!Array.isArray(distance)) {
			distance = [distance];
		}
		let colors = [slidercolor, candicane2, candicane3, candicane4, candicane5, candicane6, candicane7, candicane8];
		colors = colors.concat(CANDICANE_9_23);
		let min = setminmax[0];
		let max = setminmax[1];
		let range = max - min;
		let transparentcolor = [0, 0, 0, 0];

		if (!this.peaks) {
			this.peaks = [];
			for (let i = 0; i < distance.length; i++) {
				this.peaks[i] = distance[i];
			}
		}

		if (orientation === "Horizontal") {
			this.orientation = "horizontal";
			// draw background
			let sliderHeight = (height - spacing*(size + 1)) / size;
			mgraphics.set_source_rgba(bgcolor);
			mgraphics.rectangle(0, 0, width + thickness, height);
			mgraphics.fill();

			let currY = spacing;

			for (let i = 0; i < size; i++) {
				let sliderX = (width / range) * (distance[i] - min);
				let zeroX = 0;

				if (setstyle === "Point Scroll" || setstyle === "Line Scroll" || setstyle === "Reverse Point Scroll" || setstyle === "Reverse Line Scroll") {
					if (!Array.isArray(this._values[i])) {
						this._values[i] = [];
					}
					if (this._values[i].length === height) this._values[i].pop();
					else if (this._values[i].length > height) this._values[i] = [];
					this._values[i].unshift(distance[i]);
				}


				mgraphics.set_source_rgba(colors[i % candycane]);
				mgraphics.set_line_width(thickness);
				if (setstyle === "Bar" || setstyle === "Thin Line") {
					mgraphics.move_to(sliderX + (thickness / 2), currY);
					mgraphics.line_to(sliderX + (thickness / 2), currY + sliderHeight);
					mgraphics.stroke();
				}
				if (signed === 1) {

					if (distance[i] > 0) {
						zeroX = ((width / range) * (0 - min));
					}
					else {
						zeroX = sliderX;
						sliderX = ((width / range) * (0 - min));
					}
				}
				if ((setstyle === "Bar" || setstyle === "Thin Line") && drawpeaks) {
					mgraphics.set_source_rgba(peakcolor);
					mgraphics.set_line_width(1);
					if (distance[i] > this.peaks[i]) {
						mgraphics.move_to(sliderX + thickness, currY);
						mgraphics.line_to(sliderX + thickness, currY + sliderHeight);
						this.peaks[i] = distance[i];
					} else if (distance[i] <= this.peaks[i]) {
						mgraphics.move_to((width / range) * (this.peaks[i] - min) + thickness, currY);
						mgraphics.line_to((width / range) * (this.peaks[i] - min) + thickness, currY + sliderHeight);

					}
					mgraphics.stroke();
				}

				if (setstyle === "Bar" || (setstyle === "Thin Line" && ghostbar > 0)) {
					if (setstyle === "Thin Line") mgraphics.set_source_rgba([colors[i % candycane][0], colors[i % candycane][1], colors[i % candycane][2], ghostbar / 100]);
					else mgraphics.set_source_rgba(colors[i % candycane]);
					mgraphics.rectangle(zeroX, currY, sliderX + thickness - zeroX, sliderHeight);
					mgraphics.fill();
				}
				else if (setstyle === "Point Scroll" || setstyle === "Reverse Point Scroll") {

					mgraphics.set_source_rgba(colors[i % candycane]);
					for (let j = 0; j < this._values[i].length; j++) {
						let cx = ((width / size) / range) * (this._values[i][j] - min);
						let cy = (setstyle === "Point Scroll") ? j : height - j;
						mgraphics.circle(((width / size) * (i)) + cx, cy, 0.5);
						mgraphics.fill();
					}
				}
				else if (setstyle === "Line Scroll" || setstyle === "Reverse Line Scroll") {
					mgraphics.set_source_rgba(colors[i % candycane]);
					for (let j = 0; j < this._values[i].length; j++) {
						let cx = ((width / size) / range) * (this._values[i][j] - min);
						let cy = (setstyle === "Line Scroll") ? j : height - j;
						let xZero;
						if (max >= 0 && min >= 0) {
							xZero = 0;
						} else if (max < 0 && min < 0) {
							xZero = 1.0;
						} else {
							xZero = -min / (max - min);
						}
						mgraphics.set_line_width(1);
						mgraphics.move_to(((width / size) * (i + xZero)), cy);
						mgraphics.line_to(((width / size) * (i)) + cx, cy);
						mgraphics.stroke();
					}


				}

				mgraphics.set_source_rgba(transparentcolor);
				mgraphics.rectangle(0, currY-spacing/2, width + thickness, sliderHeight + spacing);
				mgraphics.add_attribute("slider", i);
				mgraphics.fill();

				currY += sliderHeight + spacing;
			}

		} else if (orientation === "Vertical") {
			this.orientation = "vertical";
			// draw background
			let sliderWidth = (width - spacing*(size + 1)) / size;
			mgraphics.set_source_rgba(bgcolor);
			if (setstyle === "Point Scroll" || setstyle === "Line Scroll" || setstyle === "Reverse Point Scroll" || setstyle === "Reverse Line Scroll") mgraphics.rectangle(0, 0, width, height);
			else mgraphics.rectangle(0, 0, width, height + thickness);
			mgraphics.fill();

			let currX = spacing;
			for (let i = 0; i < size; i++) {
				let sliderY = (height / range) * (distance[i] - min);
				let zeroY = 0;

				if (setstyle === "Point Scroll" || setstyle === "Line Scroll" || setstyle === "Reverse Point Scroll" || setstyle === "Reverse Line Scroll") {
					if (!Array.isArray(this._values[i])) {
						this._values[i] = [];
					}
					if (this._values[i].length === width) this._values[i].pop();
					else if (this._values[i].length > width) this._values[i] = [];
					this._values[i].unshift(distance[i]);
				}
				mgraphics.set_source_rgba(colors[i % candycane]);
				mgraphics.set_line_width(thickness);
				if (setstyle === "Bar" || setstyle === "Thin Line") {
					mgraphics.move_to(currX, height - sliderY + (thickness / 2));
					mgraphics.line_to(currX + sliderWidth, height - sliderY + (thickness / 2));
					mgraphics.stroke();
				}
				if (signed === 1) {

					if (distance[i] > 0) {
						zeroY = ((height / range) * (0 - min));
					}
					else {
						zeroY = sliderY;
						sliderY = ((height / range) * (0 - min));
					}
				}
				if ((setstyle === "Bar" || setstyle === "Thin Line") && drawpeaks) {
					mgraphics.set_source_rgba(peakcolor);
					mgraphics.set_line_width(1);
					if (distance[i] > this.peaks[i]) {
						mgraphics.move_to(currX, height - sliderY);
						mgraphics.line_to(currX + sliderWidth, height - sliderY);
						this.peaks[i] = distance[i];
					} else if (distance[i] <= this.peaks[i]) {
						mgraphics.move_to(currX, height - ((height / range) * (this.peaks[i] - min)));
						mgraphics.line_to(currX + sliderWidth, height - ((height / range) * (this.peaks[i] - min)));

					}
					mgraphics.stroke();

				}


				if (setstyle === "Bar" || (setstyle === "Thin Line" && ghostbar > 0)) {
					if (setstyle === "Thin Line") mgraphics.set_source_rgba([colors[i % candycane][0], colors[i % candycane][1], colors[i % candycane][2], ghostbar / 100]);
					else mgraphics.set_source_rgba(colors[i % candycane]);
					mgraphics.rectangle(currX, height - sliderY, sliderWidth, sliderY + thickness - zeroY);
					mgraphics.fill();
				}
				else if (setstyle === "Point Scroll" || setstyle === "Reverse Point Scroll") {

					mgraphics.set_source_rgba(colors[i % candycane]);
					for (let j = 0; j < this._values[i].length; j++) {
						let cy = ((height / size) / range) * (this._values[i][j] - min);
						let cx = (setstyle === "Point Scroll") ? j : width - j;
						mgraphics.circle(cx, ((height / size) * (i + 1)) - cy, 0.5);
						mgraphics.fill();
					}
				}
				else if (setstyle === "Line Scroll" || setstyle === "Reverse Line Scroll") {
					mgraphics.set_source_rgba(colors[i % candycane]);
					for (let j = 0; j < this._values[i].length; j++) {
						let cy 	= ((height / size) / range) * (this._values[i][j] - min);
						let cx = (setstyle === "Line Scroll") ? j : width - j;
						mgraphics.set_line_width(1);
						let yZero;
						if (max >= 0 && min >= 0) {
							yZero = 1.0;
						} else if (max < 0 && min < 0) {
							yZero = 0;
						} else {
							yZero = max / (max - min);
						}
						mgraphics.move_to(cx, ((height / size) * (i + yZero)));
						mgraphics.line_to(cx, ((height / size) * (i + 1)) - cy);
						mgraphics.stroke();
					}

				}
				mgraphics.set_source_rgba(transparentcolor);
				mgraphics.rectangle(currX-spacing/2, 0, sliderWidth + spacing, height + thickness);
				mgraphics.add_attribute("slider", i);
				mgraphics.fill();

				currX += sliderWidth + spacing;
			}
		}
	}

	pointerDown(event, params) {
		let { distance, setminmax } = params;
		if (!Array.isArray(distance)) {
			distance = [distance];
		}
		let newVal;
		let range = setminmax[1] - setminmax[0];
		if (this.orientation === "vertical") {
			newVal = (1.0 - event.normTargetY) * range + setminmax[0];
		} else if (this.orientation === "horizontal") {
			newVal = (event.normTargetX) * range + setminmax[0];
		}
		newVal = (newVal > setminmax[1]) ? setminmax[1] : newVal;
		newVal = (newVal < setminmax[0]) ? setminmax[0] : newVal;
		distance[event.attributes.slider] = newVal;
		this.setParamValue("distance", distance);
	}

	pointerMove(event, params) {
		this.pointerDown(event, params);
	}
}

Multislider.NAME = "multislider";
