#!/usr/bin/env node

const { executeMain, PACKAGE_DIRS, runAsync } = require("./helpers");

executeMain(async () => {

	const RELEASE = process.env.MW_RELEASE === "true";

	console.log("Building Xebra-Communicator");
	await runAsync("yarn", ["run", "build"], {
		cwd: PACKAGE_DIRS.XEBRA_COMMUNICATOR
	});

	console.log("Building Xebra.js");
	await runAsync("yarn", ["run", "build"], {
		cwd: PACKAGE_DIRS.XEBRA
	});

	console.log("Building MiraWeb");
	await runAsync("yarn", ["run", RELEASE ? "build-release" : "build"], {
		cwd: PACKAGE_DIRS.MIRAWEB
	});

});
