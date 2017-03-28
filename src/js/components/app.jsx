import React from "react";

import About from "./about.jsx";
import ConnectDialog from "./connectDialog.jsx";
import FrameTabs from "./frameTabs.jsx";
import HomeScreenPopup from "./homeScreenPopup.jsx";

import PixiView from "./pixiView.jsx";
import Settings from "./settings.jsx";

export default class App extends React.Component {
	render() {
		return (
			<div id="mw-app" >
				<FrameTabs />
				<PixiView />
				<ConnectDialog hostname={ this.props.hostname } port={ this.props.port } />
				<Settings />
				<About />
				<HomeScreenPopup />
			</div>
		);
	}
}
