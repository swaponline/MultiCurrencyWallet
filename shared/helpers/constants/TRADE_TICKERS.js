import config from 'app-config'


const swap = [
  'BTC-ETH',
  'ETH-BTC',

  'LTC-ETH',
  'ETH-LTC',

  'BTC-EOS',
  'EOS-BTC',
]

Object.keys(config.erc20)
  .forEach(key => {
    swap.push(`${key.toUpperCase()}-BTC`)
    swap.push(`BTC-${key.toUpperCase()}`)

    swap.push(`${key.toUpperCase()}-USDT`)
    swap.push(`USDT-${key.toUpperCase()}`)
  })

export default [
  swap,
]
