import CopyWebpackPlugin from 'copy-webpack-plugin'
import getHostName from './getHostName'
import config from 'app-config'
import fs from 'fs'


const externalConfig = () => {
  let from = `externalConfigs/${config.entry}-default.js`

  const targetHost = getHostName(config.publicPath)

  if (targetHost) {
    if (fs.existsSync(`externalConfigs/${targetHost}.js`)) {
      from = `externalConfigs/${targetHost}.js`
    }
    if (fs.existsSync(`externalConfigs/${config.entry}-${targetHost}.js`)) {
      from = `externalConfigs/${config.entry}-${targetHost}.js`
    }
  }

  console.log('Used external config', from)

  return new CopyWebpackPlugin([
    {
      from,
      to: './erc20tokens.js',
      toType: 'file',
    },
  ])
}

export default externalConfig