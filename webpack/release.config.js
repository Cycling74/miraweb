var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var webpack = require("webpack");

var commonConfig = require("./common.config.js");

// Output
commonConfig.output = { path : "build", filename : "app.js" };

// Misc
commonConfig.debug = false;
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
	__DEBUG__ : false
}));

commonConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
	sourceMap : false,
	compress : {
		warnings : false
	}
}));

module.exports = commonConfig;
