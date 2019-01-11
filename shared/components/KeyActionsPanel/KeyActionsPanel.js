import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'
import styles from './KeyActionsPanel.scss'

import CSSModules from 'react-css-modules'

import { constants } from 'helpers'
import { WithdrawButton } from 'components/controls'
import { FormattedMessage } from 'react-intl'


@connect(({ core: { hiddenCoinsList } }) => ({ hiddenCoinsList }))
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
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      actions.modals.open(constants.modals.DownloadModal)
    } else {
      actions.user.downloadPrivateKeys()
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
        { process.env.TESTNET &&
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
          <WithdrawButton onClick={this.handleShowMore}>
            <FormattedMessage id="KeyActionsPanel54" defaultMessage="Hidden coins" />
            ({hiddenCoinsList.length})
          </WithdrawButton>
        }
      </div>
    )
  }
}
