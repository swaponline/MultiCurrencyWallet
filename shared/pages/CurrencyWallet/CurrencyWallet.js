import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import Slider from 'pages/Wallet/components/WallerSlider';
import { Link, withRouter } from 'react-router-dom'

import { links, constants } from 'helpers'

import {aliases} from 'helpers/links'

import CSSModules from 'react-css-modules'
import styles from './CurrencyWallet.scss'

import Row from 'pages/History/Row/Row'
import SwapsHistory from 'pages/History/SwapsHistory/SwapsHistory'

import Table from 'components/tables/Table/Table'
import NotifyBlock from 'pages/Wallet/components/NotityBlock/NotifyBock'
import PageSeo from 'components/Seo/PageSeo'
import { getSeoPage } from 'helpers/seo'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import CurrencyButton from 'components/controls/CurrencyButton/CurrencyButton'
import { localisedUrl } from 'helpers/locale'
import config from 'app-config'
import BalanceForm from 'pages/Wallet/components/BalanceForm/BalanceForm'
import { BigNumber } from 'bignumber.js'
import ContentLoader from 'components/loaders/ContentLoader/ContentLoader'

const isWidgetBuild = config && config.isWidget

const titles = [
  <FormattedMessage id="currencyWallet27" defaultMessage="Coin" />,
  <FormattedMessage id="currencyWallet28" defaultMessage="Status" />,
  <FormattedMessage id="currencyWallet29" defaultMessage="Statement" />,
  <FormattedMessage id="currencyWallet30" defaultMessage="Amount" />,
]

@connect(({ signUp: { isSigned } }) => ({
  isSigned
}))

@connect(({ core, user, history: { transactions, swapHistory }, history,
  user: {
    ethData,
    btcData,
    btcMultisigSMSData,
    btcMultisigUserData,
    bchData,
    ltcData,
    isFetching,
    tokensData, nimData/* usdtOmniData */ } }) => ({
      items: [
        ethData,
        btcData,
        btcMultisigSMSData,
        btcMultisigUserData,
        bchData,
        ltcData, ...Object.keys(tokensData).map(k => (tokensData[k])) /* nimData, usdtOmniData */],
      tokens: [...Object.keys(tokensData).map(k => (tokensData[k]))],
      user,
      historyTx: history,
      hiddenCoinsList: core.hiddenCoinsList,
      txHistory: transactions,
      swapHistory,
      isFetching
    }))

@injectIntl
@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class CurrencyWallet extends Component {

  constructor(props) {
    super(props)

    const {
      match: {
        params: {
          fullName,
          address,
        },
      },
    } = props

    console.log('In address', address)
    this.state = {
      currency: null,
      address: null,
      contractAddress: null,
      decimals: null,
      balance: null,
      isBalanceEmpty: false,
      fullname: null
    }
  }

  static getDerivedStateFromProps({ match: { params: { fullName, address } }, intl: { locale }, items, history, tokens }) {
    // looking for an alias
    if (!address) {
      console.log('no address - return')
      return
    }

    fullName = aliases[fullName.toLowerCase()] ? aliases[fullName.toLowerCase()] : fullName.toLowerCase()

    let item = items.map(item => item.fullName.toLowerCase())
    
    const token = tokens.map(item => item.fullName).includes(fullName.toUpperCase())

    if (item.includes(fullName.toLowerCase())) {
      let itemCurrency = items.filter(item => item.fullName.toLowerCase() === fullName.toLowerCase())[0]

      if (actions.btcmultisig.isBTCSMSAddress(`${address}`)) {
        console.log('Is sms')
        itemCurrency = items.filter(item => item.fullName.toLowerCase() === 'btc (sms-protected)')[0]
        if (!itemCurrency.length) {
          history.push(localisedUrl(locale, `${links.notFound}`))
        } else itemCurrency = itemCurrency[0]
      }
      if (actions.btcmultisig.isBTCMSUserAddress(`${address}`)) {
        console.log('Is ms')
        itemCurrency = items.filter(item => item.fullName.toLowerCase() === 'btc (multisig)')[0]
        if (!itemCurrency.length) {
          history.push(localisedUrl(locale, `${links.notFound}`))
        } else itemCurrency = itemCurrency[0]
      }

      const {
        currency,
        address,
        contractAddress,
        decimals,
        balance,
        infoAboutCurrency
      } = itemCurrency


      return {
        token,
        currency,
        address,
        fullName,
        contractAddress,
        decimals,
        balance,
        infoAboutCurrency,
        isBalanceEmpty: balance === 0,
      }

      this.setState({
        address,
      })
    }
    history.push(localisedUrl(locale, `${links.notFound}`))
  }

  componentDidMount() {

    const { currency, token } = this.state
    let { match: { params: { address = null } } } = this.props

    if (currency) {
      // actions.analytics.dataEvent(`open-page-${currency.toLowerCase()}-wallet`)
    }
    if (token) {
      actions.token.getBalance(currency.toLowerCase())
    }

    this.setLocalStorageItems();
    console.log('componentDidMount', address)
    // if address is null, take transactions from current user
    address ? actions.history.setTransactions(address) : actions.user.setTransactions()

    if(!address)
      actions.core.getSwapHistory()
  }

  setLocalStorageItems = () => {
    const isClosedNotifyBlockBanner = localStorage.getItem(constants.localStorage.isClosedNotifyBlockBanner);
    const isClosedNotifyBlockSignUp = localStorage.getItem(constants.localStorage.isClosedNotifyBlockSignUp);
    const isPrivateKeysSaved = localStorage.getItem(constants.localStorage.privateKeysSaved)
    const walletTitle = localStorage.getItem(constants.localStorage.walletTitle);

    this.setState({
      isClosedNotifyBlockBanner,
      isClosedNotifyBlockSignUp,
      walletTitle,
      isPrivateKeysSaved
    })
  }

  handleReceive = () => {
    const { currency, address } = this.state

    actions.modals.open(constants.modals.ReceiveModal, {
      currency,
      address,
    })
  }

  handleWithdraw = () => {
    
    const {
      currency,
      address,
      contractAddress,
      decimals,
      balance,
      isBalanceEmpty,
    } = this.state

    // actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    let withdrawModal = constants.modals.Withdraw
    if (actions.btcmultisig.isBTCSMSAddress(address)) {
      withdrawModal = constants.modals.WithdrawMultisigSMS
    }
    if (actions.btcmultisig.isBTCMSUserAddress(address)) {
      withdrawModal = constants.modals.WithdrawMultisigUser
    }

    actions.modals.open(withdrawModal, {
      currency,
      address,
      contractAddress,
      decimals,
      balance,
    })
  }

  handleGoWalletHome = () => {
    const { history, intl: { locale } } = this.props

    history.push(localisedUrl(locale, links.wallet))
  }

  handleGoTrade = () => {
    const { currency } = this.state
    const { history, intl: { locale } } = this.props

    history.push(localisedUrl(locale, `${links.pointOfSell}/btc-to-${currency.toLowerCase()}`))
  }

  rowRender = (row, rowIndex) => (
    <Row key={rowIndex} {...row} />
  )

  render() {

    let { swapHistory, txHistory, location, match: { params: { address = null } }, intl, hiddenCoinsList, isSigned, isFetching } = this.props

    const {
      currency,
      balance,
      fullName,
      infoAboutCurrency
    } = this.state
    
    if (txHistory) {
      txHistory = txHistory
        .filter((tx) => {
          if (tx
            && tx.type
          ) {
            return tx.type.toLowerCase() === currency.toLowerCase()
          }
          return false
        })
    }

    swapHistory = Object.keys(swapHistory)
      .map(key => swapHistory[key])
      .filter(swap => swap.sellCurrency === currency || swap.buyCurrency === currency)
      .reverse()

    const seoPage = getSeoPage(location.pathname)

    const titleSwapOnline = defineMessages({
      metaTitle: {
        id: 'CurrencyWalletTitle',
        defaultMessage: 'Swap.Online - {fullName} ({currency}) Web Wallet with Atomic Swap.',
      },
    })
    const titleWidgetBuild = defineMessages({
      metaTitle: {
        id: 'CurrencyWalletWidgetBuildTitle',
        defaultMessage: '{fullName} ({currency}) Web Wallet with Atomic Swap.',
      },
    })
    const title = (isWidgetBuild) ? titleWidgetBuild : titleSwapOnline

    const description = defineMessages({
      metaDescription: {
        id: 'CurrencyWallet154',
        defaultMessage: 'Atomic Swap Wallet allows you to manage and securely exchange ${fullName} (${currency}) with 0% fees. Based on Multi-Sig and Atomic Swap technologies.',
      },
    })

    if (hiddenCoinsList.includes(currency)) {
      actions.core.markCoinAsVisible(currency)
    }

    /** 27.02.2020 не знаю что это такое, но оно не используется, и ломает мне код
     * пока закоментил - через месяц можно удалять
    const isBlockedCoin = config.noExchangeCoins
      .map(item => item.toLowerCase())
      .includes(currency.toLowerCase())
       */

    let currencyUsdBalance;
    let changePercent;

    if(infoAboutCurrency) {
      currencyUsdBalance = BigNumber(balance).dp(5, BigNumber.ROUND_FLOOR).toString() * infoAboutCurrency.price_usd;
      changePercent = infoAboutCurrency.percent_change_1h;
    } else {
      currencyUsdBalance = 0;
    }

    let settings = {
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 6000,
      fade: true,
      slidesToShow: 1,
      slidesToScroll: 1
    };

      // set all show by default
    let showButtons = true

    // is address is exits check access to button
    if (address) {
      // check if current user is owner the address
      showButtons = actions.user.isOwner(address)
    }

    return (
      <div styleName="root">
        <PageSeo
          location={location}
          defaultTitle={intl.formatMessage(title.metaTitle, { fullName, currency })}
          defaultDescription={intl.formatMessage(description.metaDescription, { fullName, currency })} />
        <Slider
          settings={settings}
          isSigned={isSigned}
          handleNotifyBlockClose={this.handleNotifyBlockClose}
          {...this.state}
        />
         { isWidgetBuild && !config.isFullBuild && (
          <ul styleName="widgetNav">
            <li styleName="widgetNavItem" onClick={this.handleGoWalletHome}>
              <a href styleName="widgetNavItemLink">
                <FormattedMessage id="MybalanceswalletNav" defaultMessage="Мой баланс" />
              </a>
            </li>
            <li styleName="widgetNavItem active">
              <a href styleName="widgetNavItemLink">
                <FormattedMessage id="currencyWalletActivity" defaultMessage="Активность {currency}" values={{ fullName, currency }} />
              </a>
            </li>
          </ul>
        )}
        <Fragment>
          <div styleName="currencyWalletWrapper">
            <div styleName="currencyWalletBalance">
              {
                txHistory ? 
                  <BalanceForm 
                    currencyBalance={balance} 
                    usdBalance={currencyUsdBalance} 
                    changePercent={changePercent}
                    address={address}
                    handleReceive={this.handleReceive} 
                    handleWithdraw={this.handleWithdraw}
                    handleExchange={this.handleGoTrade}
                    showButtons={showButtons}
                    currency={currency.toLowerCase()} 
                /> : <ContentLoader leftSideContent />
              }
            </div>
            <div styleName="currencyWalletActivityWrapper">
              {(!actions.btcmultisig.isBTCSMSAddress(`${address}`) && !actions.btcmultisig.isBTCMSUserAddress(`${address}`)) && (
                swapHistory.filter(item => item.step >= 4).length > 0 ? (
                  <div styleName="currencyWalletSwapHistory">
                    <SwapsHistory orders={swapHistory.filter(item => item.step >= 4)} />
                  </div>
                ) : ''
              )}
              {
                txHistory ? (
                  <div styleName="currencyWalletActivity">
                    <h3>
                      {address ? 
                      `Address: ${address}` :  
                      <FormattedMessage id="historyActivity" defaultMessage="Активность" />
                      }
                    </h3>
                    {
                      txHistory.length > 0 ? (
                          <Table rows={txHistory} styleName="history" rowRender={this.rowRender} />
                      ) : <ContentLoader rideSideContent empty inner />
                    }
                  </div>
                ) : <ContentLoader rideSideContent />
              }
            </div>
          </div>
          {
            seoPage && seoPage.footer && <div>{seoPage.footer}</div>
          }
        </Fragment>
      </div>
    )
  }
}