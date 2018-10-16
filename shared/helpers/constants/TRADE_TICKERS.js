import config from 'app-config'


const swap = [
  'ETH-BTC',
  'ETH-LTC',
  'BTC-LTC',
  'EOS-BTC',
]

Object.keys(config.erc20)
  .forEach(key => {
    swap.push(`${key.toUpperCase()}-BTC`)

    swap.push(`${key.toUpperCase()}-USDT`)
  })

export default [
  ...swap,
]
