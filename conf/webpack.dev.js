const webpack = require('webpack');
const path = require('path');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');

module.exports = Merge(CommonConfig, {

	devtool:  'eval-source-map', //'source-map', // enhance debugging by adding meta info for the browser devtools
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	],
	devServer: {
		publicPath: '/',
		port: 9000,
		//watch: true,
		contentBase: path.join(process.cwd(), 'dist'), // static file location
		host: 'localhost',
		historyApiFallback: true, // true for index.html upon 404, object for multiple paths
		noInfo: false,
		stats: 'minimal',
		hot: true  // hot module replacement. Depends on HotModuleReplacementPlugin
	}
});