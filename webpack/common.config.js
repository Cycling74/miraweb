var path = require("path");
var pck = require("../package.json");
var webpack = require("webpack");
var util = require("util");

var fs = require("fs");
var license = fs.readFileSync(path.resolve(__dirname, "../LICENSE"), "utf8");
license = license.replace(/\n\n/g, "<br/><br/>");

var config = {
	entry : "./src/js/index.js",
	module : {
		loaders : [
			{
				test : /\.jsx?$/,
				include : [
					path.resolve(__dirname, "../src/js"),
					path.resolve(__dirname, "../node_modules/hammerjs")
				],
				loader : "babel"
			},
			{ test : /\.scss$/, loader : "style-loader!css-loader!postcss-loader!sass-loader" }
		],
		preLoaders : [
			{ test : /\.jsx$/, loader : "source-map-loader" }
		]
	},
	postcss : [ require("autoprefixer")({ browsers: ["> 5%"] }) ],
	plugins : [
		new webpack.DefinePlugin({
			__VERSION__ : JSON.stringify(pck.version),
			__LICENSE__ : JSON.stringify(license)
		})
	],
	watch : process.env.WATCH ? true : false
};

module.exports = config;
