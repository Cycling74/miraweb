#!/usr/bin/env node
const { join } = require("path");
const { execSync } = require("child_process");
const { executeMain, REPO_DIR, runAsync } = require("./helpers");

executeMain(async () => {


	const changes = execSync("git status -s").toString();
	if (changes && changes.length) {
		console.error("Git Directory not clean. Please make sure you are working from a clean HEAD");
		process.exit(1);
		return;
	}

	await runAsync("yarn", ["run", "test"]);
	await runAsync("yarn", ["run", "setversion"]);

	const packageInfo = require("../package.json");

	await runAsync("git", [
		"add",
		"./package.json",
		"./packages/xebra-communicator/package.json",
		"./packages/xebra.js/package.json",
		"./src/package.json"
	]);

	await runAsync("git", [
		"commit",
		"-m",
		`"Set Version v${packageInfo.version}"`
	]);

	await runAsync("git", ["tag", `v${packageInfo.version}`]);
	await runAsync("yarn", ["publish", join(REPO_DIR, "packages", "xebra-communicator"), "--new-version", packageInfo.version]);
	await runAsync("yarn", ["publish", join(REPO_DIR, "packages", "xebra.js"), "--new-version", packageInfo.version]);

});
