import UTXOBlockchain from './UTXOBlockchain'


class NextSwap extends UTXOBlockchain {
  constructor(options) {
    super({
      ...options,
      swapName: `NEXT`,
      account: `next`,
      networks: {
        main: {
          name: `nextmain`,
          params: {
            messagePrefix: '\x18Nextcoin Signed Message:\n',
            bech32: 'bc',
            bip32: {
              public:  0x0488B21E,
              private: 0x0488ADE4,
            },
            pubKeyHash: 75,
            scriptHash: 5,
            wif: 128,
          }
        },
        test: {
          name: `nexttest`,
          params: {
            messagePrefix: '\x18Nextcoin Signed Message:\n',
            bech32: 'bc',
            bip32: {
              public:  0x0488B21E,
              private: 0x0488ADE4,
            },
            pubKeyHash: 75,
            scriptHash: 5,
            wif: 128,
          }
        },
      },
      skipFetchConfidence: true,
      skipCheckCanBeReplaces: true,
      skipLockTime: true,
      skipRecipientPublickKey: true,
      processUnspent: (unspent) => {
        const {
          txid,
          outputIndex: vout,
        } = unspent
        return {
          txid,
          vout,
        }
      }
    })
  }
}

export default NextSwap