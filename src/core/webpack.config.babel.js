import webpack from 'webpack'
import path from 'path'


const resolveSrcPath = (filePath) => path.resolve(__dirname, `./src/${filePath}`)

const globals = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
}

const webpackConfig = {
  mode: 'production',

  node: {
    fs: 'empty'
  },

  entry: {
    'auth': resolveSrcPath('swap.auth/index.js'),
    'orders': resolveSrcPath('swap.orders/index.js'),
    'room': resolveSrcPath('swap.room/index.js'),
    'app': resolveSrcPath('swap.app/index.js'),
    'flows': resolveSrcPath('swap.flows/index.js'),
    'swap': resolveSrcPath('swap.swap/index.js'),
    'swaps': resolveSrcPath('swap.swaps/index.js'),
    'core': resolveSrcPath('index.js'),
  },

  output: {
    path: path.join(__dirname, 'umd'),
    filename: 'swap.[name].js',
    libraryTarget: 'umd',
    library: [ 'swap', '[name]' ],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      }
    ]
  },

  resolve: {
    symlinks: false,
    modules: [
      path.resolve(__dirname, '..', 'node_modules'),
      'node_modules'
    ],
    alias: {
      'swap.auth': resolveSrcPath('swap.auth'),
      'swap.orders': resolveSrcPath('swap.orders'),
      'swap.room': resolveSrcPath('swap.room'),
      'swap.app': resolveSrcPath('swap.app'),
      'swap.flows': resolveSrcPath('swap.flows'),
      'swap.swap': resolveSrcPath('swap.swap'),
      'swap.swaps': resolveSrcPath('swap.swaps'),
    },
  },

  plugins: [
    new webpack.DefinePlugin(globals),
    new webpack.ProvidePlugin({
      'swap.auth': 'swap.auth',
      'swap.orders': 'swap.orders',
      'swap.room': 'swap.room',
      'swap.app': 'swap.app',
      'swap.flows': 'swap.flows',
      'swap.swap': 'swap.swap',
      'swap.swaps': 'swap.swaps',
    }),
  ],
}


export default webpackConfig
