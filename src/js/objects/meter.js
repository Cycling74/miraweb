import MiraUIObject from "./base.js";

export default class Meter extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
		this.overloaded = false;
		this.resetOverloaded = this.resetOverloaded.bind(this);
	}

	resetOverloaded() {
		this.overloaded = false;
		this.render();
	}

	paint(mgraphics, params) {
		const {
			bgcolor,
			offcolor,
			ntepidleds,
			nwarmleds,
			nhotleds,
			dbperled,
			coldcolor,
			tepidcolor,
			warmcolor,
			hotcolor,
			overloadcolor,
			level,
			width,
			height
		} = params;

		const ledMargin = 6;
		const isVertical = (height > width) ? 1 : 0;
		let numleds = params.numleds;
		// draw background
		mgraphics.set_source_rgba(bgcolor);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();
		// there is always an overload led
		numleds += 1;

		const max = (20.0 * Math.log10(Math.max(0.000001, level))) / dbperled + (numleds - 0.5);
		const ledcolorarray = [overloadcolor];

		for (let i = 0; i < nhotleds; i++) {
			ledcolorarray.push(hotcolor);
		}

		for (let i = 0; i < nwarmleds; i++) {
			ledcolorarray.push(warmcolor);
		}

		for (let i = 0; i < ntepidleds; i++) {
			ledcolorarray.push(tepidcolor);
		}

		const ncoldleds = numleds - ledcolorarray.length;

		for (let i = 0; i < ncoldleds; i++) {
			ledcolorarray.push(coldcolor);
		}

		// draw leds

		let ledcolor = offcolor;

		if (isVertical === 1) {
			const ledrect = ((height - ledMargin) - (numleds - 1)) / numleds;
			for (let i = 0; i < numleds; i++) {
				if (i < (numleds - max)) {
					ledcolor = offcolor;
				}
				else {
					ledcolor = ledcolorarray[i];
				}

				if (level >= 1.0 && i === 0) {
					this.overloaded = true;
					ledcolor = overloadcolor;
				}

				if (level < 1.0 && i === 0 && this.overloaded) {
					ledcolor = overloadcolor;
				}

				mgraphics.set_source_rgba(ledcolor);
				mgraphics.rectangle((ledMargin / 2), ((ledrect * i) + i) + (ledMargin / 2), width - ledMargin, ledrect);
				mgraphics.fill();

				if (this.overloaded && level < 1.0) {
					clearTimeout(this.timer);
					this.timer = setTimeout(this.resetOverloaded, 500);
				}
			}
		}

		if (isVertical === 0) {
			let ledrect = ((width - ledMargin) - (numleds - 1)) / numleds;
			ledcolorarray.reverse();
			for (let i = 0; i < numleds; i++) {
				if (i < (max - 1)) {
					ledcolor = ledcolorarray[i];
				}
				else {
					ledcolor = offcolor;
				}
				if (level >= 1.0 && i === (numleds - 1)) {
					this.overloaded = true;
					ledcolor = overloadcolor;
				}
				if (level < 1.0 && i === (numleds - 1) && this.overloaded) {
					ledcolor = overloadcolor;
				}

				mgraphics.set_source_rgba(ledcolor);
				mgraphics.rectangle(((ledrect * i) + i) + (ledMargin / 2), ledMargin / 2, ledrect, height - ledMargin);
				mgraphics.fill();
				if (this.overloaded && level < 1.0) {
					clearTimeout(this.timer);
					this.timer = setTimeout(this.resetOverloaded, 500);
				}
			}
		}
	}
}

Meter.NAME = "meter~";
