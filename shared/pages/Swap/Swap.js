import React, { PureComponent } from 'react'

import Swap from 'swap.swap'

import cssModules from 'react-css-modules'
import styles from './Swap.scss'

import { connect } from 'redaction'
import helpers from 'helpers'
import actions from 'redux/actions'
import constants from 'constants'

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
    continueSwap: false,
    enoughtBalance: true,
    depositWindow: false,
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
        step: swap.flow.state.step,
        ethAddress: ethData[0].address,
      })

    } catch (error) {
      actions.notifications.show(constants.notifications.ErrorNotification, { error: 'Sorry, but this order do not exsit already' })
      this.props.history.push(localisedUrl(links.exchange))
    }
    this.setSaveSwapId(orderId)
    this.getFee()
  }

  componentDidMount() {
    if (this.state.swap !== null) {
      this.checkBalance()
      this.checkEthBalance()

      let timer

      timer = setInterval(() => {
        if (this.state.continueSwap === false) {
          this.checkEthBalance()
        } else {
          clearInterval(timer)
        }
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
        enoughtBalance: false,
        depositWindow: true,
      }))
    }
  }

  getFee = async () => {
    const btcFee = await helpers.btc.estimateFeeValue({ speed: 'normal' })
    const ltcFee = await helpers.ltc.estimateFeeValue({ speed: 'normal' })

    this.setState(() => ({
      btcFee,
      ltcFee,
    }))
  }

  checkEthBalance = async () => {
    const { swap: { participantSwap, ownerSwap, sellAmount }, currencyData, btcFee, ltcFee } = this.state

    const ethBalance = await actions.eth.getBalance()

    const ethFee = (participantSwap.gasPrice * participantSwap.gasLimit * (1e-18)) || (ownerSwap.gasPrice * ownerSwap.gasLimit * (1e-18))
    const etheriumFee = sellAmount + ethFee

    if (this.props.tokenItems.map(item => item.name).includes(participantSwap._swapName.toLowerCase()) && ethBalance > ethFee) { // ercFee
      this.setState(() => ({ continueSwap: true }))
    }
    if (currencyData.currency  === 'BTC' && ethBalance > btcFee) {
      this.setState(() => ({ continueSwap: true }))
    }

    if (currencyData.currency  === 'ETH' && ethBalance > sellAmount) {
      this.setState(() => ({ continueSwap: true }))
    }

  }

  handleGoHome = () => {
    this.props.history.push(links.home)
  }

  render() {
    const { peer } = this.props
    const { swap, SwapComponent, currencyData, isAmountMore, ethData, continueSwap, enoughtBalance, depositWindow, step, ethAddress } = this.state


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
          enoughtBalance={enoughtBalance}
        >
          <Share flow={swap.flow} />
          <EmergencySave flow={swap.flow} />
          {
            peer === swap.owner.peer && (
              <DeleteSwapAfterEnd swap={swap} />
            )
          }
          <SwapController swap={swap} />
          {step >= 5 && !continueSwap && (<FeeControler ethAddress={ethAddress} />)}
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
