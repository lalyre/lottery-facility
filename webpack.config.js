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
        "nodebundle": "./lib/node.js",
        "nodebundle.min": "./lib/node.js",
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

