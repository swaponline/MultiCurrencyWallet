import config from 'app-config'
import UTXOToEthToken from '../UTXOSwap/UTXOToEthToken'
import EthTokenToUTXO from '../UTXOSwap/EthTokenToUTXO'
import UTXOToEth from '../UTXOSwap/UTXOToEth'
import EthToUTXO from '../UTXOSwap/EthToUTXO'


const UTXO_to_ERC20 = (coinName) => {
  class _UTXO_to_ERC20 extends UTXOToEthToken {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _UTXO_to_ERC20
}

const ERC20_to_UTXO = (coinName) => {
  class _ERC20_to_UTXO extends EthTokenToUTXO {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _ERC20_to_UTXO
}

const UTXO_to_ETH = (coinName) => {
  class _UTXO_to_ETH extends UTXOToEth {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _UTXO_to_ETH
}

const ETH_to_UTXO = (coinName) => {
  class _ETH_to_UTXO extends EthToUTXO {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _ETH_to_UTXO
}


export {
  UTXO_to_ERC20,
  ERC20_to_UTXO,
  UTXO_to_ETH,
  ETH_to_UTXO,
}