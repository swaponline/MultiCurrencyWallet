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
    test: /\.(js|mjs|jsx|ts|tsx)$/,
    exclude: {
      test: [
        /node_modules/,
      ],
      not: [
        /libp2p/,
        /ipld/,

        /ipfs/,
        /pull-mplex/,
        /pull-stream-to-async-iterator/,
        /ipfs-unixfs-exporter/,
        /interface-datastore/,
        /multistream-select/,
        /p-any/,

        /stream-to-it/,

        /indent-string/,

        /it-buffer/,
        /it-protocol-buffers/,
        /it-length-prefixed/,
        /it-to-stream/,
        /it-drain/,
        /it-reader/,
        /it-handshake/,
        /it-all/,
        /it-ws/,
        /it-length/,
        /abortable-iterator/,
        /async-iterator-all/,
        /async-iterator-last/,
        /async-iterator-first/,
        /async-iterator-batch/,
        /it-parallel-batch/,
        /it-last/,
        /it-first/,
        /it-map/,
        /it-batch/,

        /aggregate-error/,
        /streaming-iterables/,
        /datastore-level/,
        /datastore-core/,
      ],
    },
    use: {
      loader: 'babel-loader',
    },
  },
]
