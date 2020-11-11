export default [
  {
    test: /\.css$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'cache-loader',
      },
      {
        loader: 'css-loader',
      },
    ],
  },
]
