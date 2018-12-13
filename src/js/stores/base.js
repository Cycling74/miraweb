import { EventEmitter } from "events";

const ALL_CHANGES = "_change_";

export default class Store {

	constructor() {
		this._emitter = new EventEmitter();
		this._emitter.setMaxListeners(Infinity);
	}

	listen(cb) {
		if (!(cb instanceof Function)) throw new Error("Invalid parameters for listen");
		return this.on(ALL_CHANGES, cb);
	}

	listenTo(action, cb) {
		action.listen(cb);
	}

	on(event, cb) {
		this._emitter.on(event, cb);

		return function () {
			this._emitter.removeListener(event, cb);
		}.bind(this);
	}

	trigger() {
		this._emitter.emit(ALL_CHANGES);
	}

	triggerEvent() {
		this._emitter.emit.apply(this._emitter, arguments);
		this.trigger();
	}
}
