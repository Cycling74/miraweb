import React from "react";
import classNames from "classnames";

import { CONNECTION_STATES } from "xebra.js";
import XebraStateStore from "../stores/xebraState.js";

const BASE_CLASS = "mw-background";

export default class Background extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			message : "",
			show : true
		};

		this._unsubscribes = [];
		this._unsubscribes.push(XebraStateStore.on("connection_change", this._onUpdate.bind(this)));
		this._unsubscribes.push(XebraStateStore.on("loaded", this._onUpdate.bind(this)));
		this._unsubscribes.push(XebraStateStore.on("reset", this._onUpdate.bind(this)));
	}

	componentWillUnmount() {
		this._unsubscribes.forEach((f) => {
			f();
		});
	}

	_messageForAppStatus() {
		let message = "";

		// If connected, but the state hasn't loaded yet
		if (XebraStateStore.getConnectionState() === CONNECTION_STATES.CONNECTED && !XebraStateStore.getIsStateLoaded()) {
			message = this.constructor.STATUS_MESSAGES.STILL_LOADING;
		}
		// If connected, and state is loaded
		else if (XebraStateStore.getConnectionState() === CONNECTION_STATES.CONNECTED && XebraStateStore.getIsStateLoaded()) {
			message = this.constructor.STATUS_MESSAGES.NO_FRAMES;
		}
		// If reconnecting
		else if (XebraStateStore.getConnectionState() === CONNECTION_STATES.RECONNECTING) {
			message = this.constructor.STATUS_MESSAGES.RECONNECTING;
		}

		return message;
	}

	_onUpdate() {
		this.setState({
			message : this._messageForAppStatus()
		});
	}

	render() {
		var classes = classNames( `${BASE_CLASS}-container`, {
			[`${BASE_CLASS}--hidden`]: !this.state.show
		} );

		return (
			<div className={ classes }>
				<div className={ BASE_CLASS }>
					<h2 className={ `${BASE_CLASS}-status` }>{ this.state.message }</h2>
				</div>
			</div>
		);
	}

}

Background.STATUS_MESSAGES = Object.freeze({
	NO_FRAMES : "No mira.frame objects in Max",
	RECONNECTING : "Connection lost. Reconnecting...",
	STILL_LOADING : "Loading state..."
});
