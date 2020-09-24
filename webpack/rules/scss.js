import config from 'app-config'
import autoprefixer from 'autoprefixer'
import { AUTOPREFIXER } from '../util'


const compile         = config.env === 'development' ? 'sourceMap' : 'minimize'
const localIdentName  = config.env === 'development' ? '[local]__[hash:base64:3]' : '[hash:base64:6]'

const isWidgetBuild = config && config.isWidget
const _sccsDefaultConfig = '@import "./scss/config/index.scss";'
const _sccsWidgetConfig = '@import "./scss/config/widget.scss";'
const _sccsConfig = (isWidgetBuild) ? _sccsWidgetConfig : _sccsDefaultConfig

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
          // localIdentName,
          // importLoaders: 1,
          // minimize: config.env === 'production'
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
          data: _sccsConfig,
          includePaths: [
            config.paths.base('node_modules'),
            config.paths.front('shared'),
            config.paths.front('client'),
          ],
        },
      },
    ],
  },
]
