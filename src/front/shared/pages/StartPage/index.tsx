import React from 'react'
import { Link } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { links} from 'helpers'
import { constants } from 'helpers'
import { FormattedMessage } from 'react-intl'
import web3Icons, { regularIcons } from 'images'

const isDark = localStorage.getItem(constants.localStorage.isDark)

const StartPage = (props) => {
  const { closeStartPage } = props

  const getYearSeconds = () => {
    const date = new Date()
    const daysInThisMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    // 60 second * 60 minutes * 24 hours * daysInThisMonth * 12 months
    return 60 * 60 * 24 * daysInThisMonth * 12
  }

  const linkHandler = () => {
    setCookie({
      name: 'swapDisalbeStarter',
      value: 'true',
      options: {
        expires: getYearSeconds(),
      },
    })

    closeStartPage()
  }

  const setCookie = (params) => {
    const { name, value, options = {} } = params
    const encodeValue = encodeURIComponent(value)
    let expires = options.expires

    if (typeof expires === 'number' && expires) {
      let date = new Date()

      date.setTime(date.getTime() + expires * 1000)
      expires = options.expires = date
    }

    if (expires && expires.toUTCString) {
      options.expires = expires.toUTCString()
    }

    let updatedCookie = name + '=' + encodeValue

    for (let propName in options) {
      updatedCookie += '; ' + propName

      if (options[propName] !== true) {
        updatedCookie += '=' + options[propName]
      }
    }

    document.cookie = updatedCookie
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
          <img src={regularIcons.WALLET_PREVIEW} />
          <p>
            <FormattedMessage
              id="SplashScreenWalletText"
              defaultMessage="Store, send, receive cryptocurrencies (Bitcoin, Ethereum, tokens...) without installation and registration"
            />
          </p>
        </div>

        <div styleName="infoBlock">
          <img src={regularIcons.EXCHANGE_PREVIEW} />
          <p>
            <FormattedMessage
              id="SplashScreenExchangeText"
              defaultMessage="Trade on the decentralized P2P exchange using atomic swap technology"
            />
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