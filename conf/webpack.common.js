const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');



module.exports = {

	context: path.join(process.cwd(), 'src'), //the home directory for webpack

	entry: {
		'lib/ediPlayer': './lib/ediPlayer.js',
		'demo/index': './demo/index.js'

	},
	/*
		externals: {
			irtdab: 'irtdab.js',
			pthreadmain: 'pthread-main.js'
		},
	*/

	output: {
		path: /*path.resolve(__dirname, 'dist'), */ path.join(process.cwd(), 'dist'),
		filename: '[name].[hash].js',
		//publicPath: '',
		sourceMapFilename: '[name].map'
	},

	resolve: {
		extensions: ['.js'],  // extensions that are used
		modules: [path.join(process.cwd(), 'src'), 'node_modules'] // directories where to look for modules
	},
	plugins: [
		new CleanWebpackPlugin(['dist'], {root: process.cwd()}),
		new HtmlWebpackPlugin({
			filename: 'demo/index.html',
			template: 'demo/index.html'
		}),
		//new CopyWebpackPlugin([{from: 'lib/pthread-main.js', to: 'lib/'}],{copyUnmodified: true}),
		new CopyWebpackPlugin([{from: 'lib/irtdab.js', to: 'lib/'}],{copyUnmodified: true}),
		new CopyWebpackPlugin([{from: 'lib/irtdab.worker.js', to: 'lib/'}],{copyUnmodified: true}),
		new CopyWebpackPlugin([{from: 'demo/css/materialize.min.css', to: 'demo/'}],{copyUnmodified: true}),
		new CopyWebpackPlugin([{from: 'demo/materialize.js', to: 'demo/'}],{copyUnmodified: true}),
	]/*,

	optimization: {
		splitChunks: 		new splitChunks({
			name: 'vendor'
		}),
	}*/
};