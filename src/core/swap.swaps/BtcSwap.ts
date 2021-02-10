import UTXOBlockchain from './UTXOBlockchain'



class BtcSwap extends UTXOBlockchain {
  constructor(options) {
    super({
      ...options,
      account: `btc`,
      networks: {
        main: {
          name: `bitcoin`,
        },
        test: {
          name: `testnet`,
        },
      },
    })
  }
}


export default BtcSwap