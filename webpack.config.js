'use strict';

const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = {
  mode: 'production',
  context: process.cwd(),
  resolve: {
    modules: [
      path.resolve(process.cwd(), 'node_modules'),
    ],
  },
  entry: './src/js/route.js',
  output: {
    path: path.resolve(process.cwd(), 'dist/js'),
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
    new TerserPlugin({
      cache: true,
      parallel: true,
      sourceMap: false,
      terserOptions: {
        output: {
          comments: false,
          beautify: false,
        },
        compress: {
          drop_debugger: true,
          drop_console: true,
          dead_code: true,
        }
      }
    }),
  ],
  devtool: false,
  watchOptions: {
    ignored: /node_modules/
  },
  performance: {
    hints: false,
  },
  stats: {
    modules: false,
    children: false,
    entrypoints: false
  },
};
