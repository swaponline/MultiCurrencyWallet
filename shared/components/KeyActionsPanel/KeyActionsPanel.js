import React, { Component } from 'react'
import { connect } from 'redaction'
import actions from 'redux/actions'
import { constants } from 'helpers'
import { WithdrawButton } from 'components/controls'

@connect(({ core: { hiddenCoinsList } }) => ({ hiddenCoinsList }))
export default class KeyActionsPanel extends Component {
  handleShowMore = () => {
    actions.modals.open(constants.modals.ShowMoreCoins, {})
  }

  handleDownload = () => {
    actions.user.downloadPrivateKeys()
  }

  handleImportKeys = () => {
    actions.modals.open(constants.modals.ImportKeys, {})
  }

  render() {
    const { hiddenCoinsList } = this.props

    return (
      <div>
        {process.env.TESTNET && <WithdrawButton onClick={this.handleClear} >Exit</WithdrawButton> }
        <WithdrawButton onClick={this.handleDownload}>Download keys</WithdrawButton>
        <WithdrawButton onClick={this.handleImportKeys}>Import keys</WithdrawButton>
        {
          hiddenCoinsList.length !== 0 &&
          <WithdrawButton onClick={this.handleShowMore}>
            Show more coins ({hiddenCoinsList.length})
          </WithdrawButton>
        }
      </div>
    )
  }
}
