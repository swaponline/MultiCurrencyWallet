import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { constants } from 'helpers'
import { FormattedMessage } from 'react-intl'
import web3Icons from 'images/'
import links from 'helpers/links'
import screenIcons from './images'

const isDark = localStorage.getItem(constants.localStorage.isDark)

const SplashScreen = (props) => {
  const { history } = props

  const handlerCreateBtn = () => {
    history.push(links.createWallet)
  }
  
  const handlerConnectBtn = () => {
    history.push(links.connectWallet)
  }

  const handlerRestoreBtn = () => {
    history.push(links.restoreWallet)
  }

  const handlerSkipBtn = () => {
    history.push(links.exchange)
  }

  return (
    <section className="">
      <h2>
        <FormattedMessage
          id="SplashScreenTitle"
          defaultMessage="Simple interface to access blockchains"
        />
      </h2>

      <div>
        <div>
          <img src={screenIcons.WALLET} />
          <p>
            <FormattedMessage
              id="SplashScreenWalletText"
              defaultMessage="Store, send, receive cryptocurrencies (Bitcoin, Ethereum, tokens...) without installation and registration"
            />
          </p>
        </div>

        <div>
          <img src={screenIcons.EXCHANGE} />
          <FormattedMessage
            id="SplashScreenExchangeText"
            defaultMessage="Trade on the decentralized P2P exchange using atomic swap technology"
          />
        </div>
      </div>

      <div>
        <div>
          <button onClick={handlerCreateBtn}>
            <FormattedMessage
              id="AlertModalcreateWallet"
              defaultMessage="Create Wallet"
            />
          </button>

          <button onClick={handlerConnectBtn}>
            <img src={web3Icons.METAMASK} />{' '}
            <FormattedMessage
              id="ImportKeys_ConnectWallet"
              defaultMessage="Connect Wallet"
            />
          </button>
        </div>

        <button onClick={handlerRestoreBtn}>
          <FormattedMessage
            id="ImportKeys_RestoreMnemonic"
            defaultMessage="Restore from 12-word seed"
          />
        </button>

        <button onClick={handlerSkipBtn}>
          <FormattedMessage id="skip" defaultMessage="Skip" />
        </button>
      </div>
    </section>
  )
}

export default CSSModules(SplashScreen, styles, { allowMultiple: true })