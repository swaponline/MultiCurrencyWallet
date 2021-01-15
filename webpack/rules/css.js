export default [
  {
    test: /\.css$/,
    use: [
      'style-loader',
      'cache-loader',
      'css-loader',
    ],
  },
]
