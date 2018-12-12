#!/usr/bin/env node

const { executeMain, runAsync } = require("./helpers");

executeMain(async () => {

	const RELEASE = process.env.MW_RELEASE === "true";

	console.log("Building Xebra-Communicator");
	await runAsync("yarn", ["workspace", "xebra-communicator", "run", "build"]);

	console.log("Building Xebra.js");
	await runAsync("yarn", ["workspace", "xebra.js", "run", "build"]);

	console.log("Building MiraWeb");
	await runAsync("yarn", ["workspace", "miraweb", "run", RELEASE ? "build-release" : "build"]);

});
