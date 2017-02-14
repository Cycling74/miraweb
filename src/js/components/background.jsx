import React from "react";

import { CONNECTION_STATES } from "xebra.js";
import XebraStateStore from "../stores/xebraState.js";
import FrameStore from "../stores/frame.js";

import Spinner from "./spinner.jsx";

const BASE_CLASS = "mw-background";
const STATUS_COLOR = "#999";

export default class Background extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			message : null
		};

		this._unsubscribes = [];
		this._unsubscribes.push(XebraStateStore.on("connection_change", this._onUpdate.bind(this)));
		this._unsubscribes.push(XebraStateStore.on("loaded", this._onUpdate.bind(this)));
		this._unsubscribes.push(XebraStateStore.on("reset", this._onUpdate.bind(this)));
		this._unsubscribes.push(FrameStore.on("frame_added", this._onUpdate.bind(this)));
		this._unsubscribes.push(FrameStore.on("frame_removed", this._onUpdate.bind(this)));
		this._unsubscribes.push(FrameStore.on("reset", this._onUpdate.bind(this)));
	}

	componentWillUnmount() {
		this._unsubscribes.forEach((f) => {
			f();
		});
	}

	_messageForAppStatus() {
		let message = null;

		// If connected, but the state hasn't loaded yet
		if (XebraStateStore.getConnectionState() === CONNECTION_STATES.CONNECTED && !XebraStateStore.getIsStateLoaded()) {
			message = this.constructor.STATUS_MESSAGES.STILL_LOADING;
		}
		// If connected, state is loaded and no frames present
		else if (
			XebraStateStore.getConnectionState() === CONNECTION_STATES.CONNECTED &&
			XebraStateStore.getIsStateLoaded() &&
			FrameStore.getFrameCount() === 0
		) {
			message = this.constructor.STATUS_MESSAGES.NO_FRAMES;
		}
		// If reconnecting
		else if (XebraStateStore.getConnectionState() === CONNECTION_STATES.RECONNECTING) {
			message = this.constructor.STATUS_MESSAGES.RECONNECTING;
		}

		return message;
	}

	_onUpdate() {
		this.setState({ message : this._messageForAppStatus() });
	}

	render() {
		const { message } = this.state;
		const { bgColor } = this.props;

		const style = {};
		if (bgColor) style.backgroundColor = bgColor;

		return (
			<div className={ `${BASE_CLASS}-container` } style={ style } >
				<div className={ BASE_CLASS }>
					{ message ? <h2 className={ `${BASE_CLASS}-status` }>{ message }</h2> : null }
				</div>
			</div>
		);
	}

}

Background.STATUS_MESSAGES = Object.freeze({
	NO_FRAMES : "No mira.frame objects in Max",
	RECONNECTING : <div>Connection lost. Reconnecting<Spinner color={ STATUS_COLOR } /></div>,
	STILL_LOADING : <div>Loading state<Spinner color={ STATUS_COLOR } /></div>
});
