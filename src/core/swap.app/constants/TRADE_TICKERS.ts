import { NATIVE, ETH_TOKENS, BNB_TOKENS } from './COINS'

export default [
  'ETH-BTC',
  'ETH-GHOST',
  'ETH-NEXT',
  'BNB-BTC',

  ...Object.values(ETH_TOKENS).map(token => `{ETH}${token}-BTC`),
  ...Object.values(BNB_TOKENS).map(token => `{BNB}${token}-BTC`),
  // ...Object.values(ETH_TOKENS).map(token => `${token}-USDT`),
]
