import config from 'app-config'
import BtcLikeToEthToken from '../BtcLikeSwap/BtcLikeToEthToken'
import EthTokenToBtcLike from '../BtcLikeSwap/EthTokenToBtcLike'
import BtcLikeToEth from '../BtcLikeSwap/BtcLikeToEth'
import EthToBtcLike from '../BtcLikeSwap/EthToBtcLike'


const UTXO_to_ERC20 = (coinName) => {
  class _UTXO_to_ERC20 extends BtcLikeToEthToken {
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
  class _ERC20_to_UTXO extends EthTokenToBtcLike {
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
  class _UTXO_to_ETH extends BtcLikeToEth {
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
  class _ETH_to_UTXO extends EthToBtcLike {
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