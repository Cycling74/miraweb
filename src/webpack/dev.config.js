const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const commonConfig = require("./common.config.js");

// Output
commonConfig.output = {
	path : path.join(__dirname, "..", "..", "dev_build"),
	filename : "app.js"
};
commonConfig.devtool = "source-map";

// Add Plugins
commonConfig.plugins.push(new HtmlWebpackPlugin({
	filename : "index.html",
	hash : true,
	inject : "body",
	minify : false,
	template : path.join(__dirname, "..", "index_tmpl.html"),
	title : "Dev Build: Mira Web"
}));

commonConfig.plugins.push(new webpack.DefinePlugin({
	__DEBUG__ : true,
	__MW_DEV_SERVER__ : process.env.MW_DEV_SERVER === "true"
}));

if (process.env.MW_DEV_SERVER === "true") {
	commonConfig.devServer = {
		hot : false,
		host : "0.0.0.0",
		/*
		 * Adding this for now until WebpackDevServer has better whitelisting approaches
		 * wrt hostname checks (WIP on https://github.com/webpack/webpack-dev-server/pull/899)
		 * Luckily MW doesn't include any sensitive data, settings, env variables etc.
		 * that might be affected by setting disableHostCheck to 'true'.
		 * If you'd like to read more:
		 *		* https://github.com/webpack/webpack-dev-server/issues/882
		 *		* https://github.com/webpack/webpack-dev-server/releases/tag/v2.4.3
		 */

		disableHostCheck : true,
		overlay : {
			errors : true
		}
	};
}

module.exports = commonConfig;
