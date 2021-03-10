import { PAIR_ASK, PAIR_BID } from '../trade'

const print = (bas) => bas
  .map(({ ticker, type, price, amount }, index) =>
    `${index+1}: ${ticker} ${type == PAIR_BID ? 'buy' : 'sell'} at ${price} a: ${amount}`)
  .join('\n')

const parse = (str) => {
  try {
    return JSON.parse(str)
  } catch (err) {
    return str
  }
}

export {
  parse,
  print,
}
