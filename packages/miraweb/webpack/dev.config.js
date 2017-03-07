var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var webpack = require("webpack");

var commonConfig = require("./common.config.js");

// Output
commonConfig.output = { path : "dev_build", filename : "app.js" };
commonConfig.debug = true;
commonConfig.devtool = "source-map";

// Add Plugins
commonConfig.plugins.push(new HtmlWebpackPlugin({
	filename : "index.html",
	hash : true,
	inject : "body",
	minify : false,
	template : path.join(__dirname, "..", "src", "index_tmpl.html"),
	title : "Dev Build: Mira Web"
}));

commonConfig.plugins.push(new webpack.DefinePlugin({
	__DEBUG__ : true
}));

module.exports = commonConfig;
