import config from 'app-config'
import autoprefixer from 'autoprefixer'


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
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          modules: true,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
          postcssOptions: {
            hideNothingWarning: true,
            plugins: () => [
              autoprefixer([
                'Android >= 4',
                'iOS >= 8',
                'Chrome >= 30',
                'Firefox >= 30',
                'Explorer >= 10',
                'Safari >= 8',
                'Opera >= 20',
              ]),
              require('postcss-import')
            ],
          }
        },
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          additionalData: _sccsConfig,
          sassOptions:{
            includePaths: [
              config.paths.base('node_modules'),
              config.paths.front('shared'),
              config.paths.front('client'),
            ]
          }
        },
      },
    ],
  },
]
