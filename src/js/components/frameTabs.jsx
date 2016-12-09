import React from "react";
import map from "lodash/map.js";

import * as ActiveFrameActions from "../actions/activeFrame.js";
import * as SettingsActions from "../actions/settings.js";
import ActiveFrameStore from "../stores/activeFrame.js";
import FrameStore from "../stores/frame.js";

const BASE_CLASS = "mw-frames";

export default class FrameTabs extends React.Component {

	constructor(props) {
		super(props);
		this.state = this._buildState();

		this._unsubscribes = [];
		this._unsubscribes.push(ActiveFrameStore.listen(this._onUpdate.bind(this)));
		this._unsubscribes.push(FrameStore.listen(this._onUpdate.bind(this)));
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
			return <div
				className={ `${BASE_CLASS}-frame`}
				data-frameid={ frame.id }
				data-active={ this.state.activeFrameId === frame.id }
				key={ frame.id }
				onClick={ this._onActivateTab.bind(this) }
				onTouchStart={ this._onActivateTab.bind(this) }
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
