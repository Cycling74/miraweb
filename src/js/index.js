// load global styling
require("../theme/index.scss");

import Mira from "./mira.jsx";

document.addEventListener("DOMContentLoaded", function() {

	let HOST_NAME = window.location.search.match(/hostname=([^&]*)/);
	HOST_NAME = HOST_NAME && HOST_NAME.length === 2 ? HOST_NAME[1] : window.location.hostname || "localhost";

	let PORT = window.location.search.match(/port=([0-9]*)/);
	if (PORT && PORT.length === 2) {
		PORT = parseInt(PORT[1], 10);
	}
	/* global __MW_DEV_SERVER__:false */
	else if (!__MW_DEV_SERVER__ && /^http(s)?:$/.test(window.location.protocol)) { // don't use served port when running webpack-dev-server
		PORT = parseInt(window.location.port, 10);
	}
	PORT = !PORT || isNaN(PORT) ? 8086 : PORT;

	Mira.init({
		port : PORT,
		hostname : HOST_NAME,
		element : document.getElementById("app-container")
	});
});
