#!/usr/bin/env node

const { executeMain, runAsync } = require("./helpers");

executeMain(async () => {

	await runAsync("yarn", ["workspace", "xebra-communicator", "run", "build"]);
	await runAsync("yarn", ["workspace", "xebra.js", "run", "build"]);
});
