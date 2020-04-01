import config from 'app-config'


const resolveRule = (options, optionsVideo) => ([
  {
    test: /images.*\.(png|ico|jpg|jpeg|gif|svg|mp4)(\?.*)?$/,
    loader: 'file-loader',
    options,
  },
  {
    test: /\.mp4$/,
    loader: 'file-loader',
    options: optionsVideo,
  },
])


export const development = resolveRule({
  name: 'images/[name]_[hash:6].[ext]',
},
{
  name: '[name]_[hash:0].[ext]',
})

export const production = resolveRule({
  name: '[name]_[hash:6].[ext]',
  outputPath: 'images/',
  publicPath: `${config.publicPath}images/`,
}, {
  name: '[name].[ext]',
  outputPath: '/',
  publicPath: `${config.publicPath}/`,
})
