import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import Slider from 'react-slick';
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
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

import security from 'pages/Wallet/components/NotityBlock/images/security.svg'
import mail from 'pages/Wallet/components/NotityBlock/images/mail.svg'
import info from 'pages/Wallet/components/NotityBlock/images/info-solid.svg'



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
      } = itemCurrency

      return {
        token,
        currency,
        address,
        contractAddress,
        decimals,
        balance,
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
    this.getUsdBalance();

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

  getUsdBalance = async () => {
    const { currency } = this.state;

    const exCurrencyRate = await actions.user.getExchangeRate(currency, 'usd')

    console.log('exCurrencyRate', exCurrencyRate)

    this.setState(() => ({
      exCurrencyRate
    }))
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

    let { swapHistory, txHistory, location, match: { params: { fullName } }, intl, hiddenCoinsList, isSigned } = this.props
    const {
      currency,
      balance,
      isClosedNotifyBlockBanner,
      isClosedNotifyBlockSignUp,
      isPrivateKeysSaved,
      exCurrencyRate
    } = this.state

    txHistory = txHistory
      .filter(tx => tx.type.toLowerCase() === currency.toLowerCase())

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


    const currencyUsdBalance = BigNumber(balance).dp(5, BigNumber.ROUND_FLOOR).toString() * exCurrencyRate;

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
        <Slider {...settings}>
          {
            !isPrivateKeysSaved && <NotifyBlock
              className="notifyBlockSaveKeys"
              descr="Before you continue be sure to save your private keys!"
              tooltip="We do not store your private keys and will not be able to restore them"
              icon={security}
              firstBtn="Show my keys"
              firstFunc={this.handleShowKeys}
              secondBtn="I saved my keys"
              secondFunc={this.handleSaveKeys}
            />
          }
          {
            !isSigned && !isClosedNotifyBlockSignUp && <NotifyBlock
              className="notifyBlockSignUp"
              descr="Sign up and get your free cryptocurrency for test!"
              tooltip="You will also be able to receive notifications regarding updates with your account"
              icon={mail}
              firstBtn="Sign Up"
              firstFunc={this.handleSignUp}
              secondBtn="I’ll do this later"
              secondFunc={() => this.handleNotifyBlockClose('isClosedNotifyBlockSignUp')} />
          }
          {
            !isClosedNotifyBlockBanner && <NotifyBlock
              className="notifyBlockBanner"
              descr="Updates"
              tooltip="Let us notify you that the main domain name for Swap.online exchange service will be changed from swap.online to swaponline.io."
              icon={info}
              secondBtn="Close"
              secondFunc={() => this.handleNotifyBlockClose('isClosedNotifyBlockBanner')} />
          }
        </Slider>
        {
          exCurrencyRate ? (
            <Fragment>
              <div styleName="currencyWalletWrapper">
                <div styleName="currencyWalletBalance">
                  <BalanceForm currencyBalance={balance} usdBalance={currencyUsdBalance} handleReceive={this.handleReceive} handleWithdraw={this.handleWithdraw} currency={currency.toLowerCase()} />
                </div>
                {swapHistory.length > 0 && <SwapsHistory orders={swapHistory.filter(item => item.step >= 4)} />}
                <div styleName="currencyWalletActivity">
                  <h3>Activity</h3>
                  {txHistory && (<Table rows={txHistory} styleName="history" rowRender={this.rowRender} />)}
                </div>
              </div>
              {
                seoPage && seoPage.footer && <div>{seoPage.footer}</div>
              }
            </Fragment>
          ) : (
              <div styleName="loader">
                <FormattedMessage id="history107" defaultMessage="Loading" />
                <InlineLoader />
              </div>
            )
        }
      </div>
    )
  }
}