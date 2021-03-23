import React, { Component, Fragment } from 'react'
import CSSModules from 'react-css-modules'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { constants } from 'helpers'

import SwapApp from 'swap.app'
import Swap from 'swap.swap'

import config from 'helpers/externalConfig'

import styles from 'components/tables/Table/Table.scss'
import stylesHere from '../History/History.scss'

import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import links from 'helpers/links'

import SwapsHistory from './SwapsHistory/SwapsHistory'

@CSSModules(stylesHere, { allowMultiple: true })
class MarketMaker extends Component<any, any> {

  constructor(props) {
    super(props)


    const {
      items,
      match: {
        params: {
          page = null,
        }
      }
    } = props

    

    this.state = {
      page,
      swaps: [],
      swapsIds: {},
    }
  }

  extractSwapStatus(swap) {
    const {
      id,
      isMy,
      buyCurrency,
      sellCurrency,
      buyAmount,
      sellAmount,
      flow: {
        state,
      },
    } = swap
    return {
      id,
      isMy,
      buyCurrency,
      sellCurrency,
      buyAmount,
      sellAmount,
      ...state,
    }
  }

  componentDidMount() {
    //
    const swaps = []
    const swapsIds = {}


    const lsSwapId = JSON.parse(localStorage.getItem('swapId'))

    if (lsSwapId === null || lsSwapId.length === 0) {
      return
    }

    const swapsCore = lsSwapId.map((id) => new Swap(id, SwapApp.shared()))
    console.log('>>>>>',SwapApp.shared().attachedSwaps.items)
    SwapApp.shared().attachedSwaps.items.forEach((swap) => {
      const swapState = this.extractSwapStatus(swap)
      swaps.push(swapState.id)
      swapsIds[swapState.id] = swapState
    })

    this.setState({
      swaps,
      swapsIds,
    })
    //
    SwapApp.shared().on('swap attached', (data) => {
      console.log('>>>> SWAP ATTACHED EVENT', data)


    })
    SwapApp.shared().on('swap enter step', (data) => {
      console.log('>>>> SWAP ENTER STEP', data)

    })

  }

  componentWillUnmount() {
    console.log('History unmounted')
  }

  render() {
    const {
      swaps,
      swapsIds,
    } = this.state
    const attachedSwaps = SwapApp.shared().attachedSwaps.items

console.log('>>>> swapHistory', swaps)
/*
    const swaps = (swapHistory.filter) ? swapHistory.filter((item) => {
      if (item.step >= 1) return true
      if (!item.isFinished) return true

      return false
    }) : []

    console.log('>>>>> swapHistory', attachedSwaps)
    */

    return (
      <Fragment>
        { swapsIds.length > 0 &&
          <SwapsHistory swapsIds={swaps} swapsByIds={swapsIds} />
        }
      </Fragment>
    )
  }
}

export default injectIntl(MarketMaker)
