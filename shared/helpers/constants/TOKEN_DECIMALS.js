import config from 'helpers/externalConfig'


const decimals = {
  btc: 8,
  bch: 8,
  eth: 18,
  ltc: 8,

}

Object.keys(config.erc20)
  .forEach(key => {
    decimals[key] = config.erc20[key].decimals
  })

export default {
  ...decimals,
}
