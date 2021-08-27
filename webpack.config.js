const path = require('path');
const webpack = require("webpack");
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require("terser-webpack-plugin");


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
            "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
        },
		extensions: ['.tsx', '.ts', '.js'],
    },
    mode: 'production',
    devtool: "source-map",
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            include: /\.min\.js$/
        })],
    },
};


const nodeConfig = {
    entry: {
        "node-bundle": "./lib/node.js",
        "node-bundle.min": "./lib/node.js",
    },
	target: 'node',
	externals: [nodeExternals()],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "lottery-facility-[name].js",
        //library: 'LotteryFacility',
    },
};


const browserConfig = {
    entry: {
        "web-bundle": "./lib/browser.js",
        "web-bundle.min": "./lib/browser.js",
    },
	target: 'web',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: "lottery-facility-[name].js",
		libraryTarget: 'umd',
		globalObject: 'this',
		libraryExport: 'default',
		umdNamedDefine: true,
        library: 'LotteryFacility',
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
