import config from 'app-config'
import UTXOToEthToken from '../UTXOSwap/UTXOToEthToken'
import EthTokenToUTXO from '../UTXOSwap/EthTokenToUTXO'
import UTXOToEthLike from '../UTXOSwap/UTXOToEthLike'
import EthLikeToUTXO from '../UTXOSwap/EthLikeToUTXO'


const UTXO_to_ERC20 = (coinName) => {
  class _UTXO_to_ERC20 extends UTXOToEthToken {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `ETH`,
          etherscanLink: config.link.etherscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _UTXO_to_ERC20
}

const UTXO_to_BEP20 = (coinName) => {
  class _UTXO_to_BEP20 extends UTXOToEthToken {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `BNB`,
          etherscanLink: config.link.bscscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _UTXO_to_BEP20
}
const UTXO_to_ERC20MATIC = (coinName) => {
  class _UTXO_to_ERC20MATIC extends UTXOToEthToken {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `MATIC`,
          etherscanLink: config.link.maticscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _UTXO_to_ERC20MATIC
}

const ERC20_to_UTXO = (coinName) => {
  class _ERC20_to_UTXO extends EthTokenToUTXO {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `ETH`,
          etherscanLink: config.link.etherscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _ERC20_to_UTXO
}

const BEP20_to_UTXO = (coinName) => {
  class _BEP20_to_UTXO extends EthTokenToUTXO {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `BNB`,
          etherscanLink: config.link.bscscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _BEP20_to_UTXO
}

const ERC20MATIC_to_UTXO = (coinName) => {
  class _ERC20MATIC_to_UTXO extends EthTokenToUTXO {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `MATIC`,
          etherscanLink: config.link.maticscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _ERC20MATIC_to_UTXO
}

const UTXO_to_ETH = (coinName) => {
  class _UTXO_to_ETH extends UTXOToEthLike {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `ETH`,
          etherscanLink: config.link.etherscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _UTXO_to_ETH
}

const UTXO_to_BNB = (coinName) => {
  class _UTXO_to_BNB extends UTXOToEthLike {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `BNB`,
          etherscanLink: config.link.bscscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _UTXO_to_BNB
}

const UTXO_to_MATIC = (coinName) => {
  class _UTXO_to_MATIC extends UTXOToEthLike {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `MATIC`,
          etherscanLink: config.link.maticscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _UTXO_to_MATIC
}

const UTXO_to_ARBITRUM = (coinName) => {
  class _UTXO_to_ARBITRUM extends UTXOToEthLike {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `ARBITRUM`,
          etherscanLink: config.link.arbitrum,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _UTXO_to_ARBITRUM
}

const ETH_to_UTXO = (coinName) => {
  class _ETH_to_UTXO extends EthLikeToUTXO {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `ETH`,
          etherscanLink: config.link.etherscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _ETH_to_UTXO
}

const BNB_to_UTXO = (coinName) => {
  class _BNB_to_UTXO extends EthLikeToUTXO {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `BNB`,
          etherscanLink: config.link.bscscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _BNB_to_UTXO
}

const MATIC_to_UTXO = (coinName) => {
  class _MATIC_to_UTXO extends EthLikeToUTXO {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `MATIC`,
          etherscanLink: config.link.maticscan,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _MATIC_to_UTXO
}

const ARBITRUM_to_UTXO = (coinName) => {
  class _ARBITRUM_to_UTXO extends EthLikeToUTXO {
    constructor(props) {
      super({
        ...props,
        fields: {
          currencyName: coinName,
          ethLikeCoin: `ARBITRUM`,
          etherscanLink: config.link.arbitrum,
          ...config.swapConfig[coinName],
        },
      })
    }
  }
  return _ARBITRUM_to_UTXO
}

export {
  UTXO_to_ERC20,
  UTXO_to_BEP20,
  UTXO_to_ERC20MATIC,
  ERC20_to_UTXO,
  BEP20_to_UTXO,
  ERC20MATIC_to_UTXO,

  UTXO_to_ETH,
  UTXO_to_BNB,
  UTXO_to_MATIC,
  UTXO_to_ARBITRUM,
  ETH_to_UTXO,
  BNB_to_UTXO,
  MATIC_to_UTXO,
  ARBITRUM_to_UTXO,
}