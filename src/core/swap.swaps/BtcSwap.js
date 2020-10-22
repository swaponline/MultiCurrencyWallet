import BtcLikeSwap from './integration/BtcLikeSwap'



class BtcSwap extends BtcLikeSwap {
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