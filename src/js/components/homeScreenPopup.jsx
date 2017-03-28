import React from "react";
import classnames from "classnames";

import { FULLSCREEN_STATES } from "../lib/constants.js";
import { isiOSDevice, whichiOSDevice } from "../lib/utils.js";
import * as SettingsActions from "../actions/settings.js";
import SettingsStore from "../stores/settings.js";

import CloseButton from "./closeButton.jsx";

const BASE_CLASS = "mw-homescreen-popup";

export default class HomeScreenPopup extends React.Component {

	constructor(props) {
		super(props);

		this.state = this._buildState();

		this._unsubscribes = [];
		this._unsubscribes.push(SettingsStore.on("change_setting", this._onUpdate.bind(this)));
	}

	componentWillUnmount() {
		this._unsubscribes.forEach((f) => {
			f();
		});
	}

	_onUpdate() {
		this.setState(this._buildState());
	}

	_onClose() {
		SettingsActions.changeSetting("fullscreen", FULLSCREEN_STATES.OFF);
		window.removeEventListener("touchstart");
	}

	_buildState() {
		return {
			show : SettingsStore.getSettingState("fullscreen") === FULLSCREEN_STATES.POPUP
		};
	}

	render() {
		if (!this.state.show) return null;

		const classes = [
			BASE_CLASS,
			{
				[`${BASE_CLASS}--${whichiOSDevice()}`] : isiOSDevice()
			}
		];

		return (
			<div className={ classnames(classes) } onClick={ this._onClose.bind(this) } >
				<div className={ `${BASE_CLASS}-wrapper`} >
					<div className={ `${BASE_CLASS}-content` } >
						<CloseButton onClick={ this._onClose.bind(this) } />
						iOS can only go fullscreen as a mobile app. To add this web app to the home screen: tap <strong>Share</strong> and then <strong>Add to Home Screen</strong>.
					</div>
				</div>
			</div>
		);
	}
}
