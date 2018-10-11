import config from 'app-config'


const decimals = {
  BTC: 8,
  ETH: 18,
  LTC: 8,

}

Object.keys(config.erc20)
  .forEach(key => {
    decimals[key] = config.erc20[key].decimals
  })

export default {
  decimals,
}

