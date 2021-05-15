import { NATIVE, ETH_TOKENS } from './COINS'

export default [
  'ETH-BTC',
  'ETH-GHOST',
  'ETH-NEXT',
  'BNB-BTC',

  ...Object.values(ETH_TOKENS).map(token => `${token}-BTC`),
  // ...Object.values(ETH_TOKENS).map(token => `${token}-USDT`),
]
