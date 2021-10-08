import { NATIVE, ETH_TOKENS, BNB_TOKENS, MATIC_TOKENS } from './COINS'

export default [
  'ETH-BTC',
  'ETH-GHOST',
  'ETH-NEXT',
  'BNB-BTC',
  'ARBETH-BTC',

  ...Object.values(ETH_TOKENS).map(token => `{ETH}${token}-BTC`),
  ...Object.values(BNB_TOKENS).map(token => `{BNB}${token}-BTC`),
  ...Object.values(MATIC_TOKENS).map(token => `{MATIC}${token}-BTC`),
  // ...Object.values(ETH_TOKENS).map(token => `${token}-USDT`),
]
