'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {
  context: __dirname,
  resolve: {
	modules: [
	  path.resolve(__dirname, 'src'),
	  'node_modules'
	],
  },
  entry: {
	'route': './src/js/route.js',
	'route.min': './src/js/route.js',
  },
  externals: [],
  output: {
	path: path.resolve(__dirname, 'dist/js'),
	filename: "[name].js",
	library: 'route',
	libraryTarget: 'umd',
	umdNamedDefine: true,
	libraryExport: 'default'
  },
  module: {
	rules: [
	  {
		test: /\.js$/,
		loader: 'babel-loader',
		exclude: path.resolve(__dirname, 'node_modules'),
	  },
	]
  },
  plugins: [
	new webpack.optimize.UglifyJsPlugin({
	  include: /\.min\.js$/,
	  minimize: true,
	}),
  ],
  devtool: false,
  performance: {
	hints: false,
  }
};
