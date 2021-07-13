import CopyWebpackPlugin from 'copy-webpack-plugin'

const ownBuffer = () => {
  const from = 'src/front/client/ownBuffer.js'
  const to = './ownBuffer.js'

  return new CopyWebpackPlugin({
    patterns: [
      {
        from,
        to,
        toType: 'file',
      },
    ],
  })
}

export default ownBuffer