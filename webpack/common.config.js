var path = require("path");
var pck = require("../package.json");
var webpack = require("webpack");
var util = require("util");
var FaviconsWebpackPlugin = require("favicons-webpack-plugin");

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
		require("autoprefixer")({ browsers : ["last 5 versions", "Safari >= 8", "iOS >= 8"] })
	],
	plugins : [
		new webpack.DefinePlugin({
			__VERSION__ : JSON.stringify(pck.version),
			__LICENSE__ : JSON.stringify(license),
			__ASSETDIR__ : JSON.stringify(ASSET_DIR)
		}),
		new FaviconsWebpackPlugin({
			logo : path.resolve(__dirname, path.join("..", "src", "assets", "miraweb_logo.png")),
			prefix : "./static/",
			// emitStats : false,
			statsFilename : "../[hash].json",
			persistentCache : true,
			inject : true,
			background : "#595959",
			title : "MiraWeb",
			icons : {
				android : false,
				appleIcon : true,
				appleStartup : false,
				coast : false,
				favicons : true,
				firefox : false,
				opengraph : false,
				twitter : false,
				yandex : false,
				windows : false
			}
		})
	],
	watch : process.env.WATCH ? true : false
};

module.exports = config;
