export default {
  btcMnemonic: `${process.env.ENTRY}:btc:mnemonicKey`,
  ethMnemonic: `${process.env.ENTRY}:eth:mnemonicKey`,
  ghostMnemonic: `${process.env.ENTRY}:ghost:mnemonicKey`,
  eth: `${process.env.ENTRY}:eth:privateKey`,
  btc: `${process.env.ENTRY}:btc:privateKey`,
  ghost: `${process.env.ENTRY}:ghost:privateKey`,
  ethOld: `${process.env.ENTRY}:eth:privateKey:old`, // Sweep
  btcOld: `${process.env.ENTRY}:btc:privateKey:old`, // Sweep
  ghostOld: `${process.env.ENTRY}:ghost:privateKey:old`, // Sweep
  twentywords: `${process.env.ENTRY}:twentywords`,
  btcMultisig: `${process.env.ENTRY}:btcMultisig:privateKey`,
  btcMultisigOtherOwnerKey: `${process.env.ENTRY}:btcMultisig:otherOwnerKey`,
  btcMultisigOtherOwnerKeyMnemonic: `${process.env.ENTRY}:btcMultisig:otherOwnerKey:Mnemonic`, // Sweep
  btcMultisigOtherOwnerKeyOld: `${process.env.ENTRY}:btcMultisig:otherOwnerKey:old`, // Sweep
  btcSmsMnemonicKey: `${process.env.ENTRY}:btcSmsMnemonicKey`,
  btcSmsMnemonicKeyGenerated: `${process.env.ENTRY}:btcSmsMnemonicKeyGenerated`,
  btcSmsMnemonicKeyMnemonic: `${process.env.ENTRY}:btcSmsMnemonicKey:Mnemonic`, // Sweep
  btcSmsMnemonicKeyOld: `${process.env.ENTRY}:btcSmsMnemonicKey:old`, // Sweep

  btcPinMnemonicKey: `${process.env.ENTRY}:btcPinMnemonicKey`,
}
