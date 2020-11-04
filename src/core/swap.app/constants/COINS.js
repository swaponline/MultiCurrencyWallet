export const COIN_TYPE = Object.freeze({
  NATIVE: 'NATIVE',
  ETH_TOKEN: 'ETH_TOKEN',
})

export const COIN_MODEL = Object.freeze({
  UTXO: 'UTXO', // Unspent Transaction Outputs model
  AB: 'AB' // Account/Balance model
})

export const COIN_DATA = {
  'BTC': {
    ticker: 'BTC',
    name: 'Bitcoin',
    type: COIN_TYPE.NATIVE,
    model: COIN_MODEL.UTXO,
    precision: 8,
  },
  'ETH': {
    ticker: 'ETH',
    name: 'Ethereum',
    type: COIN_TYPE.NATIVE,
    model: COIN_MODEL.AB,
    precision: 18,
  },
  'USDT': {
    ticker: 'USDT',
    name: 'Tether',
    type: COIN_TYPE.ETH_TOKEN,
    model: COIN_MODEL.AB,
    precision: 18,
  },
  'EURS': {
    ticker: 'EURS',
    name: 'STASIS EURO',
    type: COIN_TYPE.ETH_TOKEN,
    model: COIN_MODEL.AB,
    precision: 18,
  },
  'GHOST': {
    ticker: 'GHOST',
    name: 'Ghost',
    type: COIN_TYPE.NATIVE,
    model: COIN_MODEL.UTXO,
    precision: 8,
  },
  'NEXT': {
    ticker: 'NEXT',
    name: 'NEXT.coin',
    type: COIN_TYPE.NATIVE,
    model: COIN_MODEL.UTXO,
    precision: 8,
  },
  'SWAP': {
    ticker: 'SWAP',
    name: 'SWAP',
    type: COIN_TYPE.ETH_TOKEN,
    model: COIN_MODEL.AB,
    precision: 18,
  },
  'SUM': {
    ticker: 'SUM',
    name: 'Sumcoin',
    type: COIN_TYPE.NATIVE,
    model: COIN_MODEL.UTXO,
    precision: 8,
  },
  'SNM': {
    ticker: 'SONM',
    name: 'SWAP',
    type: COIN_TYPE.ETH_TOKEN,
    model: COIN_MODEL.AB,
    precision: 18,
  },
}


// todo: move to COIN_DATA

export const NATIVE = {
  btc: 'BTC',
  eth: 'ETH',
  ghost: 'GHOST',
  next: 'NEXT',
  sum: 'SUM',
}

export const ETH_TOKENS = {
  usdt: 'USDT',
  eurs: 'EURS',
  swap: 'SWAP',
  pay: 'PAY',

  // needs for the front
  proxima: 'PROXIMA',
  snm: 'SNM',
  noxon: 'NOXON',
  pbl: 'PBL',
  xsat: 'XSAT',
  hdp: 'HDP',
  scro: 'SCRO',
  xeur: 'XEUR',

}

export default {
  ...NATIVE,
  ...ETH_TOKENS,
  ...COIN_DATA,
}
