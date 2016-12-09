import ActiveFrameStore from "../stores/activeFrame.js";
import PixiDraw from "./pixiUiObject";

export default class ColorLabel extends PixiDraw {
	constructor(id, description, sourceRect) {
		super( id, 0, {} );
		this.sourceRect = sourceRect;
		this.updatePopoverDescription(description);
		this.paint();
	}

	get labelColor() {
		return this._labelColor;
	}

	set labelColor(value) {
		this._labelColor = value;
		this.setRect(this.preferredRect);
		this.paint();
	}

	set sourceRect(srect) {
		this._sourceRect = srect;
	}

	get preferredRect() {
		const scale = ActiveFrameStore.getScale();
		let rectWidth = this.constructor.MIN_WIDTH;
		let rect = [
			this._sourceRect[0] + Math.floor((this._sourceRect[2] - rectWidth) / 2),
			this._sourceRect[1],
			rectWidth,
			this.constructor.HEIGHT
		];
		if (this._isOffFrameTop()) {
			rect[1] += (this.constructor.Y_OFFSET + this._sourceRect[3] / scale - this.constructor.HEIGHT);
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
		this.set_source_rgba(this._labelColor);
		this.fill();
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
		this.labelColor = description;
	}
}

ColorLabel.BORDER_RADIUS = 5;
ColorLabel.HEIGHT = 34;
ColorLabel.MIN_WIDTH = 2 * ColorLabel.HEIGHT;
ColorLabel.Y_OFFSET = ~~(1.5 * ColorLabel.HEIGHT);
