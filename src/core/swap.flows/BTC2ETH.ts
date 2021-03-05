import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { AtomicAB2UTXO } from 'swap.swap'
import { BigNumber } from 'bignumber.js'
import { EthSwap, BtcSwap } from 'swap.swaps'


class BTC2ETH extends AtomicAB2UTXO {

  _flowName: string
  ethSwap: EthSwap
  btcSwap: BtcSwap
  state: any

  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }

  static getFromName() {
    return constants.COINS.btc
  }

  static getToName() {
    return constants.COINS.eth
  }

  constructor(swap) {
    super(swap)
    this.utxoCoin = `btc`
    this._flowName = BTC2ETH.getName()

    this.isUTXOSide = true
    this.isTakerMakerModel = true
    this.setupTakerMakerEvents()
    this.stepNumbers = this.getStepNumbers()

    this.ethSwap = swap.ownerSwap
    this.btcSwap = swap.participantSwap

    this.abBlockchain = this.ethSwap
    this.utxoBlockchain = this.btcSwap

    if (!this.ethSwap) {
      throw new Error('BTC2ETH: "ethSwap" of type object required')
    }
    if (!this.btcSwap) {
      throw new Error('BTC2ETH: "btcSwap" of type object required')
    }

    this.state = {
      step: 0,

      isStoppedSwap: false,

      signTransactionHash: null,
      isSignFetching: false,
      isParticipantSigned: false,

      ethSwapCreationTransactionHash: null,

      secretHash: null,

      isBalanceFetching: false,
      isBalanceEnough: true,
      balance: null,

      isEthContractFunded: false,

      utxoSwapWithdrawTransactionHash: null,
      ethSwapWithdrawTransactionHash: null,

      canCreateEthTransaction: true,
      isEthWithdrawn: false,

      refundTransactionHash: null,
      isRefunded: false,

      withdrawFee: null,
      refundTxHex: null,
      isFinished: false,
      isSwapExist: false,

      requireWithdrawFee: false,

      utxoFundError: null,
    }

    this._persistState()
    super._persistSteps()
  }

  _persistState() {
    super._persistState()
  }

  _getSteps() {
    const flow = this

console.log('>>>> getSteps', this.isTaker())
    if (this.isTaker()) {
      return [

        // 1. Signs
        async () => {
          this.signUTXOSide()
        },

        // 2. Create secret, secret hash and BTC script
        () => {
          this.submitSecret()
        },

        // 3. Check balance
        () => {
          this.syncBalance()
        },

        // 4. Create BTC Script, fund, notify participant
        async () => {
          this.btcSwap.fundSwapScript({
            flow,
          })
        },

        // 5. Wait participant creates ETH Contract
        async () => {
          
          await flow.ethSwap.waitABContract({
            flow,
            utxoCoin: `btc`,
          })
        },

        // 6. Withdraw
        async () => {
          await flow.ethSwap.withdrawFromABContract({ flow })
        },

        // 7. Finish
        () => {
          flow.swap.room.once('swap finished', ({utxoSwapWithdrawTransactionHash}) => {
            flow.setState({
              utxoSwapWithdrawTransactionHash,
            })
          })

          flow.swap.room.sendMessage({
            event: 'request swap finished',
          })

          flow.finishStep({
            isFinished: true,
          }, 'finish')
        },

        // 8. Finished!
        () => {}
      ]
    } else {
      return [
        // 1 - `sign` Signs
        async () => {
          console.log('>>>>>> MAKER BTC2ETH - Sign')
          this.swap.processMetamask()
          this.sign()
        },

        // 2 - `sync-balance` - syncBalance
        async () => {
          console.log('>>>>>> MAKER BTC2ETH - Sync balance')
          this.syncBalance()
        },

        // 3 - `wait-lock-eth` - wait taker create AB - обмен хешем
        async () => {
          console.log('>>>>>> MAKER BTC2ETH - Wait-lock-eth')
          
          this.swap.room.once('create eth contract', async ({
            ethSwapCreationTransactionHash,
          }) => {
            console.log('>>>>> MAKER BTC2ETH - ETH LOCKED - check')
            if (this.ethSwap.isContractFunded(this)) {
              console.log('>>>>> MAKER BTC2ETH - ETH LOCKED - CHECK DESTINATION Address')
              const destAddressIsOk = await this.ethSwap.checkTargetAddress({ flow })
              if (destAddressIsOk) {
                console.log('>>>>>> MAKER BTC2ETH - ETH IS LOCKED')

                this.finishStep({
                  ethSwapCreationTransactionHash,
                  isEthContractFunded: true,
                }, 'wait-lock-eth`')
              } else {
                console.warn('Destination address not valid. Stop swap now!')
              }
            } else {
              console.warn('Contract not funded', ethSwapCreationTransactionHash)
            }
          })
        },

        // 4 - `lock-utxo` - create UTXO
        async () => {
          // Repeat until 
          await util.helpers.repeatAsyncUntilResult(async () => {
            console.log('>>>>>>> MAKER BTC2ETH - LOCK-UTXO')
            const {
              secretHash,
              utxoScriptValues
            } = flow.state
            if (secretHash && utxoScriptValues) {
              console.log('>>>>> MAKER BTC2ETH - FUND SCRIPT')
              await this.btcSwap.fundSwapScript({
                flow,
              })
              return true
            } else {
              console.log('>>>>> MAKER BTC2ETH - No script values - request its')
              flow.swap.room.sendMessage({
                event: 'request utxo script',
              })
              return false
            }
          })
        },

        // 5 - `wait-withdraw-utxo` - wait withdraw UTXO - fetch secret from TX - getSecretFromTxhash
        async () => {
          await util.helpers.repeatAsyncUntilResult(async () => {
            console.log('>>>> MAKER - BTC2ETH - 5 - wait-withdraw-utxo')
            // check withdraw
            const {
              utxoScriptValues,
            } = this.state
            const { scriptAddress } = this.utxoBlockchain.createScript(utxoScriptValues)
            console.log('>>>> scriptAddress', scriptAddress)
            const utxoWithdrawData = await this.btcSwap.checkWithdraw(scriptAddress)
            console.log('>>>>> MAKER - BTC2ETH - WITHDRAW UTXO DATA', utxoWithdrawData)
            if (utxoWithdrawData) {
              const {
                txid: utxoSwapWithdrawTransactionHash,
              } = utxoWithdrawData
              const secret = await this.btcSwap.getSecretFromTxhash(utxoSwapWithdrawTransactionHash)
              
              console.log('>>>>> secret', secret)
              if (secret) {
                this.finishStep({
                  secret,
                  utxoSwapWithdrawTransactionHash,
                }, 'wait-withdraw-utxo')
              }
              return true
            } else {
              return false
            }
          })
        },

        // 6 - `withdraw-eth` - withdraw from AB
        async () => {
          console.log('>>>>> MAKER - BTC2ETH - WITHDRAW FROM AB')
          await flow.ethSwap.withdrawFromABContract({ flow })
        },

        // 7 - `finish`
        async () => {
          // @to-do - txids room events
          flow.finishStep({
            isFinished: true,
          }, 'finish')
        },

        // 8 - `end`
        async () => {
          
        },
      ]
    }
  }

  getBTCScriptAddress() {
    const { scriptAddress } = this.state
    return scriptAddress;
  }

  async skipSyncBalance() {
    this.finishStep({}, { step: 'sync-balance' })
  }

  getRefundTxHex = () => {
    this.btcSwap.getRefundHexTransaction({
      scriptValues: this.state.btcScriptValues,
      secret: this.state.secret,
    })
      .then((txHex) => {
        this.setState({
          refundTxHex: txHex,
        })
      })
  }

  tryRefund() {
    const flow = this
    const { utxoScriptValues, secret } = flow.state

    return flow.btcSwap.refund({
      scriptValues: utxoScriptValues,
      secret: secret,
    })
      .then((hash) => {
        if (!hash) {
          return false
        }

        this.swap.room.sendMessage({
          event: 'utxo refund completed',
        })

        flow.setState({
          refundTransactionHash: hash,
          isRefunded: true,
          isSwapExist: false,
        }, true)

        return true
      })
      .catch((error) => {
        if (/Address is empty/.test(error)) {
          // TODO - fetch TX list to script for refund TX
          flow.setState({
            isRefunded: true,
            isSwapExist: false,
          }, true)
          return true
        } else {
          console.warn('Btc refund:', error)

          return false
        }
      })
  }

  async isRefundSuccess() {
    const { refundTransactionHash, isRefunded } = this.state
    if (refundTransactionHash && isRefunded) {
      if (await this.btcSwap.checkTX(refundTransactionHash)) {
        return true
      } else {
        console.warn('BTC2ETH - unknown refund transaction')
        this.setState( {
          refundTransactionHash: null,
          isRefunded: false,
        } )
        return false
      }
    }
    return false
  }

  async tryWithdraw(_secret) {
    const { secret, secretHash, isEthWithdrawn } = this.state

    if (!_secret)
      throw new Error(`Withdrawal is automatic. For manual withdrawal, provide a secret`)

    if (secret && secret != _secret)
      console.warn(`Secret already known and is different. Are you sure?`)

    if (isEthWithdrawn)
      console.warn(`Looks like money were already withdrawn, are you sure?`)

    debug('swap.core:flow')(`WITHDRAW using secret = ${_secret}`)

    const _secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(_secret, 'hex')).toString('hex')

    if (secretHash != _secretHash)
      console.warn(`Hash does not match! state: ${secretHash}, given: ${_secretHash}`)

    const data = {
      ownerAddress: this.app.getParticipantEthAddress(this.swap),
      secret: _secret,
    }

    await this.ethSwap.withdraw(data, (hash) => {
      debug('swap.core:flow')(`TX hash=${hash}`)
      this.setState({
        ethSwapWithdrawTransactionHash: hash,
        canCreateEthTransaction: true,
      })
    }).then(() => {

      this.finishStep({
        isEthWithdrawn: true,
      }, 'withdraw-eth')
    })
  }
}

export default BTC2ETH
