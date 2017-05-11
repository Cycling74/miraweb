
var browserify = require("browserify");
var fs = require("fs");
var path = require("path");
var format = require("util").format;
var uglifyJS = require("uglify-js");

var packageInfo = require(path.resolve(__dirname, "../package.json"));

var OUT_DIR = path.resolve(__dirname, "../dist");
var OUT_FILE = path.join(OUT_DIR, "xebra.js");
var OUT_MIN_FILE = path.join(OUT_DIR, "xebra.min.js");
var MAIN_FILE = path.resolve(__dirname, "../src/index.js");

console.log(format("Building %s v%s\n", packageInfo.name, packageInfo.version));

// Gather license information
var license = [
	"/*!",
	format("%s - v%s", packageInfo.name, packageInfo.version),
	format("Compiled on %s", new Date().toUTCString()),
	"",
	format("%s is licensed under the %s license", packageInfo.name, packageInfo.license),
	"\n */\n"
].join("\n * ");


// Deleting Old Dist Files
fs.mkdirSync(OUT_DIR);

// Bundle
var bundler = browserify(MAIN_FILE, {
	bundleExternal : true,
	standalone : "Xebra",
	transform : [
		"babelify"
	]
});

console.log("Building dist bundle xebra.js...");
var writeStream = fs.createWriteStream(OUT_FILE);
writeStream.write(license);
bundler
	.bundle()
	.pipe(writeStream);

writeStream.on("finish", function() {
	console.log("Generating optimized version xebra.min.js...");
	var minVersion = uglifyJS.minify(OUT_FILE, {
		compress : true
	});
	fs.writeFileSync(OUT_MIN_FILE, license + minVersion.code);
	console.log("DONE!\n");
});
