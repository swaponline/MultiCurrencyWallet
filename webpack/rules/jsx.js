export default [
  {
    test: /\.(js|mjs|jsx|ts|tsx)$/,
    exclude: /(node_modules|bower_components)/,
    use: [
      {
        loader: 'cache-loader',
      },
      {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-proposal-object-rest-spread'],
          cacheDirectory: true,
        }
      },
    ],
  },
  {
    test: /\.js$/,
    enforce: 'pre',
    use: ['source-map-loader'],
  },
]
