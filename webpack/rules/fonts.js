import config from 'app-config'


const resolveRule = (options) => ([
  {
    test: /fonts.*\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'url-loader',
    options: {
      ...options,
      limit: 10000,
      mimetype: 'application/font-woff',
    },
  },
  {
    test: /fonts.*\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'file-loader',
    options: {
      ...options,
    },
  },
])


export const development = resolveRule({
  name: 'fonts/[name].[ext]',
})

export const production = resolveRule({
  name: '[name].[ext]',
  outputPath: 'fonts/',
  publicPath: `${config.publicPath}fonts/`,
})
