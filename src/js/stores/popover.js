import Store from "./base.js";
import * as PopoverActions from "../actions/popover.js";
import ColorLabel from "../lib/colorLabel.js";
import MenuList from "../lib/menuList.js";
import ValueLabel from "../lib/valueLabel.js";

export const POPOVER_TYPES = Object.freeze({
	VALUE_LABEL : "VALUE_LABEL",
	MENU_LIST : "MENU_LIST",
	COLOR_LABEL : "COLOR_LABEL"
});

class PopoverStore extends Store {

	constructor() {
		super();
		this._visiblePopovers = {};
		this.listenTo(PopoverActions.showPopover, this._onShowPopover.bind(this));
		this.listenTo(PopoverActions.movePopover, this._onMovePopover.bind(this));
		this.listenTo(PopoverActions.updatePopover, this._onUpdatePopover.bind(this));
		this.listenTo(PopoverActions.hidePopover, this._onHidePopover.bind(this));
	}

	_onShowPopover(pid, type, description, src_rect) {
		switch (type) {
			case POPOVER_TYPES.VALUE_LABEL: {
				let valueLabel = new ValueLabel( pid, description, src_rect );
				this._visiblePopovers[ pid ] = valueLabel;
				valueLabel.setRect( valueLabel.preferredRect );
				break;
			}
			case POPOVER_TYPES.MENU_LIST: {
				let menuList = new MenuList( pid, description, src_rect);
				this._visiblePopovers[ pid ] = menuList;
				menuList.setRect( menuList.preferredRect );
				break;
			}
			case POPOVER_TYPES.COLOR_LABEL: {
				let colorLabel = new ColorLabel( pid, description, src_rect);
				this._visiblePopovers[ pid ] = colorLabel;
				colorLabel.setRect(colorLabel.preferredRect);
				break;
			}
			default:
				console.warn("PopoverStore: Unrecognized popup class:", type);
		}

		if (this._visiblePopovers[ pid ]) {
			this.triggerEvent("showPopover", this._visiblePopovers[ pid ]);
		}
	}

	_onMovePopover(pid, src_rect) {
		if (this._visiblePopovers[ pid ]) {
			this._visiblePopovers[ pid ].movePopover(src_rect);
		}
		this.triggerEvent("movePopover", this._visiblePopovers[ pid ], src_rect);
	}

	_onUpdatePopover(pid, description) {
		if (this._visiblePopovers[ pid ]) {
			this._visiblePopovers[ pid ].updatePopoverDescription(description);
		}
		this.triggerEvent("updatePopover", this._visiblePopovers[ pid ], description);
	}

	_onHidePopover(pid) {
		if (this.isPopoverVisibleForId(pid)) {
			this.triggerEvent("hidePopover", this._visiblePopovers[ pid ]);
			this._visiblePopovers[ pid ].destroy();
			delete this._visiblePopovers[pid];
		}
	}

	isPopoverVisibleForId(pid) {
		return (this._visiblePopovers[pid] !== undefined);
	}

	popoverForId(pid) {
		return this._visiblePopovers[pid];
	}
}

export default new PopoverStore();
