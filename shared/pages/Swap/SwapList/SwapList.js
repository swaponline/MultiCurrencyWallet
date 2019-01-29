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
    let stepListArray = [
      {
        current : 1,
        start: 1,
        stop: 2,
        padding: 0,
        text: 'Confirmation processing',
      },
      {
        current : 2,
        start: 2,
        stop: 5,
        padding: 50,
        text: `${sellCurrency === 'BTC' ? sellCurrency : buyCurrency} deposition`,
      },
      {
        current : 3,
        start: 5,
        stop: 6,
        padding: 100,
        text: `${sellCurrency === 'BTC' ? buyCurrency : sellCurrency} deposition`,
      },
      {
        current : 4,
        start: 6,
        stop: 7,
        padding: 150,
        text: `Withdrawing ${buyCurrency} from a contract`,
      },
      {
        current : 5,
        start: 7,
        stop: 8,
        padding: 200,
        text: 'Finished!',
      },
    ]

    return (
      <div styleName="stepList">
        {stepListArray.map(item => <div key={item.current}><SwapListItem flow={flow} swap={swap} listItem={item} /></div>)}
      </div>
    )
  }
}
