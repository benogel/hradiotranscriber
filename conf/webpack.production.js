const webpack = require('webpack');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = Merge(CommonConfig, {
	//productionSourceMap: false,
	plugins: [
		new webpack.LoaderOptionsPlugin({
			minimize: true,
			debug: false
		}),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		})],
	optimization: {
		minimizer: [
			new TerserPlugin({
				cache: true,
				parallel: true,
				sourceMap: false, // Must be set to true if using source-maps in production
				terserOptions: {
				  	// https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
				}
			}),
		]
	}
	
});