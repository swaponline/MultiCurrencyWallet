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
import config from 'app-config'


export default [
  {
    test: /\.(js|jsx)$/,
    exclude: {
      test: /node_modules/,
      not: [
        /libp2p/,
        /ipld/,
        /it-to-stream/,
        /async-iterator-all/,
        /ipfs/,
        /pull-mplex/,
        /pull-stream-to-async-iterator/,
        /ipfs-unixfs-exporter/,
        /async-iterator-last/,
        /async-iterator-first/,
        /async-iterator-batch/,
      ],
    },
    use: {
      loader: 'babel-loader',
    },
  },
]