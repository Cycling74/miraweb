// load global styling
require("../theme/index.scss");

// load global assets
require(`${__ASSETDIR__}/favicon.ico`); // overwrite naming pattern for favicon
require(`${__ASSETDIR__}/apple-touch-icon-76.png`);
require(`${__ASSETDIR__}/apple-touch-icon-120.png`);
require(`${__ASSETDIR__}/apple-touch-icon-152.png`);
require(`${__ASSETDIR__}/apple-touch-icon-167.png`);
require(`${__ASSETDIR__}/apple-touch-icon-180.png`);

import Mira from "./mira.jsx";

document.addEventListener("DOMContentLoaded", function() {

	let HOST_NAME = window.location.search.match(/hostname=([^&]*)/);
	HOST_NAME = HOST_NAME && HOST_NAME.length === 2 ? HOST_NAME[1] : window.location.hostname || "localhost";

	let PORT = window.location.search.match(/port=([0-9]*)/);
	PORT = PORT && PORT.length === 2 ? parseInt(PORT[1], 10) : 8086;

	Mira.init({
		port : PORT,
		hostname : HOST_NAME,
		element : document.getElementById("app-container")
	});
});
