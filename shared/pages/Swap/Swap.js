import React, { PureComponent } from 'react'

import Swap from 'swap.swap'

import cssModules from 'react-css-modules'
import styles from './Swap.scss'

import { connect } from 'redaction'
import { links, constants } from 'helpers'
import actions from 'redux/actions'

import { swapComponents } from './swaps'
import Share from './Share/Share'
import EmergencySave from './EmergencySave/EmergencySave'
import { injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import DeleteSwapAfterEnd from './DeleteSwapAfterEnd'
import SwapController from './SwapController'


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
    SwapComponent: null,
    currencyData: null,
    isAmountMore: null,
    ethBalance: null,
    continueSwap: false,
    enoughtBalance: true,
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
        SwapComponent,
        swap,
        currencyData,
        ethData,
      })

    } catch (error) {
      actions.notifications.show(constants.notifications.ErrorNotification, { error: 'Sorry, but this order do not exsit already' })
      this.props.history.push(localisedUrl(links.exchange))
    }
    this.setSaveSwapId(orderId)
  }

  componentDidMount() {
    let timer

    timer = setInterval(() => {
      if (this.state.continueSwap === false) {
        this.checkBalance()
      } else {
        clearInterval(timer)
      }
    }, 5000)
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

  checkBalance = async () => {
    const { swap: { participantSwap } } = this.state

    const ethBalance = await actions.eth.getBalance()
    if (this.props.tokenItems.map(item => item.name).includes(participantSwap._swapName.toLowerCase())
      && ethBalance >= participantSwap.gasLimit * participantSwap.gasPrice * (1e-18)) {
      this.setState(() => ({ continueSwap: true }))
    }
  }

  render() {
    const { peer } = this.props
    const { swap, SwapComponent, currencyData, isAmountMore, ethData, continueSwap } = this.state

    if (!swap || !SwapComponent || !peer || !isAmountMore) {
      return null
    }

    return (
      <div styleName="swap">
        <SwapComponent
          disabledTimer={isAmountMore === 'enable'}
          swap={swap}
          currencyData={currencyData}
          continueSwap={continueSwap}
          ethData={ethData}
          styles={styles}
        >
          <Share flow={swap.flow} />
          <EmergencySave flow={swap.flow} />
          {
            peer === swap.owner.peer && (
              <DeleteSwapAfterEnd swap={swap} />
            )
          }
          <SwapController swap={swap} />
        </SwapComponent>
      </div>
    )
  }
}
