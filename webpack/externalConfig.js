import CopyWebpackPlugin from 'copy-webpack-plugin'
import getHostName from './getHostName'
import config from 'app-config'
import fs from 'fs'


const externalConfig = () => {
  let from = `src/front/externalConfigs/${config.entry}-default.js`
  const targetHost = getHostName(config.publicPath)

  if (targetHost) {
    if (fs.existsSync(`src/front/externalConfigs/${targetHost}.js`)) {
      from = `src/front/externalConfigs/${targetHost}.js`
    }
    if (fs.existsSync(`src/front/externalConfigs/${config.entry}-${targetHost}.js`)) {
      from = `src/front/externalConfigs/${config.entry}-${targetHost}.js`
    }
  }

  console.log(`TargetHost (${targetHost})`)
  console.log(`Config: used external (${from})`)

  return [
    new CopyWebpackPlugin({
      patterns: [
        {
          from,
          to: './erc20tokens.js',
          toType: 'file',
        },
        {
          from: 'src/front/client/variables.css',
          to: './variables.css',
          toType: 'file',
        },
        {
          from: './src/front/client/customStyles.css',
          to: './customStyles.css',
          toType: 'file',
        },
      ],
    }),
  ]
}

export default externalConfig