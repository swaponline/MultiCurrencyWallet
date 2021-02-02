import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'
import { BigNumber } from 'bignumber.js'


class GHOST2ETH extends Flow {

  _flowName: string
  ghostSwap: any
  ethSwap: any
  state: any

  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.ghost
  }
  static getToName() {
    return constants.COINS.eth
  }

  constructor(swap) {
    super(swap)

    this._flowName = GHOST2ETH.getName()

    this.stepNumbers = {
      'sign': 1,
      'submit-secret': 2,
      'sync-balance': 3,
      'lock-ghost': 4,
      'wait-lock-eth': 5,
      'withdraw-eth': 6,
      'finish': 7,
      'end': 8
    }

    this.ethSwap = swap.ownerSwap
    this.ghostSwap = swap.participantSwap

    if (!this.ethSwap) {
      throw new Error('GHOST2ETH: "ethSwap" of type object required')
    }
    if (!this.ghostSwap) {
      throw new Error('GHOST2ETH: "ghostSwap" of type object required')
    }

    this.state = {
      step: 0,

      isStoppedSwap: false,

      signTransactionHash: null,
      isSignFetching: false,
      isParticipantSigned: false,

      ghostScriptCreatingTransactionHash: null,
      ethSwapCreationTransactionHash: null,

      secretHash: null,

      ghostScriptVerified: false,

      isBalanceFetching: false,
      isBalanceEnough: true,
      balance: null,

      isEthContractFunded: false,

      ghostSwapWithdrawTransactionHash: null,
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
    }

    this._persistState()
    super._persistSteps()
  }

  _persistState() {
    super._persistState()
  }

  _getSteps() {
    const flow = this

    return [

      // 1. Signs

      async () => {
        flow.swap.processMetamask()
        flow.swap.room.once('swap sign', () => {
          const { step } = flow.state

          if (step >= 2) {
            return
          }

          flow.swap.room.once('eth refund completed', () => {
            flow.tryRefund()
          })

          flow.finishStep({
            isParticipantSigned: true,
          }, { step: 'sign', silentError: true })
        })

        flow.swap.room.once('swap exists', () => {
          flow.setState({
            isSwapExist: true,
          })

          flow.stopSwapProcess()
        })

        flow.swap.room.sendMessage({
          event: 'request sign',
        })
      },

      // 2. Create secret, secret hash and BTC script

      () => {
        // this.submitSecret()
      },

      // 3. Check balance

      () => {
        this.syncBalance()
      },

      // 4. Create BTC Script, fund, notify participant

      async () => {
        const onTransactionHash = (txID) => {
          const { ghostScriptCreatingTransactionHash, utxoScriptValues } = flow.state

          if (ghostScriptCreatingTransactionHash) {
            return
          }

          flow.setState({
            ghostScriptCreatingTransactionHash: txID,
          })

          flow.swap.room.once('request ghost script', () => {
            flow.swap.room.sendMessage({
              event:  'create ghost script',
              data: {
                scriptValues: utxoScriptValues,
                ghostScriptCreatingTransactionHash: txID,
              }
            })
          })

          flow.swap.room.sendMessage({
            event: 'create ghost script',
            data: {
              scriptValues : utxoScriptValues,
              ghostScriptCreatingTransactionHash : txID,
            }
          })
        }

        const { sellAmount } = flow.swap
        const { isBalanceEnough, utxoScriptValues } = flow.state

        if (isBalanceEnough) {
          await flow.ghostSwap.fundScript({
            scriptValues: utxoScriptValues,
            amount: sellAmount,
          })
        }

        const checkGHOSTScriptBalance = async () => {
          const { scriptAddress } = this.ghostSwap.createScript(utxoScriptValues)
          const unspents = await this.ghostSwap.fetchUnspents(scriptAddress)

          if (unspents.length === 0) {
            return false
          }

          const txID = unspents[0].txid

          const balance = await this.ghostSwap.getBalance(utxoScriptValues)

          const isEnoughMoney = new BigNumber(balance).isGreaterThanOrEqualTo(sellAmount.times(1e8))

          if (isEnoughMoney) {
            flow.setState({
              scriptBalance: new BigNumber(balance).div(1e8).dp(8),
            })

            onTransactionHash(txID)
          }

          return isEnoughMoney
        }

        await util.helpers.repeatAsyncUntilResult(async (stopRepeat) => {
          const { isStoppedSwap } = flow.state

          if (!isStoppedSwap) {
            return await checkGHOSTScriptBalance()
          } else {
            stopRepeat()
          }
        })

        const { isStoppedSwap } = flow.state

        if (!isStoppedSwap) {
          flow.finishStep({
            isGhostScriptFunded: true,
          }, { step: 'lock-ghost' })
        }
      },

      // 5. Wait participant creates ETH Contract

      async () => {
        await flow.ethSwap.waitAB2UTXOContract({
          flow,
          utxoCoin: `ghost`,
        })
      },

      // 6. Withdraw

      async () => {
        await flow.ethSwap.withdrawFromAB2UTXO({ flow })
      },

      // 7. Finish

      () => {
        flow.swap.room.once('swap finished', ({btcSwapWithdrawTransactionHash}) => {
          flow.setState({
            btcSwapWithdrawTransactionHash,
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
  }

  /**
   * TODO - backport version compatibility
   *  mapped to sendWithdrawRequestToAnotherParticipant
   *  remove at next iteration after client software update
   *  Used in swap.react
   */
  sendWithdrawRequest() {
    return this.sendWithdrawRequestToAnotherParticipant()
  }

  getScriptCreateTx() {
    const {
      ghostScriptCreatingTransactionHash: createTx,
    } = this.state
    return createTx
  }

  sendWithdrawRequestToAnotherParticipant() {
    const flow = this

    const { requireWithdrawFee, requireWithdrawFeeSended } = flow.state

    if (!requireWithdrawFee || requireWithdrawFeeSended) {
      return
    }

    flow.setState({
      requireWithdrawFeeSended: true,
    })

    flow.swap.room.on('accept withdraw request', () => {
      flow.swap.room.sendMessage({
        event: 'do withdraw',
        data: {
          secret: flow.state.secret,
        }
      })
    })

    flow.swap.room.sendMessage({
      event: 'request withdraw',
    })
  }

  submitSecret(secret) {
    if (this.state.secret) { return }

    if (!this.state.isParticipantSigned) {
      throw new Error(`Cannot proceed: participant not signed. step=${this.state.step}`)
    }

    const secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(secret, 'hex')).toString('hex')

    /* Secret hash generated - create GHOST script - and only after this notify other part */
    this.createWorkGHOSTScript(secretHash);

    const _secret = `0x${secret.replace(/^0x/, '')}`

    this.finishStep({
      secret: _secret,
      secretHash,
    }, { step: 'submit-secret' })
  }

  getGHOSTScriptAddress() {
    const { scriptAddress } = this.state
    return scriptAddress;
  }

  createWorkGHOSTScript(secretHash) {
    if (this.state.utxoScriptValues) {
      debug('swap.core:flow')('GHOST Script already generated', this.state.utxoScriptValues)
      return
    }

    const { participant } = this.swap

    const utcNow = () => Math.floor(Date.now() / 1000)
    const getLockTime = () => utcNow() + 60 * 60 * 3 // 3 hours from now

    const scriptValues = {
      secretHash:         secretHash,
      ownerPublicKey:     this.app.services.auth.accounts.ghost.getPublicKey(),
      recipientPublicKey: participant.ghost.publicKey,
      lockTime:           getLockTime(),
    }
    const { scriptAddress } = this.ghostSwap.createScript(scriptValues)

    this.setState({
      scriptAddress: scriptAddress,
      utxoScriptValues: scriptValues,
      scriptBalance: 0,
      scriptUnspendBalance: 0
    })
  }

  async skipSyncBalance() {
    this.finishStep({}, { step: 'sync-balance' })
  }

  async syncBalance() {
    const { sellAmount } = this.swap

    this.setState({
      isBalanceFetching: true,
    })

    const ghostAddress = this.app.services.auth.accounts.ghost.getAddress()

    const txFee = await this.ghostSwap.estimateFeeValue({ method: 'swap', fixed: true, address: ghostAddress })
    const unspents = await this.ghostSwap.fetchUnspents(ghostAddress)
    const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
    const balance = new BigNumber(totalUnspent).dividedBy(1e8)

    const needAmount = sellAmount.plus(txFee)
    const isEnoughMoney = needAmount.isLessThanOrEqualTo(balance)

    const stateData = {
      balance,
      isBalanceFetching: false,
      isBalanceEnough: isEnoughMoney,
    }

    if (isEnoughMoney) {
      this.finishStep(stateData, { step: 'sync-balance' })
    } else {
      this.setState(stateData, true)
    }
  }

  getRefundTxHex = () => {
    this.ghostSwap.getRefundHexTransaction({
      scriptValues: this.state.utxoScriptValues,
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

    return flow.ghostSwap.refund({
      scriptValues: utxoScriptValues,
      secret: secret,
    })
      .then((hash) => {
        if (!hash) {
          return false
        }

        this.swap.room.sendMessage({
          event: 'ghost refund completed',
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
          console.warn('Ghost refund:', error)

          return false
        }
      })
  }

  stopSwapProcess() {
    const flow = this

    console.warn('Swap was stoped')

    flow.setState({
      isStoppedSwap: true,
    }, true)
  }

  async isRefundSuccess() {
    const { refundTransactionHash, isRefunded } = this.state
    if (refundTransactionHash && isRefunded) {
      if (await this.ghostSwap.checkTX(refundTransactionHash)) {
        return true
      } else {
        console.warn('GHOST2ETH - unknown refund transaction')
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

    const { participant } = this.swap

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

export default GHOST2ETH
