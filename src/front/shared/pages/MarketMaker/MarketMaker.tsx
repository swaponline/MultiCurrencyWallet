import React, { Component, Fragment } from 'react'
import CSSModules from 'react-css-modules'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { constants } from 'helpers'

import SwapApp from 'swap.app'
import Swap from 'swap.swap'

import config from 'helpers/externalConfig'

import styles from './MarketMaker.scss'
import marketmakerStyles from './M.scss'


import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import links from 'helpers/links'

import SwapRow from './SwapRow'





@CSSModules(styles, { allowMultiple: true })
class MarketMaker extends Component<any, any> {
  _mounted = true
  _handleSwapAttachedHandle = null
  _handleSwapEnterStep = null
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

    this._handleSwapAttachedHandle = this.onSwapAttachedHandle.bind(this)
    this._handleSwapEnterStep = this.onSwapEnterStep.bind(this)

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
      createUnixTimeStamp,
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
      createUnixTimeStamp,
      ...state,
    }
  }

  componentDidMount() {
    const swapsIds = []
    const swapsByIds = {}


    const lsSwapId = JSON.parse(localStorage.getItem('swapId'))

    if (lsSwapId === null || lsSwapId.length === 0) {
      return
    }

    const swapsCore = lsSwapId.map((id) => new Swap(id, SwapApp.shared()))

    SwapApp.shared().attachedSwaps.items.forEach((swap) => {
      const swapState = this.extractSwapStatus(swap)
      swapsIds.push(swapState.id)
      swapsByIds[swapState.id] = swapState
    })

    SwapApp.shared().on('swap attached', this._handleSwapAttachedHandle)
    SwapApp.shared().on('swap enter step', this._handleSwapEnterStep)

    this.setState({
      swapsIds,
      swapsByIds,
    })
  }

  onSwapEnterStep(data) {
    if (!this._mounted) return

    const { swap } = data
    const swapState = this.extractSwapStatus(swap)
    const {
      swapsByIds,
    } = this.state
    swapsByIds[swapState.id] = swapState
    this.setState({
      swapsByIds,
    })
  }

  onSwapAttachedHandle(data) {
    if (!this._mounted) return
    const {
      swap,
    } = data

    const {
      swapsIds,
      swapsByIds,
    } = this.state

    if (!swapsByIds[swap.id]) {
      const swapState = this.extractSwapStatus(swap)
      swapsIds.push(swapState.id)
      swapsByIds[swapState.id] = swapState
      this.setState({
        swapsIds,
        swapsByIds,
      })
    }
  }

  componentWillUnmount() {
    this._mounted = false
    SwapApp.shared().off('swap attached', this._handleSwapAttachedHandle)
    SwapApp.shared().off('swap enter step', this._handleSwapEnterStep)
  }

  render() {
    const {
      swapsIds,
      swapsByIds,
    } = this.state

    const sortedSwaps = swapsIds.sort((aId, bId) => {
      return swapsByIds[bId].createUnixTimeStamp - swapsByIds[aId].createUnixTimeStamp
    })
    return (
      <Fragment>
        <table styleName="swapHistory">
          <thead>
            <tr>
              <td>
                <span>You buy</span>
              </td>
              <td>
                <span>Step</span>
              </td>
              <td>
                <span>You sell</span>
              </td>
              <td>
                <span>Lock time</span>
              </td>
              <td>
                <span>Status</span>
              </td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {!!sortedSwaps.length && sortedSwaps.map((swapId, rowIndex) => {
              return (
                <SwapRow
                  key={swapId}
                  row={swapsByIds[swapId]}
                  extractSwapStatus={this.extractSwapStatus}
                />
              )
            })}
            {!sortedSwaps.length && (
              <tr>
                <td colSpan={6}>empty</td>
              </tr>
            )}
          </tbody>
        </table>
      </Fragment>
    )
  }
}

export default injectIntl(MarketMaker)
