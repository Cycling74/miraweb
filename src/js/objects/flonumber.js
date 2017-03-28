import MiraUIObject from "./base.js";

const PADDING = 4;
const TRIANGLE_BASE = 12;
const TRIANGLE_HEIGHT = 6;
const LEFT_TEXT_OFFSET = TRIANGLE_HEIGHT;

function toFixedTruncate(num, fixed) {
	let re = new RegExp("^-?\\d+(?:\.\\d{0," + (fixed || -1) + "})?");
	return parseFloat(num.toString().match(re)[0]);
}

export default class Flonum extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
		this.inTouch = false;
		this.multiplier = 1;
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

		let {
			value,
			numdecimalplaces
		} = params;

		if (value % 1 === 0) {
			value = value + ".";
		}
		else {
			if (numdecimalplaces === 0) numdecimalplaces = 6;
			value = parseFloat(value.toFixed(numdecimalplaces));
		}

		// draw background
		mgraphics.set_source_rgba(bgcolor);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();

		mgraphics.set_font_name(fontname);
		mgraphics.set_font_weight(fontface);
		mgraphics.set_font_size(fontsize);

		mgraphics.set_source_rgba(textcolor);
		mgraphics.textLine(leftTextOffset + (3 * PADDING / 2), PADDING, width - leftTextOffset - (PADDING + 2), height - (2 * PADDING), value);

		// Draw triangle
		mgraphics.set_source_rgba((this.inTouch) ? htricolor : tricolor);
		mgraphics.polygon(PADDING, (height / 2) - (triangleBase / 2), [[0, 0], [0, triangleBase], [triangleHeight, triangleBase / 2]]);
		mgraphics.fill();
	}

	pointerDown(event, params) {
		const { fontname, fontface, fontsize, width } = params;
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

		this.inTouch = true;
		this.render();
	}

	pointerMove(event, params) {
		const { value } = params;
		let newVal = toFixedTruncate(value, -Math.log10(this.multiplier));
		newVal = newVal - event.screenDeltaY * this.multiplier;
		this.setParamValue("value", newVal);
	}

	pointerUp(event, params) {
		this.inTouch = false;
		this.render();
	}
}

Flonum.NAME = "flonum";
