const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: [
        './src/client/app.js',
    ],
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
                            name: '[path][name].[ext]',
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
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    plugins: [
        new CleanWebpackPlugin(['build']),
        new HtmlWebpackPlugin({
            title: 'Swap.Design',
            minify: {
                collapseWhitespace: true
            },
            hash: true,
            favicon: path.resolve(__dirname, 'src/client/img/favicon.ico'),
            template: './src/client/index.html'
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
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
    ]
};