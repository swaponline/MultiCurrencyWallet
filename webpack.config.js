const path = require('path');
const webpack = require('webpack');

const TransferWebpackPlugin = require('transfer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const env = process.env.WEBPACK_MODE;
const isPro = env === 'production';

const config = {
    mode: env || 'development',
    entry: [
        './src/client/app.js',
        'tether',
        'font-awesome/scss/font-awesome.scss',
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'build'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                  'style-loader',
                  'css-loader',
                ]
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: 'style-loader', // inject CSS to page
                }, {
                    loader: 'css-loader',
                }, {
                    loader: 'postcss-loader', // Run post css actions
                    options: {
                        plugins: function () { // post css plugins, can be exported to postcss.config.js
                            return [
                                require('precss'),
                                require('autoprefixer')
                            ];
                        }
                    }
                }, {
                    loader: 'sass-loader' // compiles Sass to CSS
                }],
            },
            {
                test: /\.(png|svg|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'img/',
                            publicPath: 'img/'
                        }
                    }
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/',
                            publicPath: 'fonts/'
                        }
                    }
                ]
            },
            {
                test: /\.html/,
                use: ['underscore-template-loader'],
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'react-hmre', 'env'],
                    cacheDirectory: true,
                }
            },
            // font-awesome
            {
                test: /font-awesome\.config\.js/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'font-awesome-loader' }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    devtool: 'inline-source-map', // any "source-map"-like devtool is possible
    devServer: {
        contentBase: path.join(__dirname, "build"),
        compress: true,
        historyApiFallback: true,
        hot: true,
        port: 9001,
        open: true
    },
    plugins: [
        new UglifyJsPlugin(),
        new HtmlWebpackPlugin({
            title: 'Swap.Design',
            minify: {
                collapseWhitespace: true
            },
            hash: true,
            favicon: './src/img/favicon.ico',
            template: './src/index.html'
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            tether: 'tether',
            Tether: 'tether',
            'window.Tether': 'tether',
            Popper: ['popper.js', 'default'],
            'window.Tether': 'tether',
            Alert: 'exports-loader?Alert!bootstrap/js/build/alert',
            Button: 'exports-loader?Button!bootstrap/js/build/button',
            Carousel: 'exports-loader?Carousel!bootstrap/js/build/carousel',
            Collapse: 'exports-loader?Collapse!bootstrap/js/build/collapse',
            Dropdown: 'exports-loader?Dropdown!bootstrap/js/build/dropdown',
            Modal: 'exports-loader?Modal!bootstrap/js/build/modal',
            Popover: 'exports-loader?Popover!bootstrap/js/build/popover',
            Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/build/scrollspy',
            Tab: 'exports-loader?Tab!bootstrap/js/build/tab',
            Tooltip: "exports-loader?Tooltip!bootstrap/js/build/tooltip",
            Util: 'exports-loader?Util!bootstrap/js/build/util'
        }),
        new ExtractTextPlugin({
            filename: 'app.css',
            disable: false,
            allChunks: true
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
    ]
};

module.exports = config;