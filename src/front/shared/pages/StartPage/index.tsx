import React from 'react'
import { Link } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { constants, utils, links } from 'helpers'
import config from "helpers/externalConfig"
import { FormattedMessage } from 'react-intl'
import web3Icons, { regularIcons } from 'images'

const isDark = localStorage.getItem(constants.localStorage.isDark)

const StartPage = (props) => {
  const { closeStartPage } = props

  // if (config.entry === 'testnet') {
  //   window.preloaderVisitorImage1 = regularIcons.WALLET_PREVIEW
  //   window.preloaderVisitorTitle1 = 'Store, send, receive cryptocurrencies (Bitcoin, Ethereum, tokens...) without installation and registration'
  //   window.preloaderVisitorImage2 = regularIcons.EXCHANGE_PREVIEW
  //   window.preloaderVisitorTitle2 = 'Trade on the decentralized P2P exchange using atomic swap technology'
  // }

  const getYearSeconds = () => {
    const date = new Date()
    const daysInThisMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    // 60 second * 60 minutes * 24 hours * daysInThisMonth * 12 months
    return 60 * 60 * 24 * daysInThisMonth * 12
  }

  const linkHandler = () => {
    utils.setCookie('swapDisalbeStarter', 'true', {
      expires: getYearSeconds(),
    })

    closeStartPage()
  }

  return (
    <section styleName={`startPage ${isDark ? 'dark' : ''}`}>
      <h2 styleName="title">
        <FormattedMessage
          id="SplashScreenTitle"
          defaultMessage="Simple interface to access blockchains"
        />
      </h2>

      <div styleName="infoWrapper">
        <div styleName="infoBlock">
          <img src={window.preloaderVisitorImage1} alt="Wallet preview" />
          <p>
            {window.preloaderVisitorTitle1}
            {/* <FormattedMessage
              id="SplashScreenWalletText"
              defaultMessage="Store, send, receive cryptocurrencies (Bitcoin, Ethereum, tokens...) without installation and registration"
            /> */}
          </p>
        </div>

        <div styleName="infoBlock">
          <img src={window.preloaderVisitorImage2} alt="Exchange preview" />
          <p>
            {window.preloaderVisitorTitle2}
            {/* <FormattedMessage
              id="SplashScreenExchangeText"
              defaultMessage="Trade on the decentralized P2P exchange using atomic swap technology"
            /> */}
          </p>
        </div>
      </div>

      <div styleName="buttonsWrapper">
        <div styleName="topButtons">
          <Link styleName="button" to={links.createWallet} onClick={linkHandler}>
            <FormattedMessage
              id="AlertModalcreateWallet"
              defaultMessage="Create Wallet"
            />
          </Link>

          <Link styleName="button" to={links.connectWallet} onClick={linkHandler}>
            <img styleName="connectIcon" src={web3Icons.METAMASK} />
            {' '}
            <FormattedMessage
              id="ImportKeys_ConnectWallet"
              defaultMessage="Connect Wallet"
            />
          </Link>
        </div>

        <Link styleName="restoreButton" to={links.restoreWallet} onClick={linkHandler}>
          <FormattedMessage
            id="ImportKeys_RestoreMnemonic"
            defaultMessage="Restore from 12-word seed"
          />
        </Link>

        <Link styleName="skipButton" to={links.exchange} onClick={linkHandler}>
          <FormattedMessage id="skip" defaultMessage="Skip" />
        </Link>
      </div>
    </section>
  )
}

export default CSSModules(StartPage, styles, { allowMultiple: true })