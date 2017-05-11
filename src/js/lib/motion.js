import GyroNorm from "gyronorm";
import { EventEmitter } from "events";

class Motion extends EventEmitter {
	constructor() {
		super();
		this._gn = new GyroNorm();
		this._epoch = Date.now() / 1000.0;
		this._boundMakeCompassData = this._makeCompassData.bind(this);
	}

	_makeCompassData(event) {
		// TODO: Do something with this heading event
		// console.log(event);
	}

	_makeMotionData(data) {
		let timestamp = (Date.now() / 1000.0 - this._epoch); // Mostly to remove some bits for double/float conversion
		let modata = {
			rotationrate : [data.dm.alpha, data.dm.beta, data.dm.gamma, timestamp],
			gravity : [data.dm.gx - data.dm.x, data.dm.gy - data.dm.y, data.dm.gz - data.dm.z, timestamp],
			accel : [data.dm.x, data.dm.y, data.dm.z, timestamp],
			orientation : [data.do.alpha, data.do.beta, data.do.gamma, timestamp],
			rawaccel : [data.dm.gx, data.dm.gy, data.dm.gz, timestamp]
		};
		this.emit("motion", modata);
	}

	on(event, fn) {
		super.on(event, fn);
		if (this.listenerCount("motion") === 1) {
			this._gn.init().then(() => {
				this._gn.start(this._makeMotionData.bind(this));
				window.addEventListener("deviceorientation", this._boundMakeCompassData, false);
			});
		}
	}

	removeListener(event, fn) {
		super.removeListener(event, fn);
		if (this.listenerCount("motion") === 0 && this._gn.isRunning()) {
			this._gn.end();
			window.removeEventListener("deviceorientation", this._boundMakeCompassData, false);
		}
	}

	removeAllListeners() {
		super.removeAllListeners();
		if (this._gn.isRunning()) {
			this._gn.end();
		}
	}
}

module.exports = new Motion();
