import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import Slider from 'pages/Wallet/components/WallerSlider';
import { Link, withRouter } from 'react-router-dom'

import { links, constants } from 'helpers'

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

  constructor() {
    super()

    this.state = {
      currency: null,
      address: null,
      contractAddress: null,
      decimals: null,
      balance: null,
      isBalanceEmpty: false,
    }
  }

  static getDerivedStateFromProps({ match: { params: { fullName } }, intl: { locale }, items, history, tokens }) {
    const item = items.map(item => item.fullName.toLowerCase())
    const token = tokens.map(item => item.fullName).includes(fullName.toUpperCase())

    if (item.includes(fullName.toLowerCase())) {
      const itemCurrency = items.filter(item => item.fullName.toLowerCase() === fullName.toLowerCase())[0]

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
        contractAddress,
        decimals,
        balance,
        infoAboutCurrency,
        isBalanceEmpty: balance === 0,
      }
    }
    history.push(localisedUrl(locale, `${links.notFound}`))
  }

  componentDidMount() {
    const { currency, token } = this.state

    if (currency) {
      // actions.analytics.dataEvent(`open-page-${currency.toLowerCase()}-wallet`)
    }
    if (token) {
      actions.token.getBalance(currency.toLowerCase())
    }

    this.setLocalStorageItems();

    actions.user.setTransactions()
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
    let { match: { params: { fullName } }, items } = this.props
    const {
      currency,
      address,
      contractAddress,
      decimals,
      balance,
      isBalanceEmpty,
    } = this.state

    // actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    actions.modals.open(constants.modals.Withdraw, {
      currency,
      address,
      contractAddress,
      decimals,
      balance,
    })
  }

  handleGoTrade = (currency) => {
    const { intl: { locale } } = this.props
    const whatDoUserProbablyWantToBuy = currency.toLowerCase()

    this.props.history.push(localisedUrl(locale, `${links.exchange}/${currency.toLowerCase()}-to-${whatDoUserProbablyWantToBuy}`))
  }

  rowRender = (row) => (
    <Row key={row.hash} {...row} />
  )

  render() {

    let { swapHistory, txHistory, location, match: { params: { fullName } }, intl, hiddenCoinsList, isSigned, isFetching } = this.props
    const {
      currency,
      balance,
      infoAboutCurrency
    } = this.state

    if (txHistory) {
      txHistory = txHistory
        .filter(tx => tx.type.toLowerCase() === currency.toLowerCase())
    }


    swapHistory = Object.keys(swapHistory)
      .map(key => swapHistory[key])
      .filter(swap => swap.sellCurrency === currency || swap.buyCurrency === currency)

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

    const isBlockedCoin = config.noExchangeCoins
      .map(item => item.toLowerCase())
      .includes(currency.toLowerCase())

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
        <Fragment>
          <div styleName="currencyWalletWrapper">
            <div styleName="currencyWalletBalance">
              {
                txHistory ? 
                  <BalanceForm 
                    currencyBalance={balance} 
                    usdBalance={currencyUsdBalance} 
                    changePercent={changePercent}
                    handleReceive={this.handleReceive} 
                    handleWithdraw={this.handleWithdraw} 
                    currency={currency.toLowerCase()} 
                /> : <ContentLoader leftSideContent />
              }
            </div>
            <div styleName="currencyWalletActivityWrapper">
              {
                swapHistory.filter(item => item.step >= 4).length > 0 ? (
                  <div styleName="currencyWalletSwapHistory">
                    <SwapsHistory orders={swapHistory.filter(item => item.step >= 4)} />
                  </div>
                ) : ''
              }
              {
                txHistory ? (
                  <div styleName="currencyWalletActivity">
                    <h3>
                      <FormattedMessage id="historyActivity" defaultMessage="Активность" />
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