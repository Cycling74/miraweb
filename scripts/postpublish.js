#!/usr/bin/env node

const { join } = require("path");
const ghpages = require("gh-pages");

const { executeMain, REPO_DIR, runAsync } = require("./helpers");
const packageInfo = require("../package.json");

const publishGitHubPages = () => {
	return new Promise((resolve, reject) => {
		ghpages.publish(
			join(REPO_DIR, "packages", "xebra.js", "docs"),
			{
				message: `updating Docs to version ${packageInfo.version}`,
				repo: "https://github.com/Cycling74/xebra.js.git",
				tag: packageInfo.version
			},
			(err) => {

				if (err) return void reject(err);
				resolve();
			}
		);
	});
};


executeMain(async () => {

	console.log("Building Xebra.js Docs");
	await runAsync("yarn", ["workspace", "xebra.js", "run", "docs"]);

	console.log("Publishing Xebra.js Docs");
	await publishGitHubPages();

});

