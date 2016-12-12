var path = require("path");
var pck = require("../package.json");
var webpack = require("webpack");
var util = require("util");

var ASSET_DIR = path.resolve(__dirname, path.join("..", "src", "assets"));

var fs = require("fs");
var license = fs.readFileSync(path.resolve(__dirname, "../LICENSE"), "utf8");
license = license.replace(/\n\n/g, "<br/><br/>");

var config = {
	entry : "./src/js/index.js",
	module : {
		loaders : [
			{
				include : [
					path.resolve(__dirname, "../src/js"),
					path.resolve(__dirname, "../node_modules/hammerjs")
				],
				loader : "babel-loader",
				test : /\.jsx?$/
			},
			{
				loader : "style-loader!css-loader!postcss-loader!sass-loader",
				test : /\.scss$/
			},
			{
				loader : "file-loader?name=./static/[name].[ext]",
				test : /\.(jpe?g|png|gif|svg|ico)$/i
			}
		],
		preLoaders : [
			{ test : /\.jsx$/, loader : "source-map-loader" }
		]
	},
	postcss : [
		require("autoprefixer")({ browsers: ["last 5 versions"] })
	],
	plugins : [
		new webpack.DefinePlugin({
			__VERSION__ : JSON.stringify(pck.version),
			__LICENSE__ : JSON.stringify(license),
			__ASSETDIR__ : JSON.stringify(ASSET_DIR)
		})
	],
	watch : process.env.WATCH ? true : false
};

module.exports = config;
