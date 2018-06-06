import config from 'app-config'


const resolveRule = (options) => ([
  {
    test: /images.*\.(png|ico|jpg|jpeg|gif|svg|mp4)(\?.*)?$/,
    loader: 'file-loader',
    options,
  },
  {
    test: /\.mp4$/,
    loader: 'url-loader?limit=8192'
  },
])


export const development = resolveRule({
  name: 'images/[name]_[hash:6].[ext]',
})

export const production = resolveRule({
  name: '[name]_[hash:6].[ext]',
  outputPath: 'images/',
  publicPath: `${config.publicPath}images/`,
})
