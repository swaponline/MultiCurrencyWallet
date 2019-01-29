import React, { Component } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { links } from 'helpers'
import { isMobile } from 'react-device-detect'

import CSSModules from 'react-css-modules'
import styles from './SwapList.scss'

import SwapListItem from './SwapListItem/SwapListItem'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles, { allowMultiple: true })
export default class SwapList extends Component {

  static propTypes = {
    data: PropTypes.object,
  }

  static defaultProps = {
    data: {},
    whiteLogo: false,
  }

  constructor({ flow, step, swap, styles }) {
    super()

    this.swap = swap

    this.state = {
      swap,
      flow: this.swap.flow.state,
    }
  }

  componentDidMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  handleFlowStateUpdate = (values) => {
    this.setState({
      flow: values,
    })
  }

  render() {
    const { data: { step }, sellCurrency, buyCurrency } = this.props
    const { flow, swap: { flow : { stepNumbers } } } = this.state
    let stepListArraySellCurrancy = [
      {
        current : 1,
        start: stepNumbers['sign'],
        stop: stepNumbers[`lock-${sellCurrency.toLowerCase()}`],
        padding: 0,
        text: 'Confirmation processing Sell',
      },
      {
        current : 2,
        start: stepNumbers[`lock-${sellCurrency.toLowerCase()}`],
        stop: stepNumbers[`wait-lock-${buyCurrency.toLowerCase()}`],
        padding: 50,
        text: `${sellCurrency} deposition`,
      },
      {
        current : 3,
        start: stepNumbers[`wait-lock-${buyCurrency.toLowerCase()}`],
        stop: stepNumbers[`withdraw-${buyCurrency.toLowerCase()}`],
        padding: 100,
        text: `${buyCurrency} deposition`,
      },
      {
        current : 4,
        start: stepNumbers[`withdraw-${buyCurrency.toLowerCase()}`],
        stop: stepNumbers['finish'],
        padding: 150,
        text: `Withdrawing ${buyCurrency} from a contract`,
      },
      {
        current : 5,
        start: stepNumbers['finish'],
        stop: stepNumbers['end'],
        padding: 200,
        text: 'Finished!',
      },
    ]


    let stepListArrayBuyCurrancy = [
      {
        current : 1,
        start: stepNumbers['sign'],
        stop: stepNumbers[`wait-lock-${buyCurrency.toLowerCase()}`],
        padding: 0,
        text: 'Confirmation processing Buy',
      },
      {
        current : 2,
        start: stepNumbers[`wait-lock-${buyCurrency.toLowerCase()}`],
        stop: stepNumbers[`lock-${sellCurrency.toLowerCase()}`],
        padding: 50,
        text: `${sellCurrency} deposition`,
      },
      {
        current : 3,
        start: stepNumbers[`lock-${sellCurrency.toLowerCase()}`],
        stop: stepNumbers[`wait-withdraw-${sellCurrency.toLowerCase()}`],
        padding: 100,
        text: `${buyCurrency} deposition`,
      },
      {
        current : 4,
        start: stepNumbers[`wait-withdraw-${sellCurrency.toLowerCase()}`],
        stop: stepNumbers[`withdraw-${buyCurrency.toLowerCase()}`],
        padding: 150,
        text: `Withdrawing ${buyCurrency} from a contract`,
      },
      {
        current : 5,
        start: stepNumbers[`withdraw-${buyCurrency.toLowerCase()}`],
        stop: stepNumbers['finish'],
        padding: 200,
        text: 'Finished!',
      },
    ]

    return (
      <div styleName="stepList">
        {sellCurrency === 'BTC' 
          ? stepListArraySellCurrancy.map(item => <div key={item.current}><SwapListItem flow={flow} swap={swap} listItem={item} /></div>)
          : stepListArrayBuyCurrancy.map(item => <div key={item.current}><SwapListItem flow={flow} swap={swap} listItem={item} /></div>) 
        }
      </div>
    )
  }
}
