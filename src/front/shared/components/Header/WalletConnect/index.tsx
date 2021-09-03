import React, { useState, useEffect } from "react";
import { connect } from 'redaction'
import { FormattedMessage } from 'react-intl'
import cssModules from 'react-css-modules'
import styles from './index.scss'

import Button from 'components/controls/Button/Button'
import web3Icons from 'images'

import { metamask } from 'helpers'


const WalletConnect = (props) => {
  const {
    metamaskData
  } = props

  const isMetamaskConnetced = metamaskData.isConnected

  const web3Type = metamask.web3connect.getInjectedType()
  const isNotAvailableMetamaskNetwork = isMetamaskConnetced && !metamask.isAvailableNetwork()
  const disconectedOrNetworkNowAvailable = !isMetamaskConnetced || isNotAvailableMetamaskNetwork

  const connectWallet = () => {
    metamask.handleConnectMetamask({
      dontRedirect: true,
    })
  }

  const disconnectWallet = async () => {
    await metamask.disconnect()
  }

  return (
    <div styleName="connectWallet">
      <Button
        flex small empty
        onClick={
          isMetamaskConnetced ?
            (isNotAvailableMetamaskNetwork ?
              disconnectWallet :
              () => {}) :
            connectWallet
        }
      >
        { disconectedOrNetworkNowAvailable && (
          <img
            styleName="web3Icon"
            src={web3Icons[web3Type]}
            alt={web3Type}
            role="image"
          />
        )}
        <span styleName={`connectWalletText ${disconectedOrNetworkNowAvailable ? 'connectWalletText_hasIcon' : ''}`}>
        {isNotAvailableMetamaskNetwork ?
          <FormattedMessage id="UnknownWeb3Wallet" defaultMessage="Unknown Network" /> :
          isMetamaskConnetced ?
            metamask.getAddress() :
            <FormattedMessage id="ConnectWeb3Wallet" defaultMessage="Сonnect Wallet" />
        }
        </span>
        </Button>
    </div>
  )
}

export default connect(
  ({
    user,
  }) => ({
    metamaskData: user.metamaskData,
  })
)(cssModules(WalletConnect, styles, { allowMultiple: true }))