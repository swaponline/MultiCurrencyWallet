export default Object.freeze({
  DUST_SAT: 546,
  TX_SIZE: 15,

  // about address types
  // https://medium.com/coinmonks/on-bitcoin-transaction-sizes-part-2-9445373d17f4

  // P2PKH: "Pay To Public Key Hash"
  P2PKH_IN_SIZE: 148,
  P2PKH_OUT_SIZE: 34,

  // P2SH: "Pay to script hash"
  // P2SH_IN_SIZE: has a variable size (depends on the script)
  P2SH_OUT_SIZE: 32,
  P2SH_IN_SIZE: 320, // medium value of swap script input

  // P2WSH: "Pay to Witness Script Hash"
  P2WSH_IN_SIZE: 41,
  P2WSH_OUT_SIZE: 43,

  // P2WPKH: "Pay To Witness Public Key Hash"
  P2WPKH_IN_SIZE: 108, // 67.75 | 41 ?
  P2WPKH_OUT_SIZE: 31,

  P2SH_P2WPKH_IN_SIZE: 108, // 91 | 64 ?

  MULTISIG_P2SH_IN_SIZE: 49,
  MULTISIG_P2WSH_IN_SIZE: 6,

  // Multi-Signature - Pay To Script Hash - Pay to Witness Script Hash
  MULTISIG_P2SH_P2WSH_IN_SIZE: 6, // 76 ?
})