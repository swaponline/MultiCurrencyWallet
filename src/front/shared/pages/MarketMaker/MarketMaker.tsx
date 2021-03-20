import React, { Component, Fragment } from 'react'
import CSSModules from 'react-css-modules'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { constants } from 'helpers'

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
  }

  componentWillUnmount() {
    console.log('History unmounted')
  }

  render() {
    const { swapHistory } = this.props

    const titles = []
    const activeTab = 0

    return (
      <Fragment>
        { swapHistory.length > 0 &&
          <SwapsHistory orders={swapHistory.filter((item) => item.step >= 1)} />
        }
      </Fragment>
    )
  }
}

export default injectIntl(MarketMaker)
