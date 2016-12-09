import ActiveFrameStore from "../stores/activeFrame.js";
import PixiDraw from "./pixiUiObject";

export default class ValueLabel extends PixiDraw {

	constructor(id, description, sourceRect) {
		super( id, 0, {} );
		this.sourceRect = sourceRect;
		this.updatePopoverDescription(description);
		this.paint();
	}

	get label() {
		return this._label;
	}

	set label(ntext) {
		this._label = ntext;
		this.setRect(this.preferredRect);
		this.paint();
	}

	set sourceRect(srect) {
		this._sourceRect = srect;
	}

	get preferredRect() {
		// This preferred rect is in screen coordinates. So is sourceRect. So, we don't need to
		// worry about scale here.
		let rectWidth = this.constructor.MIN_WIDTH;
		let rect = [
			this._sourceRect[0] + Math.floor((this._sourceRect[2] - rectWidth) / 2),
			this._sourceRect[1],
			rectWidth,
			this.constructor.HEIGHT
		];
		if (this._isOffFrameTop()) {
			rect[1] += (this.constructor.Y_OFFSET + this._sourceRect[3] - this.constructor.HEIGHT);
		} else {
			rect[1] += -1 * this.constructor.Y_OFFSET;
		}
		return rect;
	}

	_isOffFrameTop() {
		let tooHigh = false;
		if (this._sourceRect) {
			tooHigh = this._sourceRect[1] < (this.constructor.Y_OFFSET + 2);
		}
		return tooHigh;
	}

	destroy() { }

	paint() {
		// Pixidraw takes the scale of the miraweb canvas relative to Max into account, so that
		// paint code like this can be scale-invariant. However, we want the popover to paint
		// at a fixed scale, so we divide out the scale here.
		const scale = ActiveFrameStore.getScale();
		let rectWidth = this.constructor.MIN_WIDTH / scale;

		this.clear();
		this.rectangle(
			0,
			0,
			rectWidth,
			this.constructor.HEIGHT / scale,
			this.constructor.BORDER_RADIUS / scale
		);
		this.set_source_rgba(this.constructor.BACKGROUND_COLOR);
		this.fill();

		this.set_font_size(this.constructor.FONT_SIZE / scale);
		this.set_font_name(this.constructor.FONT_NAME);
		this.set_font_weight(this.constructor.FONT_WEIGHT);
		this.set_font_justification(this.constructor.FONT_JUSTIFICATION);
		this.set_source_rgba([1, 1, 1]);
		this.textLine(0, this.constructor.FONT_PADDING / scale, rectWidth, this.constructor.HEIGHT / scale, this._label);
	}

	movePopover(sourceRect) {
		this.sourceRect = sourceRect;
		this.setRect(this.preferredRect);
	}

	setRect(rect) {
		super.setRect(rect);
		this.paint();
	}

	updatePopoverDescription(description) {
		this.label = description;
	}
}

ValueLabel.FONT_JUSTIFICATION = "center";
ValueLabel.FONT_NAME = "Arial";
ValueLabel.FONT_PADDING = 2;
ValueLabel.FONT_SIZE = 24;
ValueLabel.FONT_WEIGHT = "regular";

ValueLabel.BACKGROUND_COLOR = [0.29, 0.309, 0.301];
ValueLabel.BORDER_RADIUS = 5;
ValueLabel.HEIGHT = 34;
ValueLabel.MIN_WIDTH = 2 * ValueLabel.HEIGHT;
ValueLabel.Y_OFFSET = ~~(1.5 * ValueLabel.HEIGHT);
