import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import map from "lodash/map.js";

import { TAB_COLOR_CHANGE_AMT, TAB_COLOR_MODES } from "../lib/constants.js";
import * as ActiveFrameActions from "../actions/activeFrame.js";
import * as SettingsActions from "../actions/settings.js";
import ActiveFrameStore from "../stores/activeFrame.js";
import FrameStore from "../stores/frame.js";
import PatcherStore from "../stores/patcher.js";
import SettingsStore from "../stores/settings.js";
import tinycolor from "tinycolor2";

const BASE_CLASS = "mw-frames";

class FrameTab extends React.Component {

	_onActivate(e) {
		this.props.onActivate(e.target.dataset.frameid);
	}

	render() {

		const classes = [
			`${BASE_CLASS}-frame`,
			{
				[`${BASE_CLASS}-frame--light`] : this.props.isDark
			}
		];

		let style = { backgroundColor : this.props.bgColor };
		return <div
			className={ classnames(classes) }
			data-frameid={ this.props.id }
			data-active={ this.props.active }
			onClick={ this._onActivate.bind(this) }
			onTouchStart={ this._onActivate.bind(this) }
			style={ style }
		>
			{ this.props.name }
		</div>;
	}
}

FrameTab.propTypes = {
	active : PropTypes.bool.isRequired,
	bgColor : PropTypes.string.isRequired,
	id : PropTypes.number.isRequired,
	isDark : PropTypes.bool.isRequired,
	name : PropTypes.string.isRequired,
	onActivate : PropTypes.func.isRequired
};

export default class FrameTabs extends React.Component {

	constructor(props) {
		super(props);
		this.state = this._buildState();

		this._unsubscribes = [];
		this._unsubscribes.push(ActiveFrameStore.listen(this._onUpdate.bind(this)));
		this._unsubscribes.push(FrameStore.listen(this._onUpdate.bind(this)));
		this._unsubscribes.push(FrameStore.on("frame_tint", this._onUpdate.bind(this)));
		this._unsubscribes.push(PatcherStore.on("patcher_tint", this._onUpdate.bind(this)));
		this._unsubscribes.push(SettingsStore.on("change_setting", this._onChangeSettingsState.bind(this)));
	}

	componentWillUnmount() {
		this._unsubscribes.forEach((f) => {
			f();
		});
	}

	_buildState() {
		const activeFrame = ActiveFrameStore.getFrame();
		return {
			activeFrameId : activeFrame ? activeFrame.id : null,
			frames : FrameStore.getFrames(),
			tabColor : SettingsStore.getSettingState("tabColor"),
			tabColorMode : SettingsStore.getSettingState("tabColorMode")
		};
	}

	_onChangeSettingsState(setting, value) {
		if (setting === "tabColorMode" || setting === "tabColor") this._onUpdate();
	}

	_onUpdate() {
		this.setState(this._buildState());
	}

	_onActivateTab(id) {
		let frame = FrameStore.getFrame(id);
		ActiveFrameActions.set(frame);
	}

	_onShowSettings() {
		SettingsActions.toggleView();
	}


	_renderTabs() {
		return map(this.state.frames, (frame, index) => {
			let bgColor = PatcherStore.getBackgroundColorForFrame(frame);

			switch (this.state.tabColorMode) {
				case TAB_COLOR_MODES.COLOR:
					bgColor = tinycolor.fromRatio({
						r : this.state.tabColor[0],
						g : this.state.tabColor[1],
						b : this.state.tabColor[2]
					});
					break;
				case TAB_COLOR_MODES.DARKEN:
					bgColor = tinycolor.fromRatio({
						r : bgColor[0],
						g : bgColor[1],
						b : bgColor[2]
					});
					bgColor = bgColor.darken(TAB_COLOR_CHANGE_AMT);
					break;
				case TAB_COLOR_MODES.LIGHTEN:
				default:
					bgColor = tinycolor.fromRatio({
						r : bgColor[0],
						g : bgColor[1],
						b : bgColor[2]
					});
					bgColor = bgColor.lighten(TAB_COLOR_CHANGE_AMT);
					break;
			}
			return (
				<FrameTab
					active={ this.state.activeFrameId === frame.id }
					bgColor={ bgColor.toHexString() }
					key={ frame.id }
					id={ frame.id }
					isDark={ bgColor.isDark() }
					onActivate={ this._onActivateTab.bind(this) }
					name={ frame.getParamValue("tabname") || "Frame " + (index + 1) }
				/>
			);
		});
	}

	render() {
		return (
			<div className={ BASE_CLASS } >
				{ this._renderTabs() }
				<span className={ `${BASE_CLASS}-show-settings` } onClick={ this._onShowSettings.bind(this) } />
			</div>
		);
	}
}
