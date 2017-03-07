import MiraUIObject from "./base.js";
import { POPOVER_TYPES } from "../stores/popover.js";
import { Animation } from "../lib/animation.js";

// CAT - I think these functions are easier to read in this more compact
// form, so I decided to disable eslint
/* eslint-disable */
function hsvToRgb(h, s, v) {
	let r, g, b, i, f, p, q, t;
	if (arguments.length === 1) {
		s = h.s, v = h.l, h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return [r, g, b];
}

function hslToRgb(h, s, l) {
	let r, g, b;

	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		}

		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [r, g, b];
}

function rgbToHsl(r, g, b) {
	if (arguments.length === 1) {
		g = r.g, b = r.b, r = r.r;
	}
	let max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}

		h /= 6;
	}

	return [ h, s, l ];
}
/* eslint-enable */

export default class Swatch extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
		this._innerCircleRadius = this.constructor.INNER_CIRCLE_MIN;
		this._outerCircleRadius = this.constructor.OUTER_CIRCLE_MIN;
	}

	_popoverType() {
		return POPOVER_TYPES.COLOR_LABEL;
	}

	_popoverDescription(params) {
		const { value, compatibility } = params;
		if (compatibility === 1) {
			return [value[0] / 255, value[1] / 255, value[2] / 255];
		}
		return [value[0], value[1], value[2]];
	}

	paint(mgraphics, params) {
		const {
			width, height, value, compatibility, saturation
		} = params;
		let normalizedSaturation = saturation;
		if (compatibility === 1) {
			normalizedSaturation = saturation / 255;
		}
		mgraphics.rectangle(0, 0, width, height);

		// Draw the rainbow background
		let colors = [];
		for (let i = 0; i < 7; i++) {
			const color = hsvToRgb(i / 6, 1, 1);
			colors.push( [ color[0], color[1], color[2], normalizedSaturation ] );
		}
		mgraphics.set_source_gradient(
			colors,
			[0, 0.5],
			[1.0, 0.5],
			0.5,
			0
		);
		mgraphics.fill();

		// Draw the "value" overlay
		let brightnessMaskColors = [
			[1, 1, 1, 1],
			[0.5, 0.5, 0.5, 1.0 - normalizedSaturation],
			[0, 0, 0, 1]
		];
		mgraphics.set_source_gradient(
			brightnessMaskColors,
			[0.5, 0],
			[0.5, 1],
			0.5,
			0
		);
		mgraphics.fill();

		let pickerPositionX;
		let pickerPositionY;
		if (compatibility === 1) {
			const hsvColor = rgbToHsl(value[0] / 255, value[1] / 255, value[2] / 255);
			pickerPositionX = width * hsvColor[0];
			pickerPositionY = height * (1.0 - hsvColor[2]);
		} else {
			pickerPositionX = width * value[4];
			pickerPositionY = height * (1.0 - value[6]);
		}

    // Draw Circle picker
		mgraphics.set_source_rgba([0, 0, 0, 1.0]);
		mgraphics.set_line_width(2);
		mgraphics.circle(pickerPositionX, pickerPositionY, this._innerCircleRadius);
		mgraphics.stroke();
		mgraphics.set_source_rgba([1, 1, 1, 1.0]);
		mgraphics.set_line_width(2);
		mgraphics.circle(pickerPositionX, pickerPositionY, this._outerCircleRadius);
		mgraphics.stroke();
	}

	pointerDown(event, params) {
		const { compatibility, saturation } = params;
		if (event.normTargetX >= 0 && event.normTargetX <= 1.0
      && event.normTargetY >= 0 && event.normTargetY <= 1.0) {
			if (compatibility === 1) {
				const h = event.normTargetX;
				const s = saturation / 255;
				const l = 1.0 - event.normTargetY;
				const rgb = hslToRgb(h, s, l);
				const newVal = [rgb[0] * 255, rgb[1] * 255, rgb[2] * 255];
				this.setParamValue("value", newVal);
			} else {
				const h = event.normTargetX;
				const s = saturation;
				const l = 1.0 - event.normTargetY;
				const rgb = hslToRgb(h, s, l);
				const newVal = [rgb[0], rgb[1], rgb[2], 1.0, h, s, l];
				this.setParamValue("value", newVal);
			}

			if (!this.isPopoverVisible()) {
				this.showPopover(this._popoverType(), this._popoverDescription(params));
				const growCircleAnimation = new Animation({
					duration : 100,
					onAnimate : (progress) => {
						this._innerCircleRadius = (this.constructor.INNER_CIRCLE_MAX
              - this.constructor.INNER_CIRCLE_MIN) * progress + this.constructor.INNER_CIRCLE_MIN;
						this._outerCircleRadius = (this.constructor.OUTER_CIRCLE_MAX
              - this.constructor.OUTER_CIRCLE_MIN) * progress + this.constructor.OUTER_CIRCLE_MIN;
						this.render();
					}
				});
				growCircleAnimation.start();
			}

			this.updatePopover(this._popoverDescription(params));
		}
	}

	pointerMove(event, params) {
		this.pointerDown(event, params);
	}

	pointerUp(event, params) {
		if (this.isPopoverVisible()) {
			this.hidePopover();
			const shrinkCircleAnimation = new Animation({
				duration : 100,
				onAnimate : (progress) => {
					this._innerCircleRadius = (this.constructor.INNER_CIRCLE_MAX
            - this.constructor.INNER_CIRCLE_MIN) * (1.0 - progress) + this.constructor.INNER_CIRCLE_MIN;
					this._outerCircleRadius = (this.constructor.OUTER_CIRCLE_MAX
            - this.constructor.OUTER_CIRCLE_MIN) * (1.0 - progress) + this.constructor.OUTER_CIRCLE_MIN;
					this.render();
				}
			});
			shrinkCircleAnimation.start();
		}
		this.render();
	}
}

Swatch.NAME = "swatch";

Swatch.INNER_CIRCLE_MIN = 7.0;
Swatch.OUTER_CIRCLE_MIN = 8.9;
Swatch.INNER_CIRCLE_MAX = 13.0;
Swatch.OUTER_CIRCLE_MAX = 15.1;
