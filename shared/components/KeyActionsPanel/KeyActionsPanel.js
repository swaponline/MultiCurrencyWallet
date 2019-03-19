import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'
import styles from './KeyActionsPanel.scss'

import CSSModules from 'react-css-modules'
import { isMobile } from 'react-device-detect'

import { constants } from 'helpers'
import { WithdrawButton } from 'components/controls'
import { FormattedMessage } from 'react-intl'
import SwapApp from 'swap.app'

import config from 'app-config'


@connect(({
  rememberedOrders,
  core: { hiddenCoinsList },
  history: { swapHistory },
}) => ({
  hiddenCoinsList,
  decline: rememberedOrders.savedOrders,
  swapHistory,
}))
@CSSModules(styles, { allowMultiple: true })
export default class KeyActionsPanel extends Component {

  static propTypes = {
    hiddenCoinsList: PropTypes.array.isRequired,
  }

  static defaultProps = {
    hiddenCoinsList: [],
  }

  state = {
    desclineOrders: [],
  }

  componentDidMount() {
    let timer
    this.timer = setInterval(() => {
      this.getCorrectDecline()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  getCorrectDecline = () => {
    const { decline, swapHistory } = this.props

    if (!localStorage.savedOrders) {
      return
    }

    if (localStorage.savedOrders.length > 0) {
      const desclineOrders = []

      decline.forEach(item => {
        const order = actions.core.getSwapById(item)

        if (!order.flow.state.isSwapExist && !order.isMy && order.flow.state.step >= 4) {
          desclineOrders.push(order)
        }
      })
      this.setState(() => ({
        desclineOrders,
      }))
    }

  }

  handleShowMore = () => {
    actions.modals.open(constants.modals.ShowMoreCoins, {})
  }

  handleShowKeys = () => {
    const doesCautionPassed = localStorage.getItem(constants.localStorage.wasCautionPassed)

    if (!doesCautionPassed) {
      actions.modals.open(constants.modals.PrivateKeys, {})
    } else {
      actions.modals.open(constants.modals.DownloadModal)
    }
  }


  handleImportKeys = () => {
    actions.modals.open(constants.modals.ImportKeys, {})
  }

  handleClear = () => {
    actions.user.getDemoMoney()
  }

  handleShowIncomplete = (decline) => {
    const { desclineOrders } = this.state
    actions.modals.open(constants.modals.IncompletedSwaps, {
      desclineOrders,
    })
  }

  render() {
    const { hiddenCoinsList, decline } = this.props
    const { desclineOrders } = this.state

    return (
      <div styleName="WithdrawButtonContainer">
        { process.env.TESTNET && !isMobile &&
        <WithdrawButton onClick={this.handleClear} >
          <FormattedMessage id="KeyActionsPanel43" defaultMessage="Exit" />
        </WithdrawButton>
        }
        <WithdrawButton data-tut="reactour__save" onClick={this.handleShowKeys}>
          <FormattedMessage id="KeyActionsPanel46" defaultMessage="Show my keys" />
        </WithdrawButton>
        <WithdrawButton onClick={this.handleImportKeys}>
          <FormattedMessage id="KeyActionsPanel49" defaultMessage="Import keys" />
        </WithdrawButton>
        {
          (config && !config.isWidget) && (
            <WithdrawButton onClick={this.handleShowMore}>
              <FormattedMessage id="KeyActionsPanel73" defaultMessage="Hidden coins ({length})" values={{ length: `${hiddenCoinsList.length}` }} />
            </WithdrawButton>
          )
        }
        {desclineOrders.length > 0 &&
          <WithdrawButton onClick={() => this.handleShowIncomplete(decline)}>
            <FormattedMessage id="KeyActionsPane74" defaultMessage="incomplete swap ({length})" values={{ length: `${desclineOrders.length}` }} />
          </WithdrawButton>
        }
      </div>
    )
  }
}
