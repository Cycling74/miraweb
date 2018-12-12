// make ES6 work here
require("babel-register");

const OBJECT_PARAMETERS = require("../src/lib/objectList.js").OBJECT_PARAMETERS;
const path = require("path");
const fs = require("fs");

const TUT_FILENAME = "00-objectlist.md";
const TUT_PATH = path.resolve(__dirname, `../tutorials/${TUT_FILENAME}`);

const TUT_HEADER = "This is an overview of the currently available objects and their parameters in Xebra. For more information about these objects, their functionality, and the functionality of each of their parameters, see the Max documentation. The reference guide is available from within Max, and also online at {@link https://docs.cycling74.com/max7/}\n```";
const TUT_FOOTER = "```";

const objContent = [];
const genObjBlock = (objName, params) => {
	const blockContent = [];
	blockContent.push(`${objName}\n`);
	params.forEach((param) => {
		blockContent.push(`\t* ${param}`);
	});
	return blockContent.join("\n");
};

const objNames = Object.keys(OBJECT_PARAMETERS);
for (let i = 0, il = objNames.length; i < il; i++) {
	const objName = objNames[i];
	objContent.push(genObjBlock(objName, OBJECT_PARAMETERS[objName]));
}

const content = [TUT_HEADER, objContent.join("\n\n"), TUT_FOOTER];

fs.writeFileSync(TUT_PATH, content.join("\n"));
