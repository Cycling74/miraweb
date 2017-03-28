import React from "react";
import classnames from "classnames";

import { FULLSCREEN_STATES } from "../lib/constants.js";

import Button from "./button.jsx";

const BASE_CLASS = "mw-fullscreen-button";

export default class FullscreenToggleButton extends React.Component {

	_onToggleFullscreen() {
		this.props.onToggle(this.props.fullscreenState === FULLSCREEN_STATES.ON ? FULLSCREEN_STATES.OFF : FULLSCREEN_STATES.ON);
	}

	render() {

		const classes = classnames([
			BASE_CLASS
		]);

		return (
			<Button
				className={ classes }
				buttonStyle="secondary"
				onClick={ this._onToggleFullscreen.bind(this) }
				size="sm"
			>
				{ this.props.fullscreenState === FULLSCREEN_STATES.ON ? "Exit" : "Go" } Fullscreen
			</Button>
		);
	}
}

FullscreenToggleButton.propTypes = {
	fullscreenState : React.PropTypes.number.isRequired,
	onToggle : React.PropTypes.func.isRequired
};
