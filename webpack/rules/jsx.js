export default [
  {
    test: /\.(js|mjs|jsx|ts|tsx)$/,
    exclude: /(node_modules|bower_components)/,
    use: [
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
    use: [
      {
        loader: 'source-map-loader',
        options: {
          filterSourceMappingUrl: (url, resourcePath) => {
            if (
              /.*\/node_modules\/.*/.test(resourcePath) // Unix
              ||
              /.*\\node_modules\\.*/.test(resourcePath) // Windows
            ) {
              return false
            }
            return true
          }
        }
      }
    ],
  },
]
