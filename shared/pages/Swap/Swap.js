import React, { PureComponent, Fragment } from 'react'

import Swap from 'swap.swap'
import SwapApp from 'swap.app'

import cssModules from 'react-css-modules'
import styles from './Swap.scss'

import { connect } from 'redaction'
import helpers, { links, constants, request } from 'helpers'
import actions from 'redux/actions'
import { Link } from 'react-router-dom'

import { swapComponents } from './swaps'
import Share from './Share/Share'
import EmergencySave from './EmergencySave/EmergencySave'
import { injectIntl, FormattedMessage } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import DeleteSwapAfterEnd from './DeleteSwapAfterEnd'
import { Button } from 'components/controls'
import FeeControler from './FeeControler/FeeControler'
import DepositWindow from './DepositWindow/DepositWindow'
import ShowBtcScript from './ShowBtcScript/ShowBtcScript'
import CopyToClipboard from 'react-copy-to-clipboard'

import config from 'app-config'


const isWidgetBuild = config && config.isWidget

@injectIntl
@connect(({
  user: { ethData, btcData, /* bchData, */ tokensData, eosData, telosData, nimData, usdtData, ltcData },
  ipfs: { peer },
  rememberedOrders,
}) => ({
  items: [ ethData, btcData, eosData, telosData, /* bchData, */ ltcData, usdtData /* nimData */ ],
  tokenItems: [ ...Object.keys(tokensData).map(k => (tokensData[k])) ],
  errors: 'api.errors',
  checked: 'api.checked',
  decline: rememberedOrders.savedOrders,
  deletedOrders: rememberedOrders.deletedOrders,
  peer,
}))

@cssModules(styles, { allowMultiple: true })
export default class SwapComponent extends PureComponent {

  state = {
    isAddressCopied: false,
    stepToHide: 0,
    swap: null,
    receiveMessage: false,
    isMy: false,
    hideAll: false,
    ethBalance: null,
    currencyData: null,
    isAmountMore: null,
    SwapComponent: null,
    continueSwap: true,
    enoughBalance: true,
    depositWindow: false,
    isShowingBitcoinScript: false,
    isShowDevInformation: false,
    shouldStopCheckSendingOfRequesting: false,
    waitWithdrawOther: false,
  }

  timerFeeNotication = null

  componentWillMount() {
    const { items, tokenItems, intl: { locale }, deletedOrders } = this.props
    let { match : { params : { orderId } }, history, location: { pathname } } = this.props

    if (!!window.performance && window.performance.navigation.type === 2) {
      window.location.reload()
    }

    if (!orderId) {
      history.push(localisedUrl(links.exchange))
      return
    }

    try {
      const swap = new Swap(orderId, SwapApp.shared())

      const SwapComponent = swapComponents[swap.flow._flowName]
      const ethData = items.filter(item => item.currency === 'ETH')
      const currencyData = items.concat(tokenItems)
        .filter(item => item.currency === swap.sellCurrency.toUpperCase())[0]
      const currencies = [
        {
          currency: swap.sellCurrency,
          amount: swap.sellAmount,
        },
        {
          currency: swap.buyCurrency,
          amount: swap.buyAmount,
        },
      ]

      currencies.forEach(item => {
        actions.user.getExchangeRate(item.currency, 'usd')
          .then(exRate => {
            const amount = exRate * Number(item.amount)

            if (Number(amount) >= 50) {
              this.setState(() => ({ isAmountMore: 'enable' }))
            } else {
              this.setState(() => ({ isAmountMore: 'disable' }))
            }
          })
      })
      window.swap = swap

      this.setState({
        swap,
        ethData,
        SwapComponent,
        currencyData,
        ethAddress: ethData[0].address,
      })
      /* hide my orders */
      // disable for now TODO
      // actions.core.hideMyOrders()

    } catch (error) {
      console.error(error)
      actions.notifications.show(constants.notifications.ErrorNotification, { error: 'Sorry, but this order do not exsit already' })
      this.props.history.push(localisedUrl(links.exchange))
    }

    if (!this.props.decline.includes(orderId)) {
      this.setSaveSwapId(orderId)
      this.saveThisSwap(orderId)
    }
  }

  componentDidMount() {
    const { swap: { id, flow: { state: { canCreateEthTransaction, requireWithdrawFeeSended, isFinished } } }, continueSwap, deletedOrders } = this.state

    if (localStorage.getItem('deletedOrders') !== null) {

      if (localStorage.getItem('deletedOrders').includes(id)) {
        this.props.history.push(localisedUrl(links.exchange))
      }
    }


    if (this.state.swap !== null) {
      this.state.swap.room.once('swap was canceled', () => {
        console.warn(`The Swap ${id} was stopped by the participants`)
        this.receiveMessage(id)
      })

      setTimeout(() => {
        if (!canCreateEthTransaction && continueSwap && requireWithdrawFeeSended) {
          this.checkEnoughFee()
        }
      }, 300 * 1000)

      setInterval(() => {
        this.catchWithdrawError()
        this.requestingWithdrawFee()
        this.isBalanceEnough()
      }, 5000)
    }
    if (isFinished) {
      this.deleteThisSwapFromStorage(id)
    }
  }

  saveThisSwap = (orderId) => {
    actions.core.rememberOrder(orderId)
  }

  deleteThisSwapFromStorage = (orderId) => {
    actions.core.forgetOrders(orderId)
  }

  deleteThisSwap = (orderId) => {
    actions.core.saveDeletedOrder(orderId)
    actions.core.forgetOrders(orderId)
  }

  cancelSwap = () => {
    let { match : { params : { orderId } }, history, location: { pathname }, intl: { locale } } = this.props
    const { swap: { flow: { state: { step } }, sellCurrency }, swap } = this.state

    this.state.swap.flow.stopSwapProcess()
    this.receiveMessage(orderId)
  }

  receiveMessage = (orderId) => {
    this.state.swap.flow.tryRefund()
    this.deleteThisSwap(orderId)
    this.setState(() => ({
      hideAll: true,
    }))
  }

  setSaveSwapId = (orderId) => {
    let swapsId = JSON.parse(localStorage.getItem('swapId'))
    console.log('dsdsds')
    if (swapsId === null || swapsId.length === 0) {
      swapsId = []
    }
    if (!swapsId.includes(orderId)) {
      swapsId.push(orderId)
    }
    localStorage.setItem('swapId', JSON.stringify(swapsId))
  }

  isBalanceEnough = () => {
    const { swap, balance } = this.state
    if (swap.flow.state.step === 4 && swap.sellCurrency !== 'BTC') {
      swap.flow.syncBalance()
    }

    if (!swap.flow.state.isBalanceEnough && swap.flow.state.step === 4) {
      this.setState(() => ({ enoughBalance: false }))
    } else {
      this.setState(() => ({ enoughBalance: true }))
    }
  }

  requestingWithdrawFee = () => {
    const {
      swap: {
        flow: {
          state: {
            requireWithdrawFee,
            requireWithdrawFeeSended,
            withdrawRequestIncoming,
            withdrawRequestAccepted,
          },
        },
      },
    } = this.state

    if (requireWithdrawFee && !requireWithdrawFeeSended) {
      if (this.state.swap && this.state.swap.flow) {
        this.state.swap.flow.sendWithdrawRequest()
        this.setState({
          waitWithdrawOther: true,
        })
        window.setTimeout(() => {
          this.setState({
            waitWithdrawOther: false,
          })
        }, 1000 * 60 * 2)
      }
    }

    if (withdrawRequestIncoming && !withdrawRequestAccepted) {
      if (this.state.swap && this.state.swap.flow) {
        this.state.swap.flow.acceptWithdrawRequest()
      }
    }
  }

  catchWithdrawError = () => {
    const { swap, shouldStopCheckSendingOfRequesting, continueSwap } = this.state

    if (swap.sellCurrency === 'BTC'
      && helpers.ethToken.isEthToken({ name: swap.buyCurrency.toLowerCase() })
      && !shouldStopCheckSendingOfRequesting) {
      this.setState(() => ({ continueSwap: true }))
    } else {
      this.checkEnoughFee()
      this.setState(() => ({
        shouldStopCheckSendingOfRequesting: true,
      }))
    }
  }

  sendRequestToFaucet = () => {
    const { owner, buyCurrency, buyAmount, sellCurrency, sellAmount } = this.state.swap

    if (this.state.requestToFaucetSended) return
    if (this.state.requestToFaucetError) return

    this.setState({
      requestToFaucetSended: true,
    })

    request.post(`${config.api.faucet}`, {
      body: {
        eth: this.state.ethAddress,
        buyCurrency,
        buyAmount: buyAmount.toString(),
        sellCurrency,
        sellAmount: sellAmount.toString(),
      },
    }).then((rv) => {
      console.log('faucet answered', rv)
      this.setState({
        requestToFaucetTxID: rv.txid,
      })
    }).catch((error) => {
      console.log('faucet error')
      this.setState({
        requestToFaucetSended: false,
        requestToFaucetError: true,
      })
    })
  }

  checkEnoughFee = () => {
    const {
      swap: {
        participantSwap,
        flow: {
          state: {
            canCreateEthTransaction,
            requireWithdrawFee,
          },
        },
      },
      currencyData: {
        currency,
      },
      continueSwap,
    } = this.state

    const coinsWithDynamicFee = ['BTC', 'ETH', 'LTC']

    if (canCreateEthTransaction === false && (
      helpers.ethToken.isEthToken({ name: currency.toLowerCase() })
      || coinsWithDynamicFee.includes(currency)
    )) {
      this.setState(() => ({
        continueSwap: false,
      }))
      this.sendRequestToFaucet()
    } else {
      this.setState(() => ({
        continueSwap: true,
      }))
    }
  }

  toggleInfo = (a, b) => {
    this.setState({
      isShowDevInformation: !a,
      isShowingBitcoinScript: !b,
    })
  }

  goWallet = () => {
    const { intl: { locale } } = this.props
    this.props.history.push(localisedUrl(locale, '/'))
  }

  handleCopyAddress = (e) => {
    this.setState({
      isAddressCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isAddressCopied: false,
        })
      }, 500)
    })
  }

  render() {
    const { peer, tokenItems, history, intl: { locale } } = this.props
    const {
      hideAll,
      swap,
      SwapComponent,
      currencyData,
      isAmountMore,
      ethData,
      continueSwap,
      enoughBalance,
      depositWindow,
      ethAddress,
      isShowingBitcoinScript,
      isShowDevInformation,
      requestToFaucetSended,
      stepToHide,
      isAddressCopied,
      waitWithdrawOther,
    } = this.state

    if (!swap || !SwapComponent || !peer || !isAmountMore) {
      return null
    }

    const isFinished = (swap.flow.state.step >= (swap.flow.steps.length - 1))
    return (
      <Fragment>
        {hideAll ?
          <div>
            <h3 styleName="canceled" /* eslint-disable-line */ onClick={this.goWallet}>
              <FormattedMessage id="swappropgress327" defaultMessage="this Swap is canceled" />
            </h3>
            <div>
              <h3 styleName="refHex">
                <FormattedMessage
                  id="swappropgress400"
                  defaultMessage="Refund is taking automatically"
                />
              </h3>
            </div>
          </div> :
          <div styleName="swap">
            <SwapComponent
              tokenItems={tokenItems}
              depositWindow={depositWindow}
              disabledTimer={isAmountMore === 'enable'}
              history={history}
              swap={swap}
              ethAddress={ethAddress}
              currencyData={currencyData}
              styles={styles}
              enoughBalance={enoughBalance}
              ethData={ethData}
              continueSwap={continueSwap}
              requestToFaucetSended={requestToFaucetSended}
              waitWithdrawOther={waitWithdrawOther}
              onClickCancelSwap={this.cancelSwap}
            >
              <Share flow={swap.flow} />
              <EmergencySave flow={swap.flow} onClick={() => this.toggleInfo(isShowDevInformation, true)} isShowDevInformation={isShowDevInformation} />
              <ShowBtcScript
                btcScriptValues={swap.flow.state.btcScriptValues}
                onClick={() => this.toggleInfo(!false, isShowingBitcoinScript)}
                isShowingBitcoinScript={isShowingBitcoinScript} />
              {peer === swap.owner.peer && (<DeleteSwapAfterEnd swap={swap} />)}
            </SwapComponent>
          </div>
        }
      </Fragment>
    )
  }
}
