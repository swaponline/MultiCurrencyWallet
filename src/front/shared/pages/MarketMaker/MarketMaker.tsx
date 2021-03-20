import React, { Component, Fragment } from 'react'
import CSSModules from 'react-css-modules'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { constants } from 'helpers'

import SwapApp from 'swap.app'


import config from 'helpers/externalConfig'

import styles from 'components/tables/Table/Table.scss'
import stylesHere from '../History/History.scss'

import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import links from 'helpers/links'

import SwapsHistory from 'pages/History/SwapsHistory/SwapsHistory'

@connect(({
  history: {
    swapHistory,
  },
}) => ({
  swapHistory,
}))
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
    }
  }


  componentDidMount() {
    actions.core.getSwapHistory()
    SwapApp.shared().on('new swap', (data) => {
      console.log('>>>> NEW EVENT', data)
      actions.core.getSwapHistory()
    })
    SwapApp.shared().on('swap enter step', (data) => {
      console.log('>>>> SWAP ENTER STEP', data)
      actions.core.getSwapHistory()
    })
  }

  componentWillUnmount() {
    console.log('History unmounted')
  }

  render() {
    const { swapHistory } = this.props

    const attachedSwaps = SwapApp.shared().attachedSwaps

console.log('>>>> swapHistory', swapHistory)
    const swaps = (swapHistory.filter) ? swapHistory.filter((item) => {
      if (item.step >= 1) return true
      if (!item.isFinished) return true

      return false
    }) : []

    console.log('>>>>> swapHistory', swapHistory, swaps)

    const titles = []
    const activeTab = 0

    return (
      <Fragment>
        { swaps.length > 0 &&
          <SwapsHistory orders={swaps} swapRowRender={true} />
        }
      </Fragment>
    )
  }
}

export default injectIntl(MarketMaker)
