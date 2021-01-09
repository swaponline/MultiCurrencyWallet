export default [
  {
    test: /\.tsx?$/, // ts, tsx
    use: 'ts-loader',
    exclude: /node_modules/,
    options: { appendTsSuffixTo: [/\.s?css$/] }
  },
]
