import Store from "./base.js";
import * as FocusActions from "../actions/focus.js";

class FocusStore extends Store {
	constructor() {
		super();

		// Attach Action Listeners
		this.listenTo(FocusActions.focus, this._onFocus.bind(this));
	}

	get currentFocus() {
		return this._currentFocus;
	}

	_onFocus(pixiContainer) {
		this._currentFocus = pixiContainer;
		this.triggerEvent("focus", this._currentFocus);
	}
}

export default new FocusStore();
