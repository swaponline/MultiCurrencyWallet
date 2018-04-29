const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const autoprefixer = require('autoprefixer');
const precss = require('precss');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new UglifyJsPlugin(),
        new ExtractTextPlugin({
            filename: 'app.css',
            disable: false,
            allChunks: true
        }),
    ],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: 'style-loader', // inject CSS to page
                    }, {
                        loader: 'postcss-loader', // Run post scss actions
                        options: {
                            plugins: function () { // post scss plugins, can be exported to postcss.config.js
                                return [
                                    precss,
                                    autoprefixer
                                ];
                            }
                        }
                    }, {
                        loader: 'sass-loader' // compiles Sass to CSS
                    }],
                    publicPath: 'build'
                })
            },
        ],
    },
});