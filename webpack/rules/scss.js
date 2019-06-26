import config from 'app-config'
import autoprefixer from 'autoprefixer'
import { AUTOPREFIXER } from '../util'


const compile         = config.env === 'development' ? 'sourceMap' : 'minimize'
const localIdentName  = config.env === 'development' ? '[local]__[hash:base64:3]' : '[hash:base64:6]'

export default [
  {
    test: /\.scss$/,
    use: [
      {
        loader: 'style-loader',
        options: { sourceMap: true },
      },
      {
        loader: 'css-loader',
        options: {
          // [compile]: true,
          sourceMap: true,
          modules: true,
          localIdentName,
          // importLoaders: 1,
          minimize: config.env === 'production'
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
          plugins: () => [
            autoprefixer(AUTOPREFIXER),
          ],
        },
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          data: '@import "./scss/config/index.scss";',
          includePaths: [
            config.paths.base('node_modules'),
            config.paths.base('shared'),
            config.paths.base('client'),
          ],
        },
      },
    ],
  },
]
