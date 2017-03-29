const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const commonConfig = require("./common.config.js");

// Output
commonConfig.output = {
	path : path.join(__dirname, "..", "build"),
	filename : "app.js"
};

// Misc
commonConfig.devtool = "cheap-module-source-map";

// Add Plugins
commonConfig.plugins.push(new HtmlWebpackPlugin({
	filename : "index.html",
	hash : true,
	inject : "body",
	minify : {},
	template : path.join(__dirname, "..", "src", "index_tmpl.html"),
	title : "Mira Web"
}));

commonConfig.plugins.push(new webpack.DefinePlugin({
	"process.env" : {
		NODE_ENV : JSON.stringify("production")
	},
	__DEBUG__ : false,
	__MW_DEV_SERVER__ : false
}));

commonConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
	sourceMap : false,
	compress : {
		warnings : false
	}
}));

module.exports = commonConfig;
