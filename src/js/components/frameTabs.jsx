import React from "react";
import classnames from "classnames";
import map from "lodash/map.js";

import { DEFAULT_BG, BG_DARKEN_AMT } from "../lib/constants.js";
import * as ActiveFrameActions from "../actions/activeFrame.js";
import * as SettingsActions from "../actions/settings.js";
import ActiveFrameStore from "../stores/activeFrame.js";
import FrameStore from "../stores/frame.js";
import tinycolor from "tinycolor2";

const BASE_CLASS = "mw-frames";

export default class FrameTabs extends React.Component {

	constructor(props) {
		super(props);
		this.state = this._buildState();

		this._unsubscribes = [];
		this._unsubscribes.push(ActiveFrameStore.listen(this._onUpdate.bind(this)));
		this._unsubscribes.push(FrameStore.listen(this._onUpdate.bind(this)));
		this._unsubscribes.push(FrameStore.on("frame_tint", this.render.bind(this)));
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
			frames : FrameStore.getFrames()
		};
	}

	_onUpdate() {
		this.setState(this._buildState());
	}

	_onActivateTab(e) {
		let frameId = e.target.dataset.frameid;
		let frame = FrameStore.getFrame(frameId);
		ActiveFrameActions.set(frame);
	}

	_onShowSettings() {
		SettingsActions.toggleView();
	}


	_renderTabs() {

		return map(this.state.frames, (frame, index) => {
			let bgColor = frame.getParamValue("color") || DEFAULT_BG;
			bgColor = tinycolor.fromRatio({
				r : bgColor[0],
				g : bgColor[1],
				b : bgColor[2]
			}).darken(BG_DARKEN_AMT);
			const classes = [
				`${BASE_CLASS}-frame`,
				{
					[`${BASE_CLASS}-frame--light`] : bgColor.isDark()
				}
			];
			let style = { backgroundColor : bgColor.toHexString() };

			return <div
				className={ classnames(classes) }
				data-frameid={ frame.id }
				data-active={ this.state.activeFrameId === frame.id }
				key={ frame.id }
				onClick={ this._onActivateTab.bind(this) }
				onTouchStart={ this._onActivateTab.bind(this) }
				style={ style }
			>
				{ frame.getParamValue("tabname") || "Frame " + (index + 1) }
			</div>;
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
