#!/usr/bin/env node

const { executeMain, REPO_DIR, runAsync } = require("./helpers");
const { readFile } = require("fs").promises;
const { join } = require("path");

executeMain(async () => {

	const [,, ...args] = process.argv;

	// Set main repo version first
	await runAsync("yarn", ["version", ...args, "--no-git-tag-version"]);
	const newVersion = JSON.parse(await readFile(join(REPO_DIR, "package.json"))).version;

	await runAsync("yarn", ["workspace", "xebra-communicator", "version", "--new-version", newVersion, "--no-git-tag-version"]);
	await runAsync("yarn", ["workspace", "xebra.js", "version", "--new-version", newVersion, "--no-git-tag-version"]);
	await runAsync("yarn", ["workspace", "miraweb", "version", "--new-version", newVersion, "--no-git-tag-version"]);
});
