#!/usr/bin/env node
const helpers = require("./helpers.js");
const pixiBuildSteps = require("./buildPixiSteps.js");
const path = require("path");

helpers.logToConsole("Setting up repository. This might take a bit...");
helpers.logToConsole("");
helpers
	.execCommand(null, "npm", ["set", "progress=false"])
	.then(() => {
		return helpers.execCommand("Installing NPM dependencies", "npm", ["install"]);
	})
	.then(() => {
		return helpers.execCommand("Install and setup included package dependencies", "lerna", ["bootstrap"]);
	})
	.then(() => {
		return helpers.execCommand("Link Xebra.js", "npm", ["link", path.join(__dirname, "..", "packages", "xebra.js")]);
	})
	.then(() => {
		return pixiBuildSteps.installDependencies();
	})
	.then(() => {
		return pixiBuildSteps.buildLib();
	})
	.then(() => {
		helpers.exitProcess(0);
	})
	.catch((err) => {
		helpers.exitProcess(1, err);
	});
