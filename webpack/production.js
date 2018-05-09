const merge = require('webpack-merge');
const common = require('./common');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');

module.exports = merge(common, {
    mode: 'production',
    output: {
        crossOriginLoading: 'anonymous',
        path: path.join(__dirname, 'build'),
        filename: '[name].[hash:6].js',
        chunkFilename: '[id].chunk.js',
        publicPath: '',
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: 'style-loader',
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [
                                    require('precss'),
                                    require('autoprefixer')
                                ];
                            }
                        }
                    }, {
                        loader: 'sass-loader'
                    }],
                    publicPath: 'build'
                })
            },
        ],
    },
    plugins: [
        new UglifyJsPlugin(),
        new ExtractTextPlugin({
            filename: 'app.css',
            disable: false,
            allChunks: true
        }),
    ],
});