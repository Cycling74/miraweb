import { EventEmitter } from "events";
import assign from "lodash/assign.js";

const TRIGGER = "_trigger_";

export default function(name) {

	const context = {
		name : name,
		_emitter : new EventEmitter(),
		listen : function(cb) {
			this._emitter.on(TRIGGER, cb);
		}
	};

	const functor = function() {
		this._emitter.emit.apply(this._emitter, [TRIGGER].concat(Array.prototype.slice.call(arguments)));
	}.bind(context);

	assign(functor, context);
	return functor;
}
