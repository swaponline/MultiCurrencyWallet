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



// -----------
import Table from 'components/tables/Table/Table'
//import styles from 'components/tables/Table/Table.scss'
import SwapRow from './SwapsHistory/RowHistory/SwapRow'
// -----------




@CSSModules(stylesHere, { allowMultiple: true })
class MarketMaker extends Component<any, any> {
  _mounted = true

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
      swapsIds: [],
      swapsByIds: {},
    }
  }

  extractSwapStatus(swap) {
    const {
      id,
      isMy,
      isTurbo,
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
    const swapsIds = []
    const swapsByIds = {}


    const lsSwapId = JSON.parse(localStorage.getItem('swapId'))

    if (lsSwapId === null || lsSwapId.length === 0) {
      return
    }

    const swapsCore = lsSwapId.map((id) => new Swap(id, SwapApp.shared()))

    console.log('>>>>>',SwapApp.shared().attachedSwaps.items)

    SwapApp.shared().attachedSwaps.items.forEach((swap) => {
      const swapState = this.extractSwapStatus(swap)
      swapsIds.push(swapState.id)
      swapsByIds[swapState.id] = swapState
    })

    SwapApp.shared().on('swap attached', this.onSwapAttachedHandle.bind(this))
    SwapApp.shared().on('swap enter step', this.onSwapEnterStep.bind(this))

    this.setState({
      swapsIds,
      swapsByIds,
    })

    //
    

  }

  onSwapEnterStep(data) {
    console.log('>>>> SWAP ENTER STEP', data)
    if (!this._mounted) return

    const { swap } = data
    const swapState = this.extractSwapStatus(swap)
    const {
      swapsByIds,
    } = this.state
    this.setState({
      swapsByIds: {
        ...swapsByIds,
        [swapState.id]: swapState
      }
    })
  }

  onSwapAttachedHandle(data) {
    console.log('>>>> SWAP ATTACHED EVENT', data)
    if (!this._mounted) return
    const {
      swap,
    } = data

    const {
      swapsIds,
      swapsByIds,
    } = this.state

    console.log('swap id', swap.id)
    if (!swapsByIds[swap.id]) {
      console.log('>>>>>> NEW SWAP ATTACHED')
      const swapState = this.extractSwapStatus(swap)
      swapsIds.push(swapState.id)

      this.setState({
        swapsIds,
        swapsByIds: {
          ...swapsByIds,
          [swapState.id]: swapState,
        },
      })
    } else {
      console.log('>>>>> swap already attached')
    }
  }

  componentWillUnmount() {
    console.log('History unmounted')
    this._mounted = false
    SwapApp.shared().off('swap attached', this.onSwapAttachedHandle)
    SwapApp.shared().off('swap enter step', this.onSwapEnterStep)
  }

  render() {
    const {
      swapsIds,
      swapsByIds,
    } = this.state

console.log('>>>>>> swapsByIds', swapsByIds)
console.log('>>>>>> swapsIds', swapsIds)
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
      {/*
        { swapsIds.length > 0 &&
          <SwapsHistory swapsIds={swapsIds.reverse()} swapsByIds={swapsByIds} />
        }
      */}
        <Table
          id="table-history"
          rows={swapsIds.reverse()}
          rowRender={(swapId, index) => (
            <SwapRow
              key={swapId}
              row={swapsByIds[swapId]}
            />
          )}
        />
      </Fragment>
    )
  }
}

export default injectIntl(MarketMaker)
