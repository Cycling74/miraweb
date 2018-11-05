import MiraUIObject from "./base.js";

const MAX_NUM_DECIMAL_PLACES = 6;
const PADDING = 4;
const TRIANGLE_BASE = 12;
const TRIANGLE_HEIGHT = 6;
const LEFT_TEXT_OFFSET = TRIANGLE_HEIGHT;

function toFixedTruncate(num, fixed) {
	let re = new RegExp("^-?\\d+(?:\.\\d{0," + (fixed || -1) + "})?");
	return parseFloat(num.toString().match(re)[0]);
}

export default class Number extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
		this.inTouch = false;
		this.multiplier = 1;
	}

	_formatValue(params) {
		const {
			format,
			numdecimalplaces,
			value
		} = params;

		let retStr;

		switch (format) {
			case "Decimal (Integer)":
				retStr = parseInt(value, 10).toString();
				break;

			case "Decimal (Floating-Point)":
				if (value % 1 === 0 && numdecimalplaces === 0) {
					retStr = value + ".";
				}
				else {
					if (numdecimalplaces === 0) {
						retStr = parseFloat(value.toFixed(MAX_NUM_DECIMAL_PLACES)).toString();
					} else {
						retStr = value.toFixed(numdecimalplaces);
					}
				}
				break;

			case "MIDI":
			case "MIDI (C4)": {

				const noteArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
				let base = 2;
				if (format === "MIDI (C4)") base = 1;
				const note = noteArray[value % 12] + (Math.floor(value / 12) - base).toString();
				if (value <= 127 && value >= 0) {
					retStr = note;
				} else if (value < 0) {
					retStr = "-";
				} else if (value > 127) {
					retStr = "+";
				}
				break;
			}
			case "Binary":
				retStr = (value >>> 0).toString(2);
				break;

			case "Hex":
				retStr = (value >>> 0).toString(16).toUpperCase();
				break;

			case "Roland Octal": {
				let dec1 = ((value >> 3) + 1);
				let dec2 = ((value & 7) + 1);
				retStr = dec1.toString() + dec2.toString();
				break;
			}
			default:
				break;
		}
		return retStr;
	}

	paint(mgraphics, params) {
		const {
			fontsize,
			fontname,
			fontface,
			bgcolor,
			textcolor,
			tricolor,
			triscale,
			htricolor,
			width,
			height
		} = params;

		let triangleBase = TRIANGLE_BASE * triscale;
		let triangleHeight = TRIANGLE_HEIGHT * triscale;
		let leftTextOffset  = LEFT_TEXT_OFFSET * triscale;

		const valueStr = this._formatValue(params);

		// draw background
		mgraphics.set_source_rgba(bgcolor);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();

		mgraphics.set_font_name(fontname);
		mgraphics.set_font_weight(fontface);
		mgraphics.set_font_size(fontsize);

		mgraphics.set_source_rgba(textcolor);
		mgraphics.textLine(leftTextOffset + (3 * PADDING / 2), PADDING, width - leftTextOffset - (PADDING + 2), height - (2 * PADDING), valueStr);

		// Draw triangle
		mgraphics.set_source_rgba((this.inTouch) ? htricolor : tricolor);
		mgraphics.polygon(PADDING, (height / 2) - (triangleBase / 2), [[0, 0], [0, triangleBase], [triangleHeight, triangleBase / 2]]);
		mgraphics.fill();
	}

	pointerDown(event, params) {
		const { fontname, fontface, fontsize, format, width } = params;
		let { value, numdecimalplaces } = params;
		if (numdecimalplaces === 0) numdecimalplaces = 6;
		const mgraphics = this._displayNode;

		mgraphics.set_font_name(fontname);
		mgraphics.set_font_weight(fontface);
		mgraphics.set_font_size(fontsize);

		const stringValue = value.toFixed(numdecimalplaces);
		const decimalArray = stringValue.split(".");
		const textStart = LEFT_TEXT_OFFSET + (3 * PADDING / 2);

		// this is the code to target which decimal place is being dragged
		// if it is to the left of the decimal point, the number is changed
		// by 1
		// if it is to the right of the decimal point, the number is changed
		// based on the distance from the decimal point
		if (format === "Decimal (Floating-Point)") {
			for (let i = -1; i < numdecimalplaces; i++) {
				let numberText;
				if (i === -1) {
					numberText = decimalArray[0] + ".";
				} else {
					numberText = decimalArray[0] + "." + decimalArray[1].substring(0, i + 1);
				}
				const textWidth = mgraphics.textDimensions(numberText).width;
				if (event.normTargetX * width < (textWidth + textStart)) {
					this.multiplier = Math.pow(10, -(i + 1));
					break;
				} else {
					this.multiplier = Math.pow(10, -(numdecimalplaces));
				}
			}
		}

		this.inTouch = true;
		this.render();
	}

	pointerMove(event, params) {
		const { value, minimum, maximum } = params;
		let newVal = toFixedTruncate(value, -Math.log10(this.multiplier));
		newVal = newVal - event.screenDeltaY * this.multiplier;
		console.log(minimum);
		this.setParamValue("value",  Math.min(maximum,Math.max(minimum,newVal)));
	}

	pointerUp(event, params) {
		this.inTouch = false;
		this.render();
	}
}

Number.NAME = ["number", "flonum"];
