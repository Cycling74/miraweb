import React from "react";
import ReactDOM from "react-dom";

// Components
import App from "./components/app.jsx";

// Stores and Actions
import * as XebraStateActions from "./actions/xebraState.js";
import { getSupportedObjects }  from "./objects/factory.js";


function init(options) {

	XebraStateActions.setSupportedObjects(getSupportedObjects());

	ReactDOM.render(
		<App {...options} />,
		options.element
	);
}

export default {
	init
};
