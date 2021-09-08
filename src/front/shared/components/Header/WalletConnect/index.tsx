import React, { useState, useEffect } from "react";
import { connect } from 'redaction'
import { FormattedMessage } from 'react-intl'
import cssModules from 'react-css-modules'
import styles from './index.scss'

import Button from 'components/controls/Button/Button'
import Coin from 'components/Coin/Coin'

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

  const currencyName = metamaskData.currency.toLowerCase()

  return (
    <div
      styleName="connectWallet"
      onClick={
        isMetamaskConnetced ?
          (isNotAvailableMetamaskNetwork ?
            disconnectWallet :
            () => {}) :
          connectWallet
      }
    >
      {disconectedOrNetworkNowAvailable ?
        <Coin
          size={40}
          name={web3Type}
        /> :
        <Coin
          size={30}
          name={currencyName}
        />
      }
      <span styleName={`connectWalletText ${disconectedOrNetworkNowAvailable ? '' : 'hasCoinIcon'}`}>
        {isNotAvailableMetamaskNetwork ?
          <FormattedMessage id="UnknownWeb3Wallet" defaultMessage="Unknown Network" /> :
          isMetamaskConnetced ?
            metamask.getShortAddress() :
            <FormattedMessage id="ConnectWeb3Wallet" defaultMessage="Сonnect Wallet" />
        }
      </span>
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