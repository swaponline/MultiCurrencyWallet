import debug from 'debug'
import SwapApp, { util } from 'swap.app'
import Flow from './Flow'


class AtomicAB2UTXO extends Flow {
  constructor(swap) {
    super(swap)
    this.swap     = swap
    this.steps    = []
    this.app      = null

    this.stepNumbers = {}

    this.state = {
      ...this.state,
      ...{
        /** AB-UTXO **/
        // Partical (btc-seller) has unconfirmed txs in mempool
        participantHasLockedUTXO: false,
        // Script charged, confirmed and checked - next step - charge AB contract
        isUTXOScriptOk: false,
        utxoScriptValues: null,
        utxoScriptVerified: false,
        utxoScriptCreatingTransactionHash: null,
        /** UTXO-AB **/
        // We are have locked txs in mem-pool
        waitUnlockUTXO: false,
        utxoFundError: null,
      },
    }
  }

  signABSide() {
    this.swap.processMetamask()
  }

  signUTXOSide() {
    this.swap.processMetamask()
    this.swap.room.once('swap sign', () => {
      const { step } = this.state

      if (step >= 2) {
        return
      }

      this.swap.room.once('eth refund completed', () => {
        this.tryRefund()
      })

      this.finishStep({
        isParticipantSigned: true,
      }, { step: 'sign', silentError: true })
    })

    this.swap.room.once('swap exists', () => {
      this.setState({
        isSwapExist: true,
      })

      this.stopSwapProcess()
    })

    this.swap.room.sendMessage({
      event: 'request sign',
    })
  }

  waitUTXOScriptCreated() {
    const flow = this
    this.swap.room.on('create utxo script', ({ scriptValues, utxoScriptCreatingTransactionHash }) => {
      const { step } = flow.state

      if (step >= 3) {
        return
      }

      flow.finishStep({
        secretHash: scriptValues.secretHash,
        utxoScriptValues: scriptValues,
        utxoScriptCreatingTransactionHash,
      }, { step: 'wait-lock-utxo', silentError: true })
    })

    this.swap.room.sendMessage({
      event: 'request utxo script',
    })
  }

  async waitUTXOScriptFunded({
    utxoCoin,
  }: {
    utxoCoin: string,
  }) {
    const flow = this
    const {
      participant,
      buyAmount,
      sellAmount,
      waitConfirm,
    } = flow.swap

    const { secretHash } = this.state

    const utcNow = () => Math.floor(Date.now() / 1000)

    const isUTXOScriptOk = await util.helpers.repeatAsyncUntilResult(async (stopRepeat) => {
      const {
        utxoScriptValues,
      } = flow.state


      const scriptCheckError = await this[`${utxoCoin}Swap`].checkScript(utxoScriptValues, {
        value: buyAmount,
        recipientPublicKey: this.app.services.auth.accounts[utxoCoin].getPublicKey(),
        lockTime: utcNow(),
        confidence: 0.8,
        isWhiteList: this.app.isWhitelistBtc(participant.btc.address), // @todo - may be need more white list coins
        waitConfirm,
      })

      if (scriptCheckError) {
        if (/Expected script lockTime/.test(scriptCheckError)) {
          console.error(`${utxoCoin} script check error: ${utxoCoin} was refunded`, scriptCheckError)
          flow.stopSwapProcess()
          stopRepeat()
        } else if (/Expected script value/.test(scriptCheckError)) {
          console.warn(`${utxoCoin} script check: waiting balance`)
        } else if (
          /Can be replace by fee. Wait confirm/.test(scriptCheckError)
          ||
          /Wait confirm tx/.test(scriptCheckError)
        ) {
          flow.swap.room.sendMessage({
            event: `wait ${utxoCoin} confirm`,
            data: {},
          })
        } else {
          this.swap.events.dispatch(`${utxoCoin} script check error`, scriptCheckError)
        }

        return false
      } else {
        return true
      }
    })

    if (!isUTXOScriptOk) {
      return false
    } else {
      flow.setState({
        isUTXOScriptOk,
      }, true)
      return true
    }
  }

  getScriptValues() {
    return this.state.utxoScriptValues
  }

  verifyScript() {
    const { utxoScriptVerified, utxoScriptValues } = this.state

    if (utxoScriptVerified) {
      return true
    }

    if (!utxoScriptValues) {
      throw new Error(`No script, cannot verify`)
    }

    this.finishStep({
      utxoScriptVerified: true,
    }, { step: 'verify-script' })

    return true
  }

  getScriptCreateTx() {
    const {
      utxoScriptCreatingTransactionHash,
    } = this.state
    return utxoScriptCreatingTransactionHash
  }

  tryRefund() {}
}


export default AtomicAB2UTXO
