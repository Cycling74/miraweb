#!/usr/bin/env node
const helpers = require("./helpers.js");
const path = require("path");

const PIXI_DIR = path.join(__dirname, "..", "node_modules", "pixi.js");

const installDependencies = () => {
	return helpers.execCommand("Installing PIXI dependencies", "npm", ["install"], PIXI_DIR);
};

const buildLib = () => {
	return helpers.execCommand("Building lib version", "npm", ["run", "lib"], PIXI_DIR);
};

module.exports = {
	installDependencies,
	buildLib
};
