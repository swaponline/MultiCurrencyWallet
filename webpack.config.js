const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const precss = require('precss');

const TransferWebpackPlugin = require('transfer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

// const bootstrap = require('bootstrap');

const env = process.env.WEBPACK_MODE;
const isPro = env === 'production';

let cssLoaders = [{
    loader: 'style-loader', // inject CSS to page
}, {
    loader: 'css-loader',
    query: {
        modules: true,
        localIdentName: '[name]__[local]___[hash:base64:5]'
    }  // translates CSS into CommonJS modules
}, {
    loader: 'postcss-loader', // Run post css actions
    options: {
        plugins: function () { // post css plugins, can be exported to postcss.config.js
            return [
                precss,
                autoprefixer
            ];
        }
    }
}, {
    loader: 'sass-loader' // compiles Sass to CSS
}];

let cssDev = cssLoaders;

let cssPro = ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: cssLoaders,
    publicPath: 'dist'
});

let cssConfig = isPro ? cssPro : cssDev;

const config = {
    mode: env || 'development',
    entry: [
        './src/client/app.js',
        'tether',
        'font-awesome/scss/font-awesome.scss',
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
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
                use: cssConfig
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
            },
            // Bootstrap 4
            {
                test: /bootstrap\/dist\/js\/umd\//, use: 'imports-loader?jQuery=jquery'
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    devtool: 'inline-source-map', // any "source-map"-like devtool is possible
    devServer: {
        contentBase: path.join(__dirname, "dist"),
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
            Alert: 'exports-loader?Alert!bootstrap/js/dist/alert',
            Button: 'exports-loader?Button!bootstrap/js/dist/button',
            Carousel: 'exports-loader?Carousel!bootstrap/js/dist/carousel',
            Collapse: 'exports-loader?Collapse!bootstrap/js/dist/collapse',
            Dropdown: 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
            Modal: 'exports-loader?Modal!bootstrap/js/dist/modal',
            Popover: 'exports-loader?Popover!bootstrap/js/dist/popover',
            Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/dist/scrollspy',
            Tab: 'exports-loader?Tab!bootstrap/js/dist/tab',
            Tooltip: "exports-loader?Tooltip!bootstrap/js/dist/tooltip",
            Util: 'exports-loader?Util!bootstrap/js/dist/util'
        }),
        new ExtractTextPlugin({
            filename: 'app.css',
            disable: !isPro,
            allChunks: true
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
    ]
};

module.exports = config;