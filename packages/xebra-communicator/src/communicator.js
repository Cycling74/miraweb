import defaults from "lodash.defaults";
import { EventEmitter } from "events";
import { format as formatUrl } from "url";
import { CONNECTION_STATES } from "./constants.js";

class Communication extends EventEmitter {

	constructor(options) {
		super();
		this._options = defaults(options, {
			secure: false,
			reconnect: true,
			reconnect_attempts: 5,
			reconnect_timeout: 1000,
			auto_connect: true
		});

		this._ws = null;
		this._forcedDisconnect = false;
		this._currentReconnects = 0;
		this._connectedInitially = false;
		this._connectionState = CONNECTION_STATES.INIT;

		if (this._options.auto_connect) this.connect();
	}

	/**
	 * @readonly
	 * @see XebraCommunicator.CONNECTION_STATES
	 */
	get connectionState() {
		return this._connectionState;
	}

	/**
	 * @readonly
	 */
	get host() {
		return this._options.hostname;
	}

	/**
	 * @readonly
	 */
	get port() {
		return this._options.port;
	}

	/**
	 * @readonly
	 */
	get url() {
		return formatUrl({
			hostname: this._options.hostname,
			port: this._options.port,
			protocol: this._options.secure ? "wss" : "ws",
			slashes: true
		});
	}

	/**
	 * Connect to XebraServer
	 * @private
	 */
	_connect() {

		this._ws = new WebSocket(this.url);
		this._ws.onclose = this._onClose.bind(this);
		this._ws.onmessage = this._onMessage.bind(this);
		this._ws.onopen = this._onOpen.bind(this);
	}

	/**
	 * Handle onClose event
	 * @private
	 */
	_onClose() {
		this._ws = null;

		// connection never worked
		if (!this._connectedInitially) {
			this._connectionState = CONNECTION_STATES.CONNECTION_FAIL;
			this.emit("connection_change", this.connectionState);
			return;
		}

		// user forced disconnect
		if (this._forcedDisconnect) {
			this._connectionState = CONNECTION_STATES.DISCONNECTED;
			this.emit("connection_change", this.connectionState);
			return;
		}

		if (this._connectedInitially && this._options.reconnect) {
			this._connectionState = CONNECTION_STATES.RECONNECTING;
			this.emit("connection_change", this.connectionState);

			if (this._currentReconnects++ < this._options.reconnect_attempts) {
				setTimeout(this._reconnect.bind(this), this._options.reconnect_timeout);
			} else {
				this._connectionState = CONNECTION_STATES.DISCONNECTED;
				this.emit("connection_change", this.connectionState);
			}
		}
	}

	/**
	 * Handle incoming Message
	 * @private
	 */
	_onMessage(msg) {
		this.emit("message", JSON.parse(msg.data));
	}

	/**
	 * Handle connection open event
	 * @private
	 */
	_onOpen() {
		this._connectedInitially = true;
		this._currentReconnects = 0;

		this._connectionState = CONNECTION_STATES.CONNECTED;
		this.emit("connection_change", this.connectionState);
	}

	/**
	 * Reconnect
	 * @private
	 */
	_reconnect() {
		this._connect();
	}

	/**
	 * Close the WebSocket connection
	 */
	close() {
		if (this._ws) {
			this._forcedDisconnect = true;
			this._ws.close();
			this._ws = null;
		}
	}

	/**
	 * Init the WebSocket connection
	 */
	connect() {
		if (!this._ws) {
			this._connectionState = CONNECTION_STATES.CONNECTING;
			this.emit("connection_change", this.connectionState);
			this._connect();
		}
	}

	/**
	 * Send data to XebraServer
	 * @param {object} data - XebraMessage data
	 */
	send(data) {
		this._ws.send(JSON.stringify(data));
	}
}

export default Communication;
