'use strict';

const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = {
  mode: 'production',
  context: __dirname,
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  entry: './src/js/route.js',
  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: 'route.min.js',
    library: 'route',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    libraryExport: 'default',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ]
  },
  plugins: [
    new UnminifiedWebpackPlugin(),
    new UglifyJsPlugin({
      sourceMap: false,
      uglifyOptions: {
        output: {
          beautify: false
        },
        compress: {
          drop_console: true
        }
      }
    }),
  ],
  devtool: false,
  performance: {
    hints: false,
  },
  stats: {
    modules: false,
  },
};
