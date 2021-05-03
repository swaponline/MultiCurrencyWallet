import config from 'helpers/externalConfig'


const decimals = {
  btc: 8,
  bnb: 18,
  eth: 18,
  bnb: 8,
  ghost: 8,
  next: 8,
}

Object.keys(config.erc20)
  .forEach(key => {
    decimals[key] = config.erc20[key].decimals
  })

export default {
  ...decimals,
}
