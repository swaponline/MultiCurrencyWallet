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


import { ITurboSwap, TurboSwapStep, SwapSide, SwapStatus, SwapTxStatus } from 'common/domain/swap'


const takerTxHash = '61c975570a624818615adc8c77a756cc003df7e4a66a91fb8a9bff8f926e15b2'
const makerTxHash = '0xaf8b87662e5fc6824768de522421563799473009c4b34f033831aaeef2e5c7c1'


interface ITurboSwapState {
  swap: Swap
  swapDemo: ITurboSwap
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

/*  wallets: any
  checkingConfirmSuccessTimer: any
  checkingCycleTimer: any*/

  constructor() {
    //@ts-ignore
    super()

    const swapDemo: ITurboSwap = {
      id: '...',
      conditions: {
        mySide: SwapSide.Taker,
        coinA: {
          ticker: 'BTC',
          amount: new BigNumber(0.123),
          takerAddress: '13sC2KJNjDs7CwAifzgWa5XqWaKfShpL2z',
          makerAddress: '18v1YXxJgQ6RA4m4Kmz61RLhRM16RsAb1D',
        },
        coinB: {
          ticker: 'ETH',
          amount: new BigNumber(0.0456),
          takerAddress: '0x1ca43b645886c98d7eb7d27ec16ea59f509cbe1a',
          makerAddress: '0x26352d20e6a05e04a1ecc75d4a43ae9989272621',
        },
      },
      mySide: SwapSide.Taker,
      status: SwapStatus.Pending,
      takerTx: {
        status: SwapTxStatus.Expected,
        hash: null,
      },
      makerTx: {
        status: SwapTxStatus.Expected,
        hash: null,
      }
    }

    this.state = {
      swap: null,
      swapDemo,
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
      //... 
    }))

    setTimeout(() => {
      const swapDemo = {...this.state.swapDemo}
      swapDemo.takerTx = {
        status: SwapTxStatus.Pending,
        hash: takerTxHash
      }
      this.setState({
        swapDemo
      })
    }, 3000)

    setTimeout(() => {
      const swapDemo = {...this.state.swapDemo}
      swapDemo.takerTx = {
        status: SwapTxStatus.Done,
        hash: takerTxHash
      }
      this.setState({
        swapDemo
      })
    }, 6000)

    setTimeout(() => {
      const swapDemo = {...this.state.swapDemo}
      swapDemo.makerTx = {
        status: SwapTxStatus.Pending,
        hash: makerTxHash
      }
      this.setState({
        swapDemo
      })
    }, 9000)

    setTimeout(() => {
      const swapDemo = {...this.state.swapDemo}
      swapDemo.makerTx = {
        status: SwapTxStatus.Done,
        hash: makerTxHash
      },
      swapDemo.status = SwapStatus.Finished
      this.setState({
        swapDemo
      })
    }, 12000)

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
      swapDemo, // todo: remove
      swap,
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


    return (
      <div styleName="turboSwap">
        <h1 styleName="pageTitle">Turbo swap </h1>
        <div styleName="swapId">#{swapIdShortened}</div>
        <div styleName={`swapStatus ${swapDemo.status}`}>
          {swapDemo.status == SwapStatus.Pending &&
            <span>Pending...</span>
          }
          {swapDemo.status == SwapStatus.Finished &&
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
            amount={swap.isMy ? swap.buyAmount : swap.sellAmount}
            ticker={swap.isMy ? swap.buyCurrency : swap.sellCurrency}
            id={swapDemo.takerTx.hash}
            url={'https://google.com'}
            direction={'right'}
            status={swapDemo.takerTx.status}
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
            amount={swap.isMy ? swap.sellAmount : swap.buyAmount}
            ticker={swap.isMy ? swap.sellCurrency : swap.buyCurrency}
            id={swapDemo.makerTx.hash}
            url={'https://google.com'}
            direction={'left'}
            status={swapDemo.makerTx.status}
          />
          <TxSide
            title={swap.isMy ? 'You' : 'Maker'}
            isTitleHighlighted={swap.isMy}
            address={swap.isMy ? myAddressSend : participantAddressSend}
          />
        </div>
        <code>
          {JSON.stringify(swap.flow.state, null, 2)}
        </code>
      </div>
    )
  }
}
