#!/usr/bin/env node

const { executeMain, runAsync } = require("./helpers");

executeMain(async () => {

	await runAsync("yarn", ["workspace", "miraweb", "run", "serve"]);
});
