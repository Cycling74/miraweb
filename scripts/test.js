#!/usr/bin/env node

const { executeMain, runAsync } = require("./helpers");

executeMain(async () => {

	await runAsync("yarn", ["run", "lint"]);
	await runAsync("yarn", ["workspaces", "run", "test"]);
});
