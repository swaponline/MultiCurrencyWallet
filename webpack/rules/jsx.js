// export default [
//   {
//     test: /\.(js|jsx)$/,
//     exclude: /(node_modules|bower_components)/,
//     use: {
//       loader: 'babel-loader',
//       options: {
//         presets: ['@babel/preset-env'],
//         plugins: ['@babel/plugin-transform-runtime'],
//       },
//     },
//   },
// ]
export default [
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
    },
  },
]