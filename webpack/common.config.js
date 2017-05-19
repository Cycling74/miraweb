const path = require("path");
const pck = require("../package.json");
const webpack = require("webpack");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

const ASSET_DIR = path.resolve(__dirname, path.join("..", "src", "assets"));

const fs = require("fs");
let license = fs.readFileSync(path.resolve(__dirname, "../LICENSE"), "utf8");
license = license.replace(/\n\n/g, "<br/><br/>");

const config = {
	entry : "./src/js/index.js",
	target : "web",
	module : {
		rules : [
			{
				loader : "babel-loader",
				include : [
					path.resolve(__dirname, "../src/js"),
					path.resolve(__dirname, "../node_modules/hammerjs")
				],
				test : /\.jsx?$/
			},
			{
				use : [
					"style-loader",
					"css-loader",
					{
						loader : "postcss-loader",
						options : {
							plugins : () => {
								return [
									require("autoprefixer")({
										browsers : ["last 5 versions", "Safari >= 8", "iOS >= 8"]
									})
								];
							}
						}
					},
					"sass-loader"
				],
				test : /\.scss$/
			},
			{
				loader : "file-loader?name=./static/[name].[ext]",
				test : /\.(jpe?g|png|gif|svg|ico)$/i
			},
			{
				loader : "source-map-loader",
				test : /\.jsx$/,
				enforce : "pre"
			}
		]
	},
	resolve: {
		alias: {
			gyronorm: 'gyronorm/dist/gyronorm.complete.js'
		}
	},
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
