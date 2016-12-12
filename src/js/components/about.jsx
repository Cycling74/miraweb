// assets
const C74_LOGO = require(`${__ASSETDIR__}/c74_logo.png`);
const GH_LOGO = require(`${__ASSETDIR__}/github_logo.png`);
const MW_LOGO = require(`${__ASSETDIR__}/miraweb_logo.png`);

import React from "react";
import * as SettingsActions from "../actions/settings.js";
import SettingsStore from "../stores/settings.js";
import { LICENSE, SETTING_SCREENS } from "../lib/constants.js";

import Column from "./column.jsx";
import Dialog from "./dialog.jsx";
import Grid from "./grid.jsx";

const BASE_CLASS = "mw-about";

export default class AboutScreen extends React.Component {

	constructor(props) {
		super(props);

		this.state = this._buildState();
		this._unsubscribes = [];
		this._unsubscribes.push(SettingsStore.listen(this._onUpdate.bind(this)));
	}

	_onUpdate() {
		this.setState(this._buildState());
	}

	componentWillUnmount() {
		this._unsubscribes.forEach((f) => {
			f();
		});
	}

	_buildState() {
		return {
			show : SettingsStore.areShown() && SettingsStore.getShownScreen() === SETTING_SCREENS.ABOUT
		};
	}

	_onToggleView() {
		SettingsActions.toggleView(false);
	}

	render() {
		return (
			<Dialog show={ this.state.show } onClose={ this._onToggleView.bind(this) } title="About" className={ BASE_CLASS } >
				<Grid >
					<Column size={ 12 } className="text-center">
						<img src={ MW_LOGO } className="mw-logo" />
					</Column>
					<Column size={ 12 } >
						<p>
							MiraWeb is an example usecase of a client build based on the xebra.js package. Are you interested in working on
							your own project communicating with Max MSP in similar fashion? Check out the <a href="https://github.com/Cycling74/xebra.js" target="_blank" >xebra.js project</a>.
						</p>
						<p>
							If you find any bugs or would like to share your feedback, feature requests etc. please visit the MiraWeb project on GitHub.
						</p>
					</Column>
				</Grid>
				<Grid distribution="between" className="text-center">
					<Column size={ 12 } >
						<h3>Visit us here</h3>
					</Column>
					<Column size={ 6 } >
						<a href="http://cycling74.com" target="_blank">
							<img src={ C74_LOGO } />
						</a>
					</Column>
					<Column size={ 6 } className="text-center" >
						<a href="http://github.com/Cycling74" target="_blank">
							<img src={ GH_LOGO } />
						</a>
					</Column>
				</Grid>
				<Grid>
					<Column size={ 12 } className="text-center">
						<h3>License</h3>
					</Column>
					<Column size={ 12 }>
						<p className="mw-license-text" dangerouslySetInnerHTML={ { __html : LICENSE } } />
					</Column>
				</Grid>
			</Dialog>
		)
	}
}
