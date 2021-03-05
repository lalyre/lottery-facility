const path = require('path');
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");


module.exports = {
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
    },
    entry: {
        "bundle": "./lib/index.js",
        "bundle.min": "./lib/index.js",
    },
    mode: 'production',
    devtool: "source-map",
    target: 'web',		    // 'web' or 'node'
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "lottery-facility-[name].js",
        library: 'LotteryFacility',
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            include: /\.min\.js$/
        })],
    },
};
