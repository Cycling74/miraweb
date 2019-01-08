import MiraUIObject from "./base.js";

export default class Meter extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
		this.overloaded = [];
		this.timers = [];
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
		const mc_level = params["mc.level"];
		const channelCount = mc_level ? mc_level.length : 1;
		const levelSrc = channelCount > 1 ? mc_level : level;

		const ledMargin = 6;
		const isVertical = (height > width) ? 1 : 0;
		let numleds = params.numleds;
		// draw background
		mgraphics.set_source_rgba(bgcolor);
		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();
		// there is always an overload led
		numleds += 1;

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
			const ledheight = ((height - ledMargin) - (numleds - 1)) / numleds;
			const ledwidth = ((width - ledMargin) - (channelCount - 1)) / channelCount;
			for (let c = 0; c < channelCount; c++) {
				const max = (20.0 * Math.log10(Math.max(0.000001, levelSrc[c]))) / dbperled + (numleds - 0.5);
				for (let i = 0; i < numleds; i++) {
					if (i < (numleds - max)) {
						ledcolor = offcolor;
					} else {
						ledcolor = ledcolorarray[i];
					}

					if (levelSrc[c] >= 1.0 && i === 0) {
						this.overloaded[c] = true;
						ledcolor = overloadcolor;
					}

					if (levelSrc[c] < 1.0 && i === 0 && this.overloaded[c]) {
						ledcolor = overloadcolor;
					}

					mgraphics.set_source_rgba(ledcolor);
					mgraphics.rectangle(
						((ledwidth * c) + c) + (ledMargin / 2),
						((ledheight * i) + i) + (ledMargin / 2),
						ledwidth,
						ledheight
					);
					mgraphics.fill();
				}
				if (this.overloaded[c] && levelSrc[c] < 1.0) {
					if (!this.timers[c]) {
						this.timers[c] = setTimeout((() => {
							this.overloaded[c] = false;
							this.timers[c] = null;
							this.render()
						}).bind(this), 500);
					}
				}
			}
		}

		if (isVertical === 0) {
			const ledwidth = ((width - ledMargin) - (numleds - 1)) / numleds;
			const ledheight = ((height - ledMargin) - (channelCount - 1)) / channelCount;
			ledcolorarray.reverse();
			for (let c = 0; c < channelCount; c++) {
				const max = (20.0 * Math.log10(Math.max(0.000001, levelSrc[c]))) / dbperled + (numleds - 0.5);
				for (let i = 0; i < numleds; i++) {
					if (i < (max - 1)) {
						ledcolor = ledcolorarray[i];
					} else {
						ledcolor = offcolor;
					}
					if (levelSrc[c] >= 1.0 && i === (numleds - 1)) {
						this.overloaded[c] = true;
						ledcolor = overloadcolor;
					}
					if (levelSrc[c] < 1.0 && i === (numleds - 1) && this.overloaded[c]) {
						ledcolor = overloadcolor;
					}

					mgraphics.set_source_rgba(ledcolor);
					mgraphics.rectangle(
						((ledwidth * i) + i) + (ledMargin / 2),
						((ledheight * c) + c) + (ledMargin / 2),
						ledwidth,
						ledheight
					);
					mgraphics.fill();
				}
				if (this.overloaded[c] && levelSrc[c] < 1.0) {
					if (!this.timers[c]) {
						this.timers[c] = setTimeout((() => {
							this.overloaded[c] = false;
							this.timers[c] = null;
							this.render()
						}).bind(this), 500);
					}
				}
			}
		}
	}
}

Meter.NAME = "meter~";
