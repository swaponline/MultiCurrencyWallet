const bip44 = {
  createDerivePath(network) {

    /*
    In fact, not every testnet of coins has an index of 1
    Therefore, specify the testnet coin index in the settings
    */

    const coinIndex = network.settings.bip44.coinIndex
    const addressIndex = 0

    const path = `m/44'/${coinIndex}'/0'/0/${addressIndex}`
    return path;
  }
}

export default bip44