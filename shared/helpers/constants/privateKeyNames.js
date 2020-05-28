export default {
  btcMnemonic: `${process.env.ENTRY}:btc:mnemonicKey`,
  sumMnemonic: `${process.env.ENTRY}:sum:mnemonicKey`,
  ethMnemonic: `${process.env.ENTRY}:eth:mnemonicKey`,
  eth: `${process.env.ENTRY}:eth:privateKey`,
  btc: `${process.env.ENTRY}:btc:privateKey`,
  ethOld: `${process.env.ENTRY}:eth:privateKey:old`, // Sweep
  btcOld: `${process.env.ENTRY}:btc:privateKey:old`, // Sweep
  sumOld: `${process.env.ENTRY}:sum:privateKey:old`, // Sweep
  twentywords: `${process.env.ENTRY}:twentywords`,
  btcMultisig: `${process.env.ENTRY}:btcMultisig:privateKey`,
  btcMultisigOtherOwnerKey: `${process.env.ENTRY}:btcMultisig:otherOwnerKey`,
  btcMultisigOtherOwnerKeyMnemonic: `${process.env.ENTRY}:btcMultisig:otherOwnerKey:Mnemonic`, // Sweep
  btcMultisigOtherOwnerKeyOld: `${process.env.ENTRY}:btcMultisig:otherOwnerKey:old`, // Sweep
  btcSmsMnemonicKey: `${process.env.ENTRY}:btcSmsMnemonicKey`,
  btcSmsMnemonicKeyGenerated: `${process.env.ENTRY}:btcSmsMnemonicKeyGenerated`,
  btcSmsMnemonicKeyMnemonic: `${process.env.ENTRY}:btcSmsMnemonicKey:Mnemonic`, // Sweep
  btcSmsMnemonicKeyOld: `${process.env.ENTRY}:btcSmsMnemonicKey:old`, // Sweep
  //Sumcoin
  sumMultisig: `${process.env.ENTRY}:sumMultisig:privateKey`,
  sumMultisigOtherOwnerKey: `${process.env.ENTRY}:sumMultisig:otherOwnerKey`,
  sumMultisigOtherOwnerKeyMnemonic: `${process.env.ENTRY}:sumMultisig:otherOwnerKey:Mnemonic`, // Sweep
  sumMultisigOtherOwnerKeyOld: `${process.env.ENTRY}:sumMultisig:otherOwnerKey:old`, // Sweep
  sumSmsMnemonicKey: `${process.env.ENTRY}:sumSmsMnemonicKey`,
  sumSmsMnemonicKeyGenerated: `${process.env.ENTRY}:sumSmsMnemonicKeyGenerated`,
  sumSmsMnemonicKeyMnemonic: `${process.env.ENTRY}:sumSmsMnemonicKey:Mnemonic`, // Sweep
  sumSmsMnemonicKeyOld: `${process.env.ENTRY}:sumSmsMnemonicKey:old`, // Sweep

}
