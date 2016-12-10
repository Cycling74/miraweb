import React from "react";

import { CONNECTION_STATES } from "xebra.js";

import * as SettingsActions from "../actions/settings.js";
import * as XebraStateActions from "../actions/xebraState.js";
import SettingsStore from "../stores/settings.js";
import XebraStateStore from "../stores/xebraState.js";

import { showFullScreenToggle } from "../lib/utils.js";

import Button from "./button.jsx";
import Column from "./column.jsx";
import Dialog from "./dialog.jsx";
import FormField from "./formField.jsx";
import FullscreenToggleButton from "./fullscreenToggleButton.jsx";
import Grid from "./grid.jsx";
import InfoText from "./infoText.jsx";

const BASE_CLASS = "mw-connect-dialog";

export default class MiraConnectDialog extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			connectionState : XebraStateStore.getConnectionState(),
			fullscreen : SettingsStore.getSettingState("fullscreen"),
			hostname : props.hostname || "",
			port : props.port || "",
			attemptToConnectTo : null
		};

		this._unsubscribes = [];
		this._unsubscribes.push(XebraStateStore.listen(this._onUpdate.bind(this)));
		this._unsubscribes.push(SettingsStore.on("change_setting", this._onUpdate.bind(this)));
	}

	componentWillUnmount() {
		this._unsubscribes.forEach((f) => {
			f();
		});
	}

	_connectionShowsDialog( status ) {
		const showStates = ( CONNECTION_STATES.INIT | CONNECTION_STATES.CONNECTING | CONNECTION_STATES.CONNECTION_FAIL | CONNECTION_STATES.DISCONNECTED );
		return (status & showStates) > 0;
	}

	_onUpdate() {
		this.setState({
			fullscreen : SettingsStore.getSettingState("fullscreen"),
			connectionState : XebraStateStore.getConnectionState()
		});
	}

	_onChangeValue(e) {
		this.setState({
			[e.target.name] : e.target.value,
			attemptToConnectTo : null
		});
	}

	_onClose() {
		// we don't close without the user hitting connect
		return;
	}

	_onConnect() {
		XebraStateActions.init({
			hostname : this.state.hostname,
			port : this.state.port
		});

		this.setState({ attemptToConnectTo : `ws://${this.state.hostname}:${this.state.port}` });
		XebraStateActions.connect();
	}

	_onToggleFullscreen(flag) {
		SettingsActions.changeSetting("fullscreen", flag);
	}

	render() {
		return (
			<Dialog show={ this._connectionShowsDialog(this.state.connectionState) } closable={ false } title="Mira Web" >
				<Grid className={ BASE_CLASS } >
					<Column size={ 12 } tagName="p" >
						Enter the details of the Max host to connect to.
					</Column>
					<Column size={ 12 } >
						<FormField htmlFor="hostname" label="Hostname" >
							<input
								name="hostname"
								onChange={ this._onChangeValue.bind(this) }
								placeholder="Hostname"
								type="text"
								value={ this.state.hostname }
							/>
						</FormField>
					</Column>
					<Column size={ 12 } >
						<FormField htmlFor="port" label="Port" >
							<input
								name="port"
								onChange={ this._onChangeValue.bind(this) }
								placeholder="Port"
								type="text"
								value={ this.state.port }
							/>
						</FormField>
					</Column>
					{
						( showFullScreenToggle() ? <Column size={ 12 } >
							<FormField label="Fullscreen">
								<FullscreenToggleButton
									onToggle={ this._onToggleFullscreen.bind(this) }
									fullscreenState={ this.state.fullscreen }
								/>
							</FormField>
						</Column> : null )
					}
					<Column size={ 12 } className="text-right">
						<Button onClick={ this._onConnect.bind(this) } disabled={ this.state.connectionState === CONNECTION_STATES.CONNECTING } >Connect</Button>
					</Column>
					<Column size={ 12 } >
						{ this.state.connectionState === CONNECTION_STATES.CONNECTION_FAIL && this.state.attemptToConnectTo ? (
							<InfoText type="error" >
								Error: Could not connect to { this.state.attemptToConnectTo }
							</InfoText>) : null
						}
					</Column>
				</Grid>
			</Dialog>
		);
	}
}
