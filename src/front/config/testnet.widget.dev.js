import baseConfig from './default'
import config from './testnet'
import moment from 'moment-with-locales-es6'


const newERC20 = config.erc20
const erc20Token = (process.argv.length >= 5) ? process.argv[3] : '{#WIDGETTOKENCODE#}'

if (process.argv.length>5) {
  newERC20[process.argv[3]] = {
    address: process.argv[2],
    decimals: Number.parseInt(process.argv[4], 10),
    fullName: process.argv[5].split('_').join(' '),
    canSwap: true,
  }
} else {
  newERC20['{#WIDGETTOKENCODE#}'] = {
    address: '{#WIDGETTOKENCONTRACT#}',
    decimals: 12071998,
    fullName: '{#WIDGETTOKENTITLE#}',
    canSwap: true,
  }
}

export default {
  env: 'development',
  entry: 'testnet',
  local: 'local',

  base: `http://localhost:${baseConfig.http.port}/`,
  publicPath: `http://localhost:${baseConfig.http.port}${baseConfig.publicPath}`,

  time: moment(Date.now()).format('LLLL'),

  isWidget: true,
  isFullBuild: (process.argv.length>=5 && process.argv[6] === 'full') ? true : false,
  ...config,
  erc20: newERC20,
  erc20token: erc20Token,
}
