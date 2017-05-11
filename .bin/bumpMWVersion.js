const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
const semver = require("semver");

const packageInfoPath = path.join(__dirname, "..", "package.json");
const packageInfo = require(packageInfoPath);

inquirer.prompt([
	{
		type : "confirm",
		name : "increaseMWVersion",
		message : "Would you like to set a new MiraWeb version?",
		"default" : false
	}
]).then((answers) => {
	if (!answers.increaseMWVersion) return;

	inquirer.prompt([
		{
			type : "input",
			name : "version",
			message : `What's the new version? (current: ${packageInfo.version})`,
			validate : (v) => {
				if (!semver.valid(v)) return "Please provide a valid version";
				if (!semver.gt(v, packageInfo.version)) return `Please provide a version that is greater than the current (${packageInfo.version})`;
				return true;
			},
			filter : (v) => {
				return v.trim();
			}
		}
	]).then((versionAnswer) => {
		packageInfo.version = versionAnswer.version;
		fs.writeFileSync(packageInfoPath, JSON.stringify(packageInfo, null, 2), "utf-8");
	});
});
