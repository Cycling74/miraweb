#!/usr/bin/env node
const helpers = require("./helpers.js");
const path = require("path");

helpers.logToConsole("Cleaning up...");
helpers.logToConsole("");
helpers
	.execCommand("Removing internal package dependencies", "lerna", ["clean", "--yes"])
	.then(() => {
		return helpers.execCommand("Unlinking xebra.js", "npm", ["unlink", "xebra.js"]);
	})
	.then(() => {
		return helpers.execCommand("Removing node_modules", "rimraf", [path.join(__dirname, "..", "node_modules")]);
	})
	.then(() => {
		helpers.exitProcess(0);
	})
	.catch((err) => {
		helpers.exitProcess(1, err);
	});
