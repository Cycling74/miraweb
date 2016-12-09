import * as UIObjectActions from "../actions/uiObject.js";
import ActiveFrameStore from "./activeFrame.js";
import Store from "./base.js";
import toArray from "lodash/toArray.js";
import { getInstance as getUIObjectInstance } from "../objects/factory.js";

class UIObjectStore extends Store {

	constructor() {
		super();

		this._objects = {};

		// Attach Action Listeners
		this.listenTo(UIObjectActions.addObject, this._onAddObject.bind(this));
		this.listenTo(UIObjectActions.removeObject, this._onRemoveObject.bind(this));
		this.listenTo(UIObjectActions.clear, this._onClear.bind(this));
		this.listenTo(UIObjectActions.setObjects, this._onSetObjects.bind(this));

		ActiveFrameStore.on("viewmode_change", this._onViewModeChange.bind(this));
		ActiveFrameStore.on("resize", this._onFrameResize.bind(this));
	}

	_onAddObject(stateObj) {
		const uiObject = getUIObjectInstance(stateObj);
		if (!uiObject) return;

		this._objects[stateObj.id] = uiObject;
		uiObject.reposition();
		uiObject.render();

		this.triggerEvent("object_added", uiObject);
	}

	_onClear() {
		const ids = Object.keys(this._objects);

		for (let i = 0, il = ids.length; i < il; i++) {
			const id = ids[i];
			this._objects[id].destroy();
			delete this._objects[id];
		}

		this.triggerEvent("clear");
	}

	_onFrameResize() {
		const frameRect = ActiveFrameStore.getDimensions();
		this.getObjects().forEach(function(obj) {
			obj.reposition(frameRect);
		});
	}

	_onRemoveObject(stateObj) {
		const uiObject = this.getObject(stateObj.id);

		if (uiObject) {
			uiObject.destroy();
			delete this._objects[stateObj.id];
		}

		this.triggerEvent("object_removed", stateObj.id);
	}

	_onSetObjects(stateObjs) {

		stateObjs.forEach(function(obj) {

			const uiObject = getUIObjectInstance(obj);
			this._objects[obj.id] = uiObject;

			uiObject.reposition();
			uiObject.render();

			this.triggerEvent("object_added", uiObject);

		}.bind(this));
	}

	_onViewModeChange() {
		this.getObjects().forEach(function(obj) {
			obj.reposition();
			obj.render();
		});
	}

	getObject(id) {
		return this._objects[id];
	}

	getObjects() {
		return toArray(this._objects);
	}
}

export default new UIObjectStore();
