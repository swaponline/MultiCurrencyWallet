import React, { PureComponent } from 'react'

import Swap from 'swap.swap'

import cssModules from 'react-css-modules'
import styles from './Swap.scss'

import { connect } from 'redaction'
import helpers, { links, constants } from 'helpers'
import actions from 'redux/actions'

import { swapComponents } from './swaps'
import Share from './Share/Share'
import EmergencySave from './EmergencySave/EmergencySave'
import { injectIntl, FormattedMessage } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import DeleteSwapAfterEnd from './DeleteSwapAfterEnd'
import SwapController from './SwapController'
import { Button } from 'components/controls'
import FeeControler from './FeeControler/FeeControler'

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
    ethBalance: null,
    currencyData: null,
    isAmountMore: null,
    SwapComponent: null,
    continueSwap: true,
    enoughBalance: true,
    depositWindow: false,
    timeSinceSecretPublished: 5,
    shouldStopCheckingWithdrawError: false,
  }

  componentWillMount() {
    const { items, tokenItems, intl: { locale } } = this.props
    let { match : { params : { orderId } }, history } = this.props

    if (!orderId) {
      history.push(localisedUrl(links.exchange))
      return
    }

    try {
      const swap = new Swap(orderId)
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
      actions.notifications.show(constants.notifications.ErrorNotification, { error: 'Sorry, but this order do not exsit already' })
      this.props.history.push(localisedUrl(links.exchange))
    }
    this.setSaveSwapId(orderId)
  }

  componentDidMount() {
    const { swap: { flow: { state: { canCreateEthTransaction, requireWithdrawFeeSended } } }, continueSwap } = this.state
    if (this.state.swap !== null) {
      this.checkBalance()

      let timer

      setTimeout(() => {
        if (!canCreateEthTransaction && continueSwap && requireWithdrawFeeSended) {
          this.checkEnoughFee()
        }
      }, 300 * 1000)

      timer = setInterval(() => {
        this.catchWithdrawError()
        this.requesting()
      }, 5000)
    }
  }

  // componentWillMount() {
  //   actions.api.checkServers()
  //     .then(() => {
  //
  //     })
  // }

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

  checkBalance = () => {
    const sellAmountPlusFee = this.state.swap.sellAmount.toNumber() + 0.00005

    if (sellAmountPlusFee >= this.state.currencyData.balance) {
      this.setState(() => ({
        enoughBalance: false,
        depositWindow: true,
      }))
    }
  }

  requesting = () => {
    if (this.state.swap.flow.state.requireWithdrawFee && !this.state.swap.flow.state.requireWithdrawFeeSended) {
      this.state.swap.flow.sendWithdrawRequest()
    }
    if (this.state.swap.flow.state.withdrawRequestIncoming && !this.state.swap.flow.state.withdrawRequestAccepted) {
      this.state.swap.flow.acceptWithdrawRequest()
    }
  }

  checkIsTokenIncludes = () => {
    this.props.tokenItems.map(item => item.name).includes(this.props.swap.participantSwap._swapName.toLowerCase())
  }

  catchWithdrawError = () => {
    const { swap, shouldStopCheckingWithdrawError, continueSwap } = this.state

    if (swap.sellCurrency === 'BTC'
      && helpers.ethToken.isEthToken({ name: swap.buyCurrency.toLowerCase() })
      && !shouldStopCheckingWithdrawError) {
      this.setState(() => ({ continueSwap: true }))
    } else {
      this.checkEnoughFee()
      this.setState(() => ({
        shouldStopCheckingWithdrawError: true,
      }))
    }
  }

  checkEnoughFee = () => {
    const { swap: { participantSwap, flow: { state: { canCreateEthTransaction } } }, currencyData: { currency }, continueSwap } = this.state

    const currenciesInNeedETHFee = ['BTC', 'ETH', 'LTC']

    if (canCreateEthTransaction === false && (
      helpers.ethToken.isEthToken({ name: currency.toLowerCase() })
      || currenciesInNeedETHFee.includes(currency)
    )) {
      this.setState(() => ({
        continueSwap: false,
      }))
    }
  }

  handleGoHome = () => {
    const { intl: { locale } } = this.props
    this.props.history.push(localisedUrl(locale, links.home))
  }

  render() {
    const { peer } = this.props
    const { swap, SwapComponent, currencyData, isAmountMore, ethData, continueSwap, enoughBalance, depositWindow, ethAddress } = this.state

    if (!swap || !SwapComponent || !peer || !isAmountMore) {
      return null
    }
    const isFinished = (swap.flow.state.step >= (swap.flow.steps.length - 1))

    return (
      <div styleName="swap">
        <SwapComponent
          depositWindow={depositWindow}
          disabledTimer={isAmountMore === 'enable'}
          swap={swap}
          currencyData={currencyData}
          styles={styles}
          enoughBalance={enoughBalance}
          ethData={ethData}
        >
          <Share flow={swap.flow} />
          <EmergencySave flow={swap.flow} />
          {
            peer === swap.owner.peer && (
              <DeleteSwapAfterEnd swap={swap} />
            )
          }
          <SwapController swap={swap} />
          {swap.flow.state.step >= 5 && !continueSwap && swap.flow.state.step <= 6 && (<FeeControler ethAddress={ethAddress} />)}
        </SwapComponent>
        {
          (isFinished) && (
            <div styleName="gohome-holder">
              <Button styleName="button" green onClick={this.handleGoHome} >
                <FormattedMessage id="swapFinishedGoHome" defaultMessage="Return to home page" />
              </Button>
            </div>
          )
        }
      </div>
    )
  }
}
