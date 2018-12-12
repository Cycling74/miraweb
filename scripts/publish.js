#!/usr/bin/env node

const { readFile } = require("fs").promises;
const { join } = require("path");

const { executeMain, REPO_DIR, runAsync } = require("./helpers");

executeMain(async () => {

	const newVersion = JSON.parse(await readFile(join(REPO_DIR, "package.json"))).version;
	await runAsync("yarn", ["publish", join(REPO_DIR, "packages", "xebra-communicator"), "--new-version", newVersion]);
	await runAsync("yarn", ["publish", join(REPO_DIR, "packages", "xebra.js"), "--new-version", newVersion]);

});
