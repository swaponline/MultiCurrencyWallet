import React, { PureComponent, Fragment } from 'react'

import Swap from 'swap.swap'
import SwapApp from 'swap.app'

import cssModules from 'react-css-modules'
import styles from './DirectSwap.scss'

import { connect } from 'redaction'
import helpers, { links, constants } from 'helpers'
import request from 'common/utils/request'
import actions from 'redux/actions'
import { Link } from 'react-router-dom'


import { injectIntl, FormattedMessage } from 'react-intl'
import { localisedUrl } from 'helpers/locale'

import feedback from 'shared/helpers/feedback'

import config from 'app-config'



import { IDirectSwapConditions, DirectSwapStep } from 'common/domain/swap'


const isDark = localStorage.getItem(constants.localStorage.isDark)

@injectIntl
@connect(({
/*  user: {
    ethData,
    btcData,
    ghostData,
    nextData,
    tokensData,
    activeFiat
  },*/
  pubsubRoom: { peer },
  //rememberedOrders,
}) => ({
/*  activeFiat,
  items: [ethData, btcData, ghostData, nextData],
  tokenItems: [...Object.keys(tokensData).map(k => (tokensData[k]))],
  currenciesData: [ethData, btcData, ghostData, nextData],
  tokensData: [...Object.keys(tokensData).map(k => (tokensData[k]))],
  savedOrders: rememberedOrders.savedOrders,
  deletedOrders: rememberedOrders.deletedOrders,*/
  peer,
}))

@cssModules(styles, { allowMultiple: true })
export default class SwapComponent extends PureComponent<any, any> {

/*  wallets: any
  checkingConfirmSuccessTimer: any
  checkingCycleTimer: any*/

  constructor() {
    //@ts-ignore
    super()

    this.state = {
    }
  }

  componentWillMount() {
/*    const { items, tokenItems, currenciesData, tokensData, intl: { locale }, deletedOrders } = this.props
    let { match: { params: { orderId } }, history, activeFiat } = this.props

    if (!!window.performance && window.performance.navigation.type === 2) {
      window.location.reload()
    }

    if (!orderId) {
      history.push(localisedUrl(links.exchange))
      return
    }

    this.wallets = {}
    currenciesData.forEach(item => {
      this.wallets[item.currency] = item.address
    })
    tokensData.forEach(item => {
      this.wallets[item.currency] = item.address
    })

    try {
      const swap = new Swap(orderId, SwapApp.shared())
      console.log('Swap flow:', swap.flow._flowName);

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
        actions.user.getExchangeRate(item.currency, activeFiat.toLowerCase())
          .then(exRate => {
            //@ts-ignore
            const amount = exRate * Number(item.amount)

            if (Number(amount) >= 50) {
              this.setState(() => ({ isAmountMore: 'enable' }))
            } else {
              this.setState(() => ({ isAmountMore: 'disable' }))
            }
          })
      })

      this.setState(() => ({
        swap,
        ethData,
        currencyData,
        ethAddress: ethData[0].address,
      }))

      // hide my orders
      // disable for now TODO
      // actions.core.hideMyOrders()

    } catch (error) {
      console.error(error)
      actions.notifications.show(constants.notifications.ErrorNotification, {
        error: 'Sorry, but this order do not exsit already'
      })
      this.props.history.push(localisedUrl(links.exchange))
    }
*/
/*    if (!this.props.savedOrders.includes(orderId)) {
      this.setSaveSwapId(orderId)
    }*/
  }

  componentDidMount() {
    const { swap, /*deletedOrders*/ } = this.state

    const { /*match: { params: { orderId } }, savedOrders*/ } = this.props

/*    if (swap !== null) {
      console.log('checkingCycle')

      const checkingCycle = setInterval(() => {

        if (isFinallyFinished) {
          feedback.swap.finished()
        }
        if (isStoppedSwap) {
          feedback.swap.stopped()
        }

        if (isFinallyFinished || isStoppedSwap) {
          clearInterval(checkingCycle)
          return
        }

        this.isBalanceEnough()
      }, 5000)
    }*/

    feedback.swap.started(JSON.stringify({
      //... 
    }))
  }

  componentWillUnmount() {
    /*clearInterval(this.checkingCycleTimer)
    clearTimeout(this.checkingConfirmSuccessTimer)*/
  }



/*  saveThisSwap = (orderId) => {
    actions.core.rememberOrder(orderId)
  }

  deleteThisSwap = (orderId) => {
    actions.core.saveDeletedOrder(orderId)
    actions.core.forgetOrders(orderId)
    window.swap = null
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
*/
  isBalanceEnough = () => {
    //...
  }


  render() {
    const { peer, tokenItems, history, intl: { locale } } = this.props
    const {
      swap,
    } = this.state

    const side = () => {

    }

    return (
      <Fragment>
        <div styleName="directSwap">
          <div styleName="side">
            <div styleName="avatar">
            </div>
            <div styleName="title">
              You
            </div>
          </div>
          <div styleName="tx">
            123412341234123412341234123412341234
          </div>
        </div>
      </Fragment>
    )
  }
}
