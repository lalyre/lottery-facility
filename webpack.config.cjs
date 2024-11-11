'use strict';
const fs = require('fs-extra');
const path = require('path');
const webpack = require("webpack");
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require("terser-webpack-plugin");
const { merge } = require('webpack-merge');


const generalConfig = {
	resolve: {
		fallback: {
			"fs": false,
			"fs-extra": false,
			"tls": false,
			"net": false,
			"path": false,
			"zlib": false,
			"http": false,
			"https": false,
			"stream": false,
			"buffer": false,
			"crypto": false,
		},
		modules: [path.resolve('./src'), "node_modules"],
		extensions: ['.tsx', '.ts', '.js'],
	},

	context: path.resolve(__dirname),
	mode: 'production',		// or 'development',
	devtool: 'source-map',	// or 'inline-source-map'
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin({
			test: /\.min\.[A-Za-z]*\.js$/i,
		})],
	},
	
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],  // Resolve .ts and .js files
		alias: {
			// This can be helpful to alias paths if needed
			'@src': path.resolve(__dirname, 'src/'),
		},
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',  // Use ts-loader to transpile TypeScript files
				exclude: /node_modules/,
			}
		]
	}

	/*externals: [
		//new UglifyJSPlugin(),
	],*/
};


const nodeConfig = {
	name: 'node-config',
	target: 'node',
	node: {
		__filename: true,
		__dirname: true,
	},

	entry: {
		"nodebundle": "./lib/main.js",
		"nodebundle.min": "./lib/main.js",
	},

	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
		filename: "lotteryfacility-[name].umd.js",
		library: {
			type: 'umd',
		},
	},

	experiments: {
		outputModule: true,
	},
	
	/*externals: [
		nodeExternals(),	// in order to ignore all modules in node_modules folder
	],*/
};


const browserConfig = {
	name: 'web-config',
	target: 'web',

	entry: {
		"webbundle": "./lib/browser.js",
		"webbundle.min": "./lib/browser.js",
	},

	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
		filename: "lotteryfacility-[name].umd.js",
		library: {
			name: 'LotteryFacility',
			type: 'umd',
			umdNamedDefine: true,
		},
		globalObject: 'this',
	},

	experiments: {
		outputModule: false,
	},
};


module.exports = (env, argv) => {
	if (argv.mode === 'development') {
		generalConfig.mode = 'development',
		generalConfig.devtool = 'cheap-module-source-map';
	} else if (argv.mode === 'production') {
	} else {
		throw new Error('Specify env');
	}

	var nodeConf = merge(generalConfig, nodeConfig);
	var webConf = merge(generalConfig, browserConfig);

	return [nodeConf, webConf];
};
