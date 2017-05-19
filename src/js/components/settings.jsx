import React from "react";
import { CONNECTION_STATES, VIEW_MODES, VERSION as XEBRA_VERSION } from "xebra.js";
import * as SettingsActions from "../actions/settings.js";
import * as XebraStateActions from "../actions/xebraState.js";
import SettingsStore from "../stores/settings.js";
import XebraStateStore from "../stores/xebraState.js";
import { TAB_COLOR_MODES, SETTING_SCREENS, VERSION } from "../lib/constants.js";

import { showFullScreenToggle } from "../lib/utils.js";

import Button from "./button.jsx";
import ColorChanger from "./colorChanger.jsx";
import Column from "./column.jsx";
import Dialog from "./dialog.jsx";
import FormField from "./formField.jsx";
import FullscreenToggleButton from "./fullscreenToggleButton.jsx";
import Grid from "./grid.jsx";
import InfoText from "./infoText.jsx";
import Input from "./input.jsx";
import Select from "./select.jsx";

const BASE_CLASS = "mw-settings";

export default class Settings extends React.Component {

	constructor(props) {
		super(props);

		this.state = this._buildState();
		this._unsubscribes = [];
		this._unsubscribes.push(SettingsStore.listen(this._onUpdate.bind(this)));
		this._unsubscribes.push(XebraStateStore.listen(this._onUpdate.bind(this)));
	}

	componentWillUnmount() {
		this._unsubscribes.forEach((f) => {
			f();
		});
	}

	_buildState() {
		return {
			clientNameEdits : this.state && this.state.clientNameEdits ? this.state.clientNameEdits : null,
			clientName : XebraStateStore.getName(),
			connectionStatus : XebraStateStore.getConnectionState(),
			connectionInfo : XebraStateStore.getConnectionInfo(),
			selectedTab : SettingsStore.getSelectedTab(),
			settings : SettingsStore.getSettings(),
			show : SettingsStore.areShown() && SettingsStore.getShownScreen() === SETTING_SCREENS.CONFIG,
			tab : SettingsStore.getSelectedTab()
		};
	}

	_onUpdate() {
		this.setState(this._buildState());
	}

	_onClientNameChange(e) {
		this.setState({ clientNameEdits : e.target.value });
	}

	_onClientNameChangeSubmit(e) {
		const name = e.target.value;
		if (name && name.length) {
			XebraStateActions.changeClientName(e.target.value);
			SettingsActions.changeSetting("name", e.target.value);
		}

		this.setState({ clientNameEdits : null });
	}

	_onDisconnect() {
		XebraStateActions.disconnect();
	}

	_onToggleView(e) {
		SettingsActions.toggleView();
	}

	_onChangeViewMode(e) {
		SettingsActions.changeSetting("viewMode", parseInt(e.target.value, 10));
	}

	_onChangeTabColor(color) {
		SettingsActions.changeSetting("tabColor", color);
	}

	_onChangeTabColorMode(e) {
		SettingsActions.changeSetting("tabColorMode", parseInt(e.target.value, 10));
	}

	_onToggleFullscreen(flag) {
		SettingsActions.changeSetting("fullscreen", flag);
	}

	_onShowAboutScreen() {
		SettingsActions.toggleView(SETTING_SCREENS.ABOUT);
	}

	render() {

		let viewModeHint;
		switch (this.state.settings.viewMode) {
			case VIEW_MODES.LINKED:
				viewModeHint = "Linked: Mirrors Max's current view";
				break;
			case VIEW_MODES.PRESENTATION:
				viewModeHint = "Presentation: Mirrors Max's presentation view";
				break;
			case VIEW_MODES.PATCHING:
				viewModeHint = "Patching: Mirrors Max's patching view";
				break;
		}

		let tabColorHint;
		switch (this.state.settings.tabColorMode) {
			case TAB_COLOR_MODES.DARKEN:
				tabColorHint = "Darken: Set the tab background relative to the frame background, just slightly darker.";
				break;
			case TAB_COLOR_MODES.LIGHTEN:
				tabColorHint = "Lighten: Set the tab background relative to the frame background, just slightly brighter.";
				break;
			case TAB_COLOR_MODES.COLOR:
				tabColorHint = "Fixed Color: Sets the tab background to a defined color. Change below.";
				break;
		}

		let connectionHint;
		switch (this.state.connectionStatus) {
			case CONNECTION_STATES.INIT:
				connectionHint = "Initializing";
				break;
			case CONNECTION_STATES.CONNECTING:
				connectionHint = "Connecting...";
				break;
			case CONNECTION_STATES.RECONNECTING:
				connectionHint = "Reconnecting";
				break;
			case CONNECTION_STATES.DISCONNECTED:
				connectionHint = "Disconnected";
				break;
		}

		return (
			<Dialog show={ this.state.show } onClose={ this._onToggleView.bind(this) } title="Configuration" >
				<div className={ BASE_CLASS } >
					<Grid>
						<Column size={ 12 } >
							<FormField htmlFor="max_server" label="Max Server" >
								<Input readOnly value={ this.state.connectionInfo } />
								{ connectionHint ? <InfoText>{ connectionHint }</InfoText> : null }
								{ this.state.connectionStatus === CONNECTION_STATES.CONNECTED ? (
										<Button buttonStyle="error" onClick={ this._onDisconnect.bind(this) } size="sm" >Disconnect</Button>
									) : null
								}

							</FormField>
						</Column>
						<Column size={ 12 } >
							<FormField htmlFor="name" label="Client ID" >
								<Input value={ this.state.clientNameEdits !== null ? this.state.clientNameEdits : this.state.clientName }
									onChange={ this._onClientNameChange.bind(this) }
									onBlur={ this._onClientNameChangeSubmit.bind(this) }
								/>
							</FormField>
						</Column>
						<Column size={ 12 } >
							<FormField htmlFor="version" label="App Version" >
								<Input readOnly value={ VERSION } />
							</FormField>
						</Column>
						<Column size={ 12 } >
							<FormField htmlFor="protocol_version" label="Xebra Protocol Version" >
								<Input readOnly value={ XEBRA_VERSION } />
							</FormField>
						</Column>
						<Column size={ 12 } >
							<FormField htmlFor="view_mode" label="View Mode" >
								<Select value={ this.state.settings.viewMode } onChange={ this._onChangeViewMode.bind(this) } >
									<option value={ VIEW_MODES.LINKED }>Linked</option>
									<option value={ VIEW_MODES.PATCHING }>Patching</option>
									<option value={ VIEW_MODES.PRESENTATION }>Presentation</option>
								</Select>
								<div className="text-center" >
									<small className="text-center" >{ viewModeHint }</small>
								</div>
							</FormField>
						</Column>
						<Column size={ 12 } >
							<FormField htmlFor="tab_color_mode" label="Tab Background" >
								<Select value={ this.state.settings.tabColorMode } onChange={ this._onChangeTabColorMode.bind(this) } >
									<option value={ TAB_COLOR_MODES.DARKEN }>Darker than frame</option>
									<option value={ TAB_COLOR_MODES.LIGHTEN }>Brighter than frame</option>
									<option value={ TAB_COLOR_MODES.COLOR }>Fixed Color</option>
								</Select>
								<div className="text-center" >
									<small className="text-center" >{ tabColorHint }</small>
								</div>
								{ this.state.settings.tabColorMode !== TAB_COLOR_MODES.COLOR ? null : (
										<div className="mw-tab-color-settings">
											<Grid vertAlign="middle">
												<Column size={ 4 } className="mw-tab-color-settings-label">
													Tab Color:
												</Column>
												<Column size={ 8 } className="mw-tab-color-settings-color">
													<ColorChanger
														color={ this.state.settings.tabColor }
														onChangeColor={ this._onChangeTabColor.bind(this) }
														vertPlacement="above"
													/>
												</Column>
											</Grid>
										</div>
									)
								}
							</FormField>
						</Column>
						{ showFullScreenToggle() ? (
							<Column size={ 12 } >
								<FormField label="Fullscreen">
									<FullscreenToggleButton
										onToggle={ this._onToggleFullscreen.bind(this) }
										fullscreenState={ this.state.settings.fullscreen }
									/>
								</FormField>
							</Column> ) : null
						}
						<Column size={ 12 } className="text-center">
							<a className="mw-about-link" onClick={ this._onShowAboutScreen.bind(this) } size="sm">About MiraWeb</a>
						</Column>
					</Grid>
				</div>
			</Dialog>
		);
	}
}
