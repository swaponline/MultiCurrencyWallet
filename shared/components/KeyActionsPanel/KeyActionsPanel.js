import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'
import styles from './KeyActionsPanel.scss'

import CSSModules from 'react-css-modules'
import { isMobile } from 'react-device-detect'

import { constants } from 'helpers'
import { hasNonZeroBalance } from 'helpers/user'
import { WithdrawButton } from 'components/controls'
import { FormattedMessage } from 'react-intl'

import config from 'app-config'

@connect(({
  core: { hiddenCoinsList },
  user: { ethData, btcData, tokensData, eosData, /* xlmData, */ telosData, nimData, usdtData, ltcData },
}) => ({
  hiddenCoinsList,
  currencyBalance: [
    btcData, ethData, eosData, /* xlmData, */ telosData, ltcData, usdtData, ...Object.keys(tokensData).map(k => (tokensData[k])), /* nimData */
  ].map(({ balance, currency }) => ({
    balance,
    name: currency,
  })),
}))
@CSSModules(styles, { allowMultiple: true })
export default class KeyActionsPanel extends Component {

  static propTypes = {
    hiddenCoinsList: PropTypes.array.isRequired,
  }

  static defaultProps = {
    hiddenCoinsList: [],
  }

  handleShowMore = () => {
    actions.modals.open(constants.modals.ShowMoreCoins, {})
  }

  handleDownload = () => {
    const { currencyBalance } = this.props
    const doesCautionPassed = localStorage.getItem(constants.localStorage.wasCautionPassed)
    const hasNonZeroCurrencyBalance = hasNonZeroBalance(currencyBalance)

    if (!doesCautionPassed && hasNonZeroCurrencyBalance/* && process.env.MAINNET */) {
      actions.modals.open(constants.modals.PrivateKeys, {})
      localStorage.setItem(constants.localStorage.wasCautionShown, true)
    } else {
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        actions.modals.open(constants.modals.DownloadModal)
      } else {
        actions.user.downloadPrivateKeys()
      }
    }
  }


  handleImportKeys = () => {
    actions.modals.open(constants.modals.ImportKeys, {})
  }

  handleClear = () => {
    actions.user.getDemoMoney()
  }

  render() {
    const { hiddenCoinsList } = this.props

    return (
      <div styleName="WithdrawButtonContainer">
        { process.env.TESTNET && !isMobile &&
        <WithdrawButton onClick={this.handleClear} >
          <FormattedMessage id="KeyActionsPanel43" defaultMessage="Exit" />
        </WithdrawButton>
        }
        <WithdrawButton data-tut="reactour__save" onClick={this.handleDownload}>
          <FormattedMessage id="KeyActionsPanel46" defaultMessage="Download keys" />
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
      </div>
    )
  }
}
