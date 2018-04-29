const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const autoprefixer = require('autoprefixer');
const precss = require('precss');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [{
                    loader: 'style-loader',
                }, {
                    loader: 'postcss-loader', // Run post scss actions
                    options: {
                        plugins: function () {
                            return [
                                precss,
                                autoprefixer,
                            ];
                        }
                    }
                }, {
                    loader: 'sass-loader' // compiles Sass to CSS
                }]
            },
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ]
});