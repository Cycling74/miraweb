#!/usr/bin/env node
const helpers = require("./helpers.js");
const pixiBuildSteps = require("./buildPixiSteps.js");

helpers.logToConsole("Building custom PIXI.js version...");
helpers.logToConsole("");

pixiBuildSteps
	.installDependencies()
	.then(() => {
		return pixiBuildSteps.buildLib();
	})
	.then(() => {
		return helpers.exitProcess(0);
	})
	.catch((err) => {
		return helpers.exitProcess(1, err);
	});
