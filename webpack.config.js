const path = require('path');
const webpack = require("webpack");
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require("terser-webpack-plugin");

// import path from 'path';
// import webpack from 'webpack';
// import nodeExternals from 'webpack-node-externals';
// import TerserPlugin from 'terser-webpack-plugin';

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const __dirname = path.resolve();


const generalConfig = {
	resolve: {
		fallback: {
			"fs": false,
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
			include: /\.min\.js$/
		})],
	},
};


const nodeConfig = {
	entry: {
		"nodebundle": "./lib/main.js",
		"nodebundle.min": "./lib/main.js",
	},
	target: 'node',
	node: {
		__filename: true,
		__dirname: true,
	},
	externals: [
		nodeExternals(),	// in order to ignore all modules in node_modules folder
	],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: "lotteryfacility-[name].js",
		library: {
			type: 'umd',
		},
	},
};


const browserConfig = {
	entry: {
		"webbundle": "./lib/browser.js",
		"webbundle.min": "./lib/browser.js",
	},
	target: 'web',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: "lotteryfacility-[name].js",
		library: {
			name: 'LotteryFacility',
			type: 'commonjs',
		},
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

	Object.assign(nodeConfig, generalConfig);
	Object.assign(browserConfig, generalConfig);

	return [nodeConfig, browserConfig];
};

