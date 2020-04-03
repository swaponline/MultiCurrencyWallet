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
  // publicPath: `${config.publicPath}images/`,
  // I ve commented this line to enable changing public path "on the fly" and makes webpack-require-from plugin works
  // Enabling addition of __webpack_require__.p is in swap.react/client/index.js with variable __webpack_public_path__
}, {
  name: '[name].[ext]',
  outputPath: '/',
  publicPath: `${config.publicPath}/`,
})
