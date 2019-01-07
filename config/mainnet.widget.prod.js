import baseConfig from './default'
import config from './mainnet'


const newERC20 = config.erc20
newERC20[process.argv[3]] = {
  address: process.argv[2],
  decimals: Number.parseInt(process.argv[4], 10),
  fullName: process.argv[5].split('_').join(' '),
}

export default {
  env: 'production',
  entry: 'mainnet',
  local: 'online',
  dir: 'mainnet-widget',

  base: './',
  publicPath: `.${baseConfig.publicPath}`,

  isWidget: true,
  ...config,
  erc20: newERC20,
  erc20token: process.argv[3],
}
