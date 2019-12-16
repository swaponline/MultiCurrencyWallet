export default {
  eth: `${process.env.ENTRY}:eth:privateKey`,
  btc: `${process.env.ENTRY}:btc:privateKey`,
  btcMultisig: `${process.env.ENTRY}:btcMultisig:privateKey`,
  btcMultisigOtherOwnerKey: `${process.env.ENTRY}:btcMultisig:otherOwnerKey`,
  ethKeychainPublicKey: `${process.env.ENTRY}:eth:keychainPublicKey`,
  btcKeychainPublicKey: `${process.env.ENTRY}:btc:keychainPublicKey`,
  btcMultisigKeychainPublicKey: `${process.env.ENTRY}:btcMultisig:keychainPublicKey`,
  // xlm: `${process.env.ENTRY}:xlm:privateKey`,
  bch: `${process.env.ENTRY}:bch:privateKey`,
  ltc: `${process.env.ENTRY}:ltc:privateKey`,
  qtum: `${process.env.ENTRY}:qtum:privateKey`,
}
