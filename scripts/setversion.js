#!/usr/bin/env node

const { executeMain, REPO_DIR, runAsync } = require("./helpers");
const { readFile, writeFile } = require("fs").promises;
const { join } = require("path");

executeMain(async () => {

	const [,, ...args] = process.argv;

	// Set main repo version first
	await runAsync("yarn", ["version", ...args, "--no-git-tag-version"]);
	const newVersion = JSON.parse(await readFile(join(REPO_DIR, "package.json"))).version;

	await runAsync("yarn", ["workspace", "xebra-communicator", "version", "--new-version", newVersion, "--no-git-tag-version"]);
	await runAsync("yarn", ["workspace", "xebra.js", "version", "--new-version", newVersion, "--no-git-tag-version"]);
	await runAsync("yarn", ["workspace", "miraweb", "version", "--new-version", newVersion, "--no-git-tag-version"]);

	// update interdependencies
	const packagesToUpdate = ["xebra-communicator", "xebra.js"];
	const workspaces = [
		join(REPO_DIR, "packages", "xebra-communicator"),
		join(REPO_DIR, "packages", "xebra.js"),
		join(REPO_DIR, "src")
	];


	for (let i = 0, il = workspaces.length; i < il; i++) {
		const info = JSON.parse(await readFile(join(workspaces[i], "package.json")));
		for (let j = 0, jl = packagesToUpdate.length; j < jl; j++) {
			if (info.dependencies[packagesToUpdate[j]]) info.dependencies[packagesToUpdate[j]] = newVersion;
			if (info.devDependencies[packagesToUpdate[j]]) info.devDependencies[packagesToUpdate[j]] = newVersion;
		}

		await writeFile(join(workspaces[i], "package.json"), JSON.stringify(info, null, 2));
	}
});
