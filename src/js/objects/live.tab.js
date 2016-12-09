import MiraUIObject from "./base.js";
import RemoteSprite from "../lib/remoteSprite.js";
import ActiveFrameStore from "../stores/activeFrame.js";
import { VIEW_MODES } from "xebra.js";

export default class LiveTab extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
		this._inTouch = false;
		this._createNewResourceSprites.call(this, stateObj);
		this._resourcesChangedCb = this._createNewResourceSprites.bind(this);
		this._state.on("resources_changed", this._resourcesChangedCb);
	}

	_clearResourceSprites() {
		if (this._remoteSprites) {
			this._remoteSprites.forEach((rem) => {
				rem.destroy();
				rem.display.parent.removeChild(rem.display);
			});
		}

		this._remoteSprites = [];
	}

	_createNewResourceSprites(stateObj) {
		this._clearResourceSprites();
		const resourceCount = stateObj.getResourceCount();
		for (let i = 0; i < resourceCount; i++) {
			const res = stateObj.getResourceAtIndex(i);
			const remoteSprite = new RemoteSprite(res);
			remoteSprite.on("update", this.render.bind(this));
			this._displayNode.addDisplayChild(remoteSprite.display);
			this._remoteSprites.push(remoteSprite);
		}
	}

	_insetRect(rect, inset) {
		return [
			rect[0] + inset,
			rect[1] + inset,
			rect[2] - 2 * inset,
			rect[3] - 2 * inset
		];
	}

	// Return an array of rectangles, representing the local bounds of each tab
	_tabRects(mgraphics) {
		const screenRect = this.getScreenRect();
		const scale = ActiveFrameStore.getScale();
		// These rectangles are going to be used to paint the tab backgrounds, and mgraphics will scale
		// up from max coords to screen coords. So, all of the calculations in this function are in
		// max coords
		const rect = 	screenRect.map(c => c / scale);
		const inPresentation = ActiveFrameStore.getViewMode() === VIEW_MODES.PRESENTATION;
		let defaultHeight = 10;
		let numTabs = this._state.getParamValue("_parameter_range").length;
		let numTabsPerLine = numTabs;
		let numLines = 1;
		let step = 0;
		let interval = 0;
		let width = 0;
		let spacingX = this._state.getParamValue("spacing_x") * 0.5;
		let spacingY = this._state.getParamValue("spacing_y") * 0.5;
		const outRects = [];

		// Figure out how many rows and columns to use
		if (this._state.getParamValue("num_lines_patching") > 0 && !inPresentation) {
			numLines = this._state.getParamValue("num_lines_patching");
			numTabsPerLine = Math.ceil( numTabs / numLines );
			step = rect[3] / numLines;
		} else if (this._state.getParamValue("num_lines_presentation") > 0 && inPresentation) {
			numLines = this._state.getParamValue("num_lines_presentation");
			numTabsPerLine = Math.ceil( numTabs / numLines );
			step = rect[3] / numLines;
		} else if (this._state.getParamValue("multiline") && (rect[3] >= 2 * defaultHeight)) {
			numLines = Math.min( numTabs, Math.floor(rect[3] / defaultHeight) );
			numLines = numLines < 1 ? 1 : numLines;
			numTabsPerLine = Math.ceil( numTabs / numLines );

				// if there's not enough height, increase the number of tabs per row
			while (numLines * numTabsPerLine < numTabs) {
				numTabsPerLine++;
				if (numLines > 1)
						{numLines--;}
			}

				// if there's extra height, reduce the number of rows
			while (numLines * numTabsPerLine > numTabs && (numLines - 1) * numTabsPerLine >= numTabs) {
				numLines--;
			}
			step = rect[3] / numLines;
		} else {
			step = 0.0;
			numLines = 1;
		}

		// Pictures are assumed always to have the same dimensions
		if (this._state.getParamValue("mode") === this.constructor.spacing.LIVETAB_EQUAL_SPACING
			||
			this._state.getParamValue("usepicture")) {

			// Add the rects to output
			interval = rect[2] / numTabsPerLine;
			width = interval - spacingX;
			for (let i = 0; i < numTabs; i++) {
				let tabRect = new Array(4);
				tabRect[0] = (i % numTabsPerLine) * interval;
				tabRect[0] += 0.5 * spacingX;
				tabRect[1] = (Math.floor(i / numTabsPerLine) * step + 0.5 * spacingY);
				tabRect[2] = width;
				tabRect[3] = (rect[3] / numLines) - spacingY;
				outRects.push(tabRect);
			}
		} else {
			let total = 0;
			let availableSpace = rect[2];
			for (let i = 0; i < numLines; i++) {
				// Calculate how much space each tab on that row can have
				availableSpace = rect[2];
				total = 0;
				for (let j = i * numTabsPerLine; j < Math.min((i + 1) * numTabsPerLine, numTabs); j++) {
					let textDimensions = mgraphics.textDimensions(this._state.getParamValue("_parameter_range")[j]);
					total += textDimensions.width;
					availableSpace -= 2.0 * this.constructor.MARGIN;
					availableSpace -= spacingX;
				}

				// Make the rect for each tab based on that calculation
				width = 0;
				for (let j = i * numTabsPerLine; j < Math.min((i + 1) * numTabsPerLine, numTabs); j++) {
					let textDimensions = mgraphics.textDimensions(this._state.getParamValue("_parameter_range")[j]);
					let spaceFrac = textDimensions.width / total;
					let tabRect = new Array(4);
					tabRect[0] = width + 0.5 * spacingX;
					tabRect[1] = (i * step + 0.5 * spacingY);
					tabRect[2] = (availableSpace * spaceFrac) + (2 * this.constructor.MARGIN);
					tabRect[3] = (rect[3] / numLines) - spacingY;
					width += tabRect[2] + spacingX;
					outRects.push(tabRect);
				}
			}
		}
		return outRects;
	}

	destroy() {
		this._state.removeListener("resources_changed", this._resourcesChangedCb);
		this._clearResourceSprites();
		super.destroy();
	}

	paint(mgraphics, params) {
		const {
			active,
			activebgcolor,
			activebgoncolor,
			bgcolor,
			bgoncolor,
			bordercolor,
			fontname,
			fontsize,
			fontface,
			_parameter_range,
			value,
			usepicture
		} = params;
		const tabRects = this._tabRects(mgraphics);
		const scale = this._getActiveFrameScale();

		for (let i = 0; i < _parameter_range.length; i++) {
			mgraphics.set_source_rgba((active === 1) ? ((value === i) ? activebgoncolor : activebgcolor) : ((value === i) ? bgoncolor : bgcolor));
			mgraphics.rectangle(tabRects[i][0], tabRects[i][1], tabRects[i][2], tabRects[i][3]);
			mgraphics.add_attribute("tab", i);
			mgraphics.fill();

			// TODO: Ask someone, maybe Rohail, what this was meant to accomplish?
			// if (value === i) {

			// 	if (!this._inTouch) {
			// 		setTimeout(function() {
			// 			this.setParamValue("value", -1);
			// 		}.bind(this), 100);
			// 	}
			// }

			mgraphics.set_line_width(0.5);
			mgraphics.set_source_rgba(bordercolor);
			mgraphics.stroke();

			// display the text
			if (!usepicture) {
				mgraphics.set_font_name(fontname);
				mgraphics.set_font_weight(fontface);
				mgraphics.set_font_size(fontsize);
				mgraphics.set_font_justification("center");
				mgraphics.textLine(tabRects[i][0], tabRects[i][1] + (tabRects[i][3] - fontsize - 2) / 2, tabRects[i][2], tabRects[i][3], _parameter_range[i]);
			}
		}

		if (usepicture) {
			this._remoteSprites.forEach((sprite, sidx) => {
				if (sidx < _parameter_range.length) {
					let scaledRect = tabRects[sidx].map(c => scale * c);
					scaledRect = this._insetRect(scaledRect, scale * this.constructor.PIC_MARGIN);
					sprite.dimensions = { width : scaledRect[2], height : scaledRect[3] };
					sprite.display.x = scaledRect[0];
					sprite.display.y = scaledRect[1];
					sprite.display.visible = true;
				} else {
					sprite.display.visible = false;
				}
			});
		}
	}

	parameterIsOptional(paramName) {
		return paramName === "pictures";
	}

	pointerDown(event, params) {
		this._inTouch = true;
		let tab = event.attributes.tab;
		if (tab !== undefined) this.setParamValue("value", tab);
	}

	pointerUp(event, params) {
		this._inTouch = false;
	}
}

LiveTab.NAME = "live.tab";

LiveTab.spacing = {
	LIVETAB_EQUAL_SPACING : "Equal Spaced",
	LIVETAB_PROP_SPACING : "Proportional"
};

LiveTab.MARGIN = 4.0;
LiveTab.PIC_MARGIN = 1.0;
