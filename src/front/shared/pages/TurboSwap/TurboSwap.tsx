import React, { PureComponent, Fragment } from 'react'

import BigNumber from 'bignumber.js'
import Swap from 'swap.swap'
import SwapApp from 'swap.app'

import cssModules from 'react-css-modules'
import styles from './TurboSwap.scss'

import { connect } from 'redaction'
import helpers, { links, constants } from 'helpers'
import request from 'common/utils/request'
import actions from 'redux/actions'
import { Link } from 'react-router-dom'


import { injectIntl, FormattedMessage } from 'react-intl'
import { localisedUrl } from 'helpers/locale'

import feedback from 'shared/helpers/feedback'

import config from 'app-config'
import TxSide from './TxSide'
import Tx from './Tx'


import { SwapSide, SwapStatus, SwapTxStatus } from 'common/domain/swap'



interface ITurboSwapState {
  swap: Swap
}

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
  rememberedOrders,
}) => ({
  //activeFiat,
  //items: [ethData, btcData, ghostData, nextData],
  //tokenItems: [...Object.keys(tokensData).map(k => (tokensData[k]))],
  //currenciesData: [ethData, btcData, ghostData, nextData],
  //tokensData: [...Object.keys(tokensData).map(k => (tokensData[k]))],
  //savedOrders: rememberedOrders.savedOrders,
  //deletedOrders: rememberedOrders.deletedOrders,
  //peer,
}))
@cssModules(styles, { allowMultiple: true })
export default class TurboSwap extends PureComponent<any, ITurboSwapState> {

/*
  checkingConfirmSuccessTimer: any
  checkingCycleTimer: any*/

  constructor(props) {
    super(props)

    this.state = {
      swap: null,
    }
  }

  componentWillMount() {
    const {
      items,
      //tokenItems,
      currenciesData,
      tokensData,
      intl: {
        locale
      },
      //deletedOrders
    } = this.props

    let { match: { params: { orderId } }, history, activeFiat } = this.props

    if (!orderId) {
      history.push(localisedUrl(links.exchange))
      return
    }

    try {
      const swap = new Swap(orderId, SwapApp.shared())
      console.log(`Front uses flow ${swap.flow._flowName}`);

      //const ethData = items.filter(item => item.currency === 'ETH')

      this.setState(() => ({
        swap,
        //ethData,
        //ethAddress: ethData[0].address,
      }))

    } catch (error) {
      console.error(error)
      /*actions.notifications.show(constants.notifications.ErrorNotification, {
        error: 'Sorry, but this order do not exsit already'
      })
      this.props.history.push(localisedUrl(links.exchange))*/
    }

    /*if (!this.props.savedOrders.includes(orderId)) {
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
      // todo
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
    const {
      peer,
      /*tokenItems,*/
      history,
      intl: { locale }
    } = this.props

    const {
      swap,
      swap: {
        flow: {
          state: flowState,
        },
      },
    } = this.state

    const sellCurrencyKey = swap.sellCurrency.toLowerCase()
    const buyCurrencyKey = swap.buyCurrency.toLowerCase()

    const myAddressSend =
      swap.app.services.auth.accounts[sellCurrencyKey].address ||
      swap.app.services.auth.accounts[sellCurrencyKey].getAddress()

    const myAddressReceive =
      swap.app.services.auth.accounts[buyCurrencyKey].address ||
      swap.app.services.auth.accounts[buyCurrencyKey].getAddress()

    const participantAddressSend = swap.participant[buyCurrencyKey].address
    const participantAddressReceive = swap.participant[sellCurrencyKey].address

    //const isToken = helpers.ethToken.isEthToken({ name: currency })

    const swapIdShortened = swap.id
      .split('-').map(part =>
        parseInt(part) || part
          .split('')
          .reduce((acc, letter, index) => {
            if ([
              0, 1, 2, 3,
              part.length-4, part.length-3, part.length-2, part.length-1
            ].includes(index))
              return acc + letter
            if (index === 4)
              return acc + '…'
            return acc
          }, '')
      ).join('-')


    const takerTx = {
      amount: swap.isMy ? swap.buyAmount : swap.sellAmount,
      currency: swap.isMy ? swap.buyCurrency : swap.sellCurrency,
      hash: flowState.takerTxHash,
      status: !flowState.takerTxHash ?
        SwapTxStatus.Expected
        :
        !flowState.isTakerTxPended ?
          SwapTxStatus.Pending
          :
          SwapTxStatus.Done,
      url: null,
    }
    takerTx.url = takerTx.hash ? helpers.transactions.getLink(takerTx.currency.toLowerCase(), takerTx.hash) : null

    const makerTx = {
      amount: swap.isMy ? swap.sellAmount : swap.buyAmount,
      currency: swap.isMy ? swap.sellCurrency : swap.buyCurrency,
      hash: flowState.makerTxHash,
      status: !flowState.makerTxHash ?
        SwapTxStatus.Expected
        :
        !flowState.isMakerTxPended ?
          SwapTxStatus.Pending
          :
          SwapTxStatus.Done,
      url: null,
    }
    makerTx.url = makerTx.hash ? helpers.transactions.getLink(makerTx.currency.toLowerCase(), makerTx.hash) : null


    const swapStatus: SwapStatus = !flowState.isFinished ? SwapStatus.Pending : SwapStatus.Finished

    return (
      <div styleName="turboSwap">
        <h1 styleName="pageTitle">Turbo swap</h1>
        <div styleName="swapId">#{swapIdShortened}</div>
        <div styleName={`swapStatus ${swapStatus}`}>
          {swapStatus === SwapStatus.Pending &&
            <span>Pending...</span>
          }
          {swapStatus === SwapStatus.Finished &&
            <span>Finished!</span>
          }
        </div>
        <div styleName="blockchain">
          <TxSide
            title={swap.isMy ? 'Taker' : 'You'}
            isTitleHighlighted={!swap.isMy}
            address={swap.isMy ? participantAddressSend : myAddressSend}
          />
          <Tx
            amount={takerTx.amount}
            ticker={takerTx.currency}
            id={takerTx.hash}
            url={takerTx.url}
            direction={'right'}
            status={takerTx.status}
          />
          <TxSide
            title={swap.isMy ? 'You' : 'Maker'}
            isTitleHighlighted={swap.isMy}
            address={swap.isMy ? myAddressReceive : participantAddressReceive}
          />
        </div>
        <div styleName="blockchain">
          <TxSide
            title={swap.isMy ? 'Taker' : 'You'}
            isTitleHighlighted={!swap.isMy}
            address={swap.isMy ? participantAddressReceive : myAddressReceive}
          />
          <Tx
            amount={makerTx.amount}
            ticker={makerTx.currency}
            id={makerTx.hash}
            url={makerTx.url}
            direction={'left'}
            status={makerTx.status}
          />
          <TxSide
            title={swap.isMy ? 'You' : 'Maker'}
            isTitleHighlighted={swap.isMy}
            address={swap.isMy ? myAddressSend : participantAddressSend}
          />
        </div>

        {false && //debug
          <code>
            {JSON.stringify(flowState, null, 2)}
          </code>
        }
      </div>
    )
  }
}
