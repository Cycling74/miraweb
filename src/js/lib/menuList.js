import ActiveFrameStore from "../stores/activeFrame.js";
import FocusStore from "../stores/focus.js";
import * as PIXI from "pixi.js";
import PixiDraw from "./pixiUiObject";
import _ from "lodash";

export default class MenuList extends PixiDraw {

	constructor(id, description, sourceRect) {
		super( id, 0, {} );

		this._yOffset = 0;
		this._yVelocity = 0;
		this._scrollBarGraphics = new PIXI.Graphics(); // This needs to be a separate graphics thing, so it can be moved without painting
		this._display.addChild(this._scrollBarGraphics);

		this.sourceRect = sourceRect;
		this.updatePopoverDescription(description);
		this.paint();
		if (description.scrollOffset !== undefined) this.scrollOffset = this._scrollClamp(description.scrollOffset);

		this._unsubscribes = [];
		this._unsubscribes.push(
			FocusStore.on("focus", this._onFocus.bind(this))
		);
		this.on("pointer_event", this._triggerEvent.bind(this));

		// Hook into render for the displayObject, so that we can do inertial scrolling each frame
		let oldRenderWebGL = this.return_node().renderWebGL.bind(this.return_node());
		let oldRenderCanvas = this.return_node().renderCanvas.bind(this.return_node());
		this.return_node().renderWebGL = (renderer) => {
			oldRenderWebGL(renderer);
			this._updateScrollPhysics();
		};
		this.return_node().renderCanvas = (renderer) => {
			oldRenderCanvas(renderer);
			this._updateScrollPhysics();
		};
	}

	get canScrollDown() {
		return this.scrollOffset > this._scrollMin();
	}

	get canScrollUp() {
		return this.scrollOffset < this._scrollMax();
	}

	get items() {
		return this._items;
	}

	set items(nitems) {
		this._items = nitems;
		this.setRect(this.preferredRect);
		this.scrollOffset = this._scrollClamp(this.scrollOffset);
		this.paint();
	}

	get itemsHeight() {
		const entryPadding = 2;
		const entryHeight = this._fontsize + 3 * entryPadding;
		if (!this._items) return entryHeight;
		return entryHeight * this._items.length;
	}

	get scrollOffset() {
		return this._yOffset;
	}

	set scrollOffset(y) {
		if (this._yOffset !== y) {
			this._yOffset = y;
			this._positionChildrenForCurrentScrollOffset();
		}
	}

	set sourceRect(srect) {
		this._sourceRect = srect;
		if (this._items) this.scrollOffset = this._scrollClamp(this.scrollOffset);
	}

	get preferredRect() {
		let rectWidth = this.constructor.MIN_WIDTH;
		let rectHeight = this.itemsHeight;
		let rectY;
		const shouldDisplayUnderneath = this._shouldDisplayUnderneath();
		if (shouldDisplayUnderneath) {
			rectY = this._sourceRect[1] + this._sourceRect[3] + this.constructor.Y_OFFSET;
		} else {
			rectY = this._sourceRect[1] - this.constructor.Y_OFFSET - rectHeight;
		}

		// Make sure that no matter how big the umenu is, it's never going off the screen
		const scale = ActiveFrameStore.getScale();
		const dims = ActiveFrameStore.getDimensions();
		let maxHeight;
		if (shouldDisplayUnderneath) {
			maxHeight = ( dims[3] * scale ) - (this._sourceRect[1] + this._sourceRect[3]) - 2 * this.constructor.Y_OFFSET;
		} else {
			maxHeight = this._sourceRect[1] - 2 * this.constructor.Y_OFFSET;
		}

		// Move the rect down a bit, if it's also being made shorter
		if (!shouldDisplayUnderneath && maxHeight < rectHeight) rectY += (rectHeight - maxHeight);
		if (maxHeight < rectHeight) rectHeight = maxHeight;

		let rect = [
			this._sourceRect[0] + Math.floor((this._sourceRect[2] - rectWidth) / 2),
			rectY,
			rectWidth,
			rectHeight
		];
		if (rect[0] + rect[2] > dims[2]) rect[0] = dims[2] - rect[0];
		if (rect[0] < 0) rect[0] = 0;
		return rect;
	}

	_onFocus(target) {
		if (target !== this.return_node()) this._onCancel();
	}

	_positionChildrenForCurrentScrollOffset() {
		const entryPadding = 2;
		const entryHeight = this._fontsize + 3 * entryPadding;

		// Update all of the attribute rectangles
		_.forOwn(this._dataShapes, (child, key) => {
			const index = child.attributes.index;
			child.shape.y = index * entryHeight + this.scrollOffset;
		});

		// Update all of the text as well
		this._text.forEach((text, index) => {
			text.position = new PIXI.Point(text.position.x, index * entryHeight + this.scrollOffset);
		});

		// Update the scroll bar
		this._configureScrollBar();
	}

	_scrollClamp(scrollOffset) {
		return Math.min(this._scrollMax(), Math.max(scrollOffset, this._scrollMin()));
	}

	_scrollMin() {
		const itemsHeight = this.itemsHeight;
		const viewHeight = this.preferredRect[3];
		return viewHeight - itemsHeight;
	}

	_scrollMax() {
		return 0;
	}

	_shouldDisplayUnderneath() {
		let retVal = false;
		if (this._sourceRect) {
			// dims are Max patcher dimensions, so they need to be scaled up for pixel calculations
			const scale = ActiveFrameStore.getScale();
			const dims = ActiveFrameStore.getDimensions();
			let aboveSpace = this._sourceRect[1];
			let belowSpace = (dims[3] * scale) - (this._sourceRect[1] + this._sourceRect[3]);
			retVal = belowSpace > aboveSpace;
		}
		return retVal;
	}

	_triggerEvent( event ) {
		if (this[ event.type ])
			{this[ event.type ]( event );}
	}

	_updateScrollPhysics() {
		let updateTime = Date.now();
		if (this._lastUpdateTime) {
			if (!this._pointerDown) {

				// First get the acceleration due to the spring past the edge
				if (this.scrollOffset < this._scrollMin() || this.scrollOffset > this._scrollMax()) {
					const distance = this.scrollOffset - (this.scrollOffset < this._scrollMin() ? this._scrollMin() : this._scrollMax());
					const springAccel = -(distance * this.constructor.SCROLL_SPRING);
					const dampingAccel = -(this._yVelocity * this.constructor.SCROLL_DAMPING);
					this._yVelocity += (springAccel + dampingAccel);

				// Only apply friction if we're within accepted bounds
				} else {
					const oldVelocity = this._yVelocity;
					if (oldVelocity !== 0) {
						let newVelocity = oldVelocity;
						newVelocity += -Math.sign(oldVelocity) * this.constructor.SCROLL_FRICTION * (updateTime - this._lastUpdateTime);
						if (Math.sign(newVelocity) !== Math.sign(oldVelocity)) newVelocity = 0;
						this._yVelocity = newVelocity;
					}
				}

				// Finally update position
				if (Math.abs(this._yVelocity) < 0.01) this._yVelocity = 0;
				if (this._yVelocity !== 0) this.scrollOffset = this.scrollOffset + this._yVelocity;
			}
		}

		this._lastUpdateTime = updateTime;
	}

	destroy() {
		this._unsubscribes.forEach( (f) => {
			f();
		});
	}

	_configureScrollBar() {
		if (!this.canScrollUp && ! this.canScrollDown) {
			this._scrollBarGraphics.visible = false;
		} else {
			this._scrollBarGraphics.visible = true;
			this._scrollBarGraphics.clear();
			const scale = ActiveFrameStore.getScale();
			const popupWidth = this.preferredRect[2];
			const popupHeight = this.preferredRect[3];
			const scrollDistance = this._scrollMax() - this._scrollMin();
			const scrollFraction = 1 - (this._yOffset - this._scrollMin()) / scrollDistance;
			let scrollBarHeight = popupHeight * (popupHeight / (popupHeight + scrollDistance));
			let scrollBarY = (popupHeight - scrollBarHeight) * scrollFraction;
			this._scrollBarGraphics.beginFill(0xBBBBBB, 1);
			this._scrollBarGraphics.drawRoundedRect(
				popupWidth - 4 * scale,
				scrollBarY,
				2 * scale,
				scrollBarHeight,
				1 * scale
			);
		}
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
		this._fontface = this.constructor.FONT_WEIGHT;
		this._fontsize = this.constructor.FONT_SIZE;
		this._fontname = description.fontname;
		this._onCancel = description.onCancel;
		this._onSelect = description.onSelect;
		this._textjustification = description.textjustification;
		this.items = description.items;
	}

	pointerDown( event ) {
		this._pointerDown = true;
		this._pointerCanSelect = Math.abs(this._yVelocity) < 1;
		this._yVelocity = 0;
		this._touchDownX = event.screenFrameX;
		this._touchDownY = event.screenFrameY;
	}

	pointerMove( event ) {
		if (this._pointerDown) {
			this._pointerCanSelect = false;
			let yOffset = this.scrollOffset;
			yOffset += event.screenDeltaY;
			this._yVelocity = event.screenDeltaY * 0.9;

			if (yOffset < this._scrollMin() || yOffset > this._scrollMax()) {
				const height = this.preferredRect[3];
				const maxOvershoot = height / 2;
				const touchRel = Math.abs(this._touchDownY - event.screenFrameY);
				const dist = Math.min(1, 1 - 1 / (1 + touchRel / height));
				if (yOffset < this._scrollMin()) {
					yOffset = this._scrollMin() - dist * maxOvershoot;
				} else {
					yOffset = this._scrollMax() + dist * maxOvershoot;
				}
			}
			this.scrollOffset = yOffset;
		}
	}

	pointerUp( event ) {
		if (this._pointerDown) {
			this._pointerDown = false;

			if (this._pointerCanSelect) {
				if (event.attributes.index !== undefined) {
					this._onSelect(event.attributes.index);
				} else {
					this._onCancel();
				}
			}
		}
	}

	paint() {
		this.clear();

		const items = this._items;
		if (!items) return;

		this._text = [];
		const scale = ActiveFrameStore.getScale();
		const fontSize = this._fontsize / scale;
		const textInset = this.constructor.TEXT_INSET / scale;
		const entryPadding = this.constructor.ENTRY_PADDING / scale;
		const entryHeight = fontSize + 3 * entryPadding;
		const popupWidth = this.preferredRect[2] / scale;
		const popupHeight = this.preferredRect[3] / scale;

		this.set_source_rgba([0.38, 0.38, 0.4, 1.0]);
		this.rectangle(0, 0, popupWidth, popupHeight, this.constructor.BORDER_RADIUS / scale);
		this.set_line_width(2);
		this.fill();

		this.set_font_name(this._fontname);
		this.set_font_weight(this._fontface);
		this.set_font_size(fontSize);
		this.set_font_justification(this._textjustification);
		this.set_source_rgba([1, 1, 1]);

		for (let i = 0, il = items.length; i < il; i++) {
			let nextText = this.textLine(
				textInset,
				entryHeight * i + entryPadding,
				popupWidth - textInset * 2,
				entryHeight,
				items[i]
			);
			this._text.push(nextText);

			// we draw a rect, at least sort of in order to attach index attr appropriately
			this.rectangle(
				entryPadding,
				entryHeight * i,
				popupWidth,
				entryHeight
			);

			this.add_attribute("index", i);
		}

		this._positionChildrenForCurrentScrollOffset();
	}
}

MenuList.FONT_JUSTIFICATION = "left";
MenuList.FONT_NAME = "Arial";
MenuList.FONT_PADDING = 2;
MenuList.FONT_SIZE = 18;
MenuList.FONT_WEIGHT = "regular";

MenuList.BACKGROUND_COLOR = [0.29, 0.309, 0.301];
MenuList.BORDER_RADIUS = 3;
MenuList.ENTRY_PADDING = 6;
MenuList.HEIGHT = 10;
MenuList.TEXT_INSET = 15;
MenuList.MIN_WIDTH = 180 + 2 * MenuList.TEXT_INSET;
MenuList.Y_OFFSET = 3;

MenuList.SCROLL_FRICTION = 0.033;
MenuList.SCROLL_SPRING = 0.04;
MenuList.SCROLL_DAMPING = 2 * Math.sqrt(MenuList.SCROLL_SPRING);
