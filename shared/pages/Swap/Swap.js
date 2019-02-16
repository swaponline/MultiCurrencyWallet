import React, { PureComponent } from 'react'

import Swap from 'swap.swap'
import SwapApp from 'swap.app'

import cssModules from 'react-css-modules'
import styles from './Swap.scss'

import { connect } from 'redaction'
import helpers, { links, constants } from 'helpers'
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


@injectIntl
@connect(({
  user: { ethData, btcData, /* bchData, */ tokensData, eosData, telosData, nimData, usdtData, ltcData },
  ipfs: { peer },
}) => ({
  items: [ ethData, btcData, eosData, telosData, /* bchData, */ ltcData, usdtData /* nimData */ ],
  tokenItems: [ ...Object.keys(tokensData).map(k => (tokensData[k])) ],
  errors: 'api.errors',
  checked: 'api.checked',
  peer,
}))

@cssModules(styles, { allowMultiple: true })
export default class SwapComponent extends PureComponent {

  state = {
    swap: null,
    isMy: false,
    ethBalance: null,
    currencyData: null,
    isAmountMore: null,
    SwapComponent: null,
    continueSwap: true,
    enoughBalance: true,
    depositWindow: false,
    isShowingBitcoinScript: false,
    shouldStopCheckSendingOfRequesting: false,
  }

  timerFeeNotication = null

  componentWillMount() {
    const { items, tokenItems, intl: { locale } } = this.props
    let { match : { params : { orderId } }, history } = this.props

    if (!orderId) {
      history.push(localisedUrl(links.exchange))
      return
    }

    try {
      const swap = window.swap || new Swap(orderId, SwapApp.shared())
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

    } catch (error) {
      console.error(error)
      actions.notifications.show(constants.notifications.ErrorNotification, { error: 'Sorry, but this order do not exsit already' })
      this.props.history.push(localisedUrl(links.exchange))
    }
    this.setSaveSwapId(orderId)
  }

  componentDidMount() {
    const { swap: { flow: { state: { canCreateEthTransaction, requireWithdrawFeeSended } } }, continueSwap } = this.state
    if (this.state.swap !== null) {

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
  }

  setSaveSwapId = (orderId) => {
    let swapsId = JSON.parse(localStorage.getItem('swapId'))

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
    const { swap: { flow: { acceptWithdrawRequest, sendWithdrawRequest,
      state: { requireWithdrawFee, requireWithdrawFeeSended, withdrawRequestIncoming, withdrawRequestAccepted } } } } = this.state

    if (requireWithdrawFee && !requireWithdrawFeeSended) {
      sendWithdrawRequest()
    }
    if (withdrawRequestIncoming && !withdrawRequestAccepted) {
      acceptWithdrawRequest()
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

  checkEnoughFee = () => {
    const { swap: { participantSwap, flow: { state: { canCreateEthTransaction } } }, currencyData: { currency }, continueSwap } = this.state

    const coinsWithDynamicFee = ['BTC', 'ETH', 'LTC']

    if (canCreateEthTransaction === false && (
      helpers.ethToken.isEthToken({ name: currency.toLowerCase() })
      || coinsWithDynamicFee.includes(currency)
    )) {
      this.setState(() => ({
        continueSwap: false,
      }))
    } else {
      this.setState(() => ({
        continueSwap: true,
      }))
    }
  }

  toggleBitcoinScript = () => {
    this.setState({
      isShowingBitcoinScript: !this.state.isShowingBitcoinScript,
    })
  }

  render() {
    const { peer, tokenItems, history } = this.props
    const { swap, SwapComponent, currencyData, isAmountMore, ethData, continueSwap, enoughBalance, depositWindow, ethAddress, isShowingBitcoinScript } = this.state

    if (!swap || !SwapComponent || !peer || !isAmountMore) {
      return null
    }

    const isFinished = (swap.flow.state.step >= (swap.flow.steps.length - 1))

    return (
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
        >
          <Share flow={swap.flow} />
          <EmergencySave flow={swap.flow} />
          <ShowBtcScript onClick={this.toggleBitcoinScript} btcScriptValues={swap.flow.state.btcScriptValues} isShowingBitcoinScript={isShowingBitcoinScript} />
          {peer === swap.owner.peer && (<DeleteSwapAfterEnd swap={swap} />)}
        </SwapComponent>
      </div>
    )
  }
}
