import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'
import styles from './KeyActionsPanel.scss'

import CSSModules from 'react-css-modules'
import { isMobile } from 'react-device-detect'

import { constants, ethToken } from 'helpers'
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
    this.getCorrectDecline()
  }

  getFlowById = (swapId) => JSON.parse(localStorage.getItem(`swap:flow.${swapId}`) || 0)
  getSwapById = (swapId) => JSON.parse(localStorage.getItem(`swap:swap.${swapId}`) || 0)
  checkSwapTimeout = (swapData, timeoutUTS) => {
    return !((swapData.createUnixTimeStamp + timeoutUTS) > Math.floor(new Date().getTime() / 1000))
  }

  getCorrectDecline = () => {
    const { decline, swapHistory } = this.props

    const localSavedOrdersString = localStorage.getItem('savedOrders')

    if (!localSavedOrdersString) {
      return
    }

    const localSavedOrders = JSON.parse(localSavedOrdersString)

    if (localSavedOrders.length !== decline.length) {
      return
    }

    const desclineOrders = []

    decline.forEach(swapId => {
      try {
        const flow = this.getFlowById(swapId)
        const swap = this.getSwapById(swapId)

        if (!flow || !swap) {
          throw new Error(`getCorrectDecline: swap is not saved ${swapId}`)
        }

        const {
          step,
          isRefunded,
          isFinished,
          isStoppedSwap,
          btcScriptCreatingTransactionHash,
          ethSwapCreationTransactionHash,
        } = flow

        const { sellCurrency } = swap

        const isCurrencyEthOrEthToken = ethToken.isEthOrEthToken({ name: sellCurrency })

        const isSwapTimeout = this.checkSwapTimeout( swap, 60 * 60 * 3)
        const isIncompleteSwap = !(isRefunded || isFinished || isStoppedSwap || isSwapTimeout)
        const isStartedSwap = isCurrencyEthOrEthToken
          ? step >= 4 && btcScriptCreatingTransactionHash
          : step >= 5 && ethSwapCreationTransactionHash

        if (isIncompleteSwap && isIncompleteSwap) {
          desclineOrders.push(actions.core.getSwapById(swapId))
        }
      } catch (error) {
        console.error('getCorrectDecline:', error)
      }
    })
    this.setState(() => ({
      desclineOrders,
    }))
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

  handleUseKeychain = () => {
    actions.modals.open(constants.modals.Keychain)
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
              <FormattedMessage id="KeyActionsPanel73" defaultMessage="Hide / Add Coins" values={{ length: `${hiddenCoinsList.length}` }} />
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
