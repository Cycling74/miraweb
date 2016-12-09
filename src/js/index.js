// load global styling
require("../theme/index.scss");

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
