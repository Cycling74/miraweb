import MiraUIObject from "./base.js";
import { POPOVER_TYPES } from "../stores/popover.js";

export default class Umenu extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);

		this._parameterChangeCb = this._onUpdateParam.bind(this);
		this._popoverToggle = false;
		this._state.on("param_changed", this._parameterChangeCb);
	}

	_getItems() {
		let items = this._state.getParamValue("items");
		if (!items || !items.length || items === "<empty>") return null;
		if (!Array.isArray(items)) items = [items];

		const entries = [];
		let nextVal = null;
		items.forEach((val, idx) => {
			if (val === ",") {
				entries.push("" + nextVal);
				nextVal = null;
			} else {
				if (nextVal) {
					nextVal = nextVal + " " + val;
				} else {
					nextVal = val;
				}
				if (idx === items.length - 1) entries.push(nextVal);
			}
		});

		return entries;
	}

	_onPopoverCancel() {
		this.hidePopover();
	}

	_onPopoverSelect(index) {
		this.hidePopover();
		if (index !== undefined) this.setParamValue("value", index);
	}

	_onUpdateParam(stateObj, param) {
		const popoverParams = ["fontsize", "fontname", "fontface", "textjustification", "items"];
		if (popoverParams.indexOf(param.type) >= 0) {
			if (this.isPopoverVisible()) {
				const params = {};
				popoverParams.forEach( (p) => {
					params[p] = stateObj.getParamValue(p);
					this.updatePopover(this._popoverDescription(params));
				});
			}
		}
	}

	_popoverType() {
		return POPOVER_TYPES.MENU_LIST;
	}

	_popoverDescription(params) {
		let {
			fontsize, fontname, fontface, textjustification
		} = params;
		let description = {
			fontface, fontname, fontsize, textjustification,
			onCancel : this._onPopoverCancel.bind(this),
			onSelect : this._onPopoverSelect.bind(this),
			items : this._getItems(),
			scrollOffset : this._previousPopoverScrollOffset
		};
		return description;
	}

	/**
	 * Override destroy function to detach _configureGestureRecognizers properly
	 * @override
	 */
	destroy() {
		this._state.removeListener("param_changed", this._parameterChangeCb);
		super.destroy(arguments);
	}

	hidePopover() {
		this._previousPopoverScrollOffset = this.popover().scrollOffset;
		super.hidePopover();
	}

	paint(mgraphics, params) {
		const {
			width,
			height,
			arrow,
			bgfillcolor_type,
			bgfillcolor_color1,
			bgfillcolor_color2,
			bgfillcolor_pt1,
			bgfillcolor_pt2,
			bgfillcolor_color,
			bgfillcolor_proportion,
			bgfillcolor_angle,
			fontname,
			fontsize,
			fontface,
			textcolor,
			textjustification,
			value
		} = params;
		const items = this._getItems();
		const padding = 4;
		// draw background
		if (bgfillcolor_type === "gradient") {
			mgraphics.set_source_gradient(
				[ bgfillcolor_color1, bgfillcolor_color2 ],
				bgfillcolor_pt1,
				bgfillcolor_pt2,
				bgfillcolor_proportion,
				bgfillcolor_angle
			);
		} else {
			mgraphics.set_source_rgba(bgfillcolor_color);
		}

		mgraphics.rectangle(0, 0, width, height);
		mgraphics.fill();

		// draw arrow
		if (arrow === 1) {
			mgraphics.set_source_rgba(textcolor);
			mgraphics.polygon(width - 10, height * 0.5, [[-4.5, -2], [4.5, -2], [0, 3]]);
			mgraphics.fill();
		}

		// draw current selection
		if (items) {
			if (!this.cachedText) {
				mgraphics.set_font_name(fontname);
				mgraphics.set_font_weight(fontface);
				mgraphics.set_font_size(fontsize);
				mgraphics.set_font_justification(textjustification);
				mgraphics.set_source_rgba(textcolor);
				this.cachedText = mgraphics.textLine(padding + 1, padding, width - 18 - padding, height, items[value]);
			} else {
				this.displayElement.addChild(this.cachedText);
			}
		}

		this._lastRenderedWidth = this.getMaxRect()[2];
		this._lastRenderedHeight = this.getMaxRect()[3];
	}

	pointerDown(event, params) {
		if (!this.isPopoverVisible()) {
			this.showPopover(this._popoverType(), this._popoverDescription(params));

			// Make sure that we don't hide the popover that we just displayed by grabbing focus
			this._displayNode.rejectFocus();
		} else {
			this.hidePopover();
		}
	}
}

Umenu.NAME = "umenu";
