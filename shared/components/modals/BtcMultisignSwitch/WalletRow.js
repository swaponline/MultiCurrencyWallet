import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { connect } from 'redaction'
import helpers, { constants, links } from 'helpers'
import config from 'app-config'
import { isMobile } from 'react-device-detect'

import cssModules from 'react-css-modules'
import styles from './WalletRow.scss'

import { Link } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'

import Coin from 'components/Coin/Coin'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import BtnTooltip from 'components/controls/WithdrawButton/BtnTooltip'
import DropdownMenu from 'components/ui/DropdownMenu/DropdownMenu'
// import LinkAccount from '../LinkAccount/LinkAcount'
// import KeychainStatus from '../KeychainStatus/KeychainStatus'
import { withRouter } from 'react-router'
import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from 'react-intl'
import CurrencyButton from 'components/controls/CurrencyButton/CurrencyButton'
import { relocalisedUrl, localisedUrl } from 'helpers/locale'
import SwapApp from 'swap.app'
import { BigNumber } from 'bignumber.js'



@injectIntl
@cssModules(styles, { allowMultiple: true })

export default class WalletRow extends Component {

  constructor(props) {
    super(props)
  }

  handleOpenDropdown = () => {
    this.setState({
      isDropdownOpen: true
    })
  }

  handleSwitch = () => {
    const { item : { index }, handleFinish } = this.props
    actions.btcmultisig.switchBtcMultisigKey( index )
    handleFinish()
  }

  handleRemove = () => {
    const { item : { index }, handleRefresh } = this.props

    actions.modals.open(constants.modals.Confirm, {
      onAccept: () => {
        actions.btcmultisig.removeBtcMultisigNey( index )
        handleRefresh()
      },
    })
    
  }

  render() {
    const {
      item,
      itemsCount,
      intl: { locale },
    } = this.props

    const {
      address,
      currency,
      balance,
    } = item

    let dropDownMenuItems = [
      {
        id: 1001,
        title: <FormattedMessage id='SwitchBtcMultisigMenuSwitch' defaultMessage='Switch' />,
        action: this.handleSwitch,
        disabled: false,
      },
      {
        id: 1002,
        title: <FormattedMessage id='SwitchBtcMultisigMenuRemove' defaultMessage='Remove' />,
        action: this.handleRemove,
        disabled: false,
      }
    ]

    if (itemsCount === 1) {
      dropDownMenuItems = []
    }
    return (
      <tr>
        <td styleName="assetsTableRow">
          <div styleName="assetsTableCurrency">
            <Coin className={styles.assetsTableIcon} name={currency} />
            <div styleName="assetsTableInfo">
              <div styleName="nameRow">
                {address}
              </div>
              <span>
                <div styleName="no-select-inline">
                  <span>
                    {BigNumber(balance).dp(5, BigNumber.ROUND_FLOOR).toString()}{' '}
                  </span>
                  <span>{currency}</span>
                </div>
              </span>
              <strong>{' '}</strong>
            </div>
          </div>
          { dropDownMenuItems.length > 0 && (
            <div onClick={this.handleOpenDropdown} styleName="assetsTableDots">
              <DropdownMenu
                size="regular"
                className="walletControls"
                items={dropDownMenuItems}
              />
            </div>
          )}
        </td>
      </tr>
    )
  }
}

