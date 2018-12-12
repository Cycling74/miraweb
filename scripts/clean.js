#!/usr/bin/env node

const { executeMain, runAsync } = require("./helpers");

executeMain(async () => {

	await runAsync("yarn", ["workspaces", "run", "clean"]);
	await runAsync("rimraf", ["./dev_build"]);
	await runAsync("rimraf", ["./build"]);
	await runAsync("rimraf", ["./node_modules"]);
});
