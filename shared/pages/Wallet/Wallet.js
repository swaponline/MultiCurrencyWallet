import React, { Component, Fragment } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Wallet.scss'
import { isMobile } from 'react-device-detect'
import moment from 'moment'
import firestore from 'helpers/firebase/firestore'

import History from 'pages/History/History'

import { links, constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { getActivatedCurrencies } from 'helpers/user'
import ReactTooltip from 'react-tooltip'
import ParticalClosure from '../PartialClosure/PartialClosure'

import { FormattedMessage, injectIntl } from 'react-intl'

import config from 'app-config'
import { withRouter } from 'react-router'
import BalanceForm from './components/BalanceForm/BalanceForm'
import CurrenciesList from './CurrenciesList'
import Button from 'components/controls/Button/Button'
import ContentLoader from '../../components/loaders/ContentLoader/ContentLoader'

const isWidgetBuild = config && config.isWidget

const walletNav = [
  {
    key: 'My balances',
    text: <FormattedMessage id="MybalanceswalletNav" defaultMessage="Мой баланс" />
  },
  {
    key: 'Transactions',
    text: <FormattedMessage id="TransactionswalletNav" defaultMessage="Активность" />
  }
]

@connect(
  ({
    core: { hiddenCoinsList },
    user: {
      ethData,
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      bchData,
      tokensData,
      ltcData, // usdtOmniData, // qtumData,
      // nimData,
      // xlmData,
      isFetching
    },
    currencies: { items: currencies },
    createWallet: { currencies: assets }
  }) => {
    let widgetMultiTokens = []
    if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
      Object.keys(window.widgetERC20Tokens).forEach(key => {
        widgetMultiTokens.push(key.toUpperCase())
      })
    }
    const tokens =
      config && config.isWidget
        ? window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length
          ? widgetMultiTokens
          : [config.erc20token.toUpperCase()]
        : Object.keys(tokensData).map(k => tokensData[k].currency)

    const tokensItems = Object.keys(tokensData).map(k => tokensData[k])

    const allData = [
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      ethData,
      bchData,
      ltcData,
      //qtumData,
      // xlmData,
      // usdtOmniData,
      ...Object.keys(tokensData).map(k => tokensData[k])
    ].map(({ account, keyPair, ...data }) => ({
      ...data
    }))

    const items = (config && config.isWidget
      ? [
          btcData,
          ethData
          // usdtOmniData,
        ]
      : [
          btcData,
          btcMultisigSMSData,
          btcMultisigUserData,
          bchData,
          ethData,
          ltcData
          // qtumData,
          // usdtOmniData,
          // nimData,
          // xlmData,
        ]
    ).map(data => data.currency)

    const currencyBalance = [
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      bchData,
      ethData,
      ltcData
      // qtumData,
      // usdtOmniData,
      // nimData,
      // xlmData,
    ].map(({ balance, currency, infoAboutCurrency }) => ({
      balance,
      infoAboutCurrency,
      name: currency
    }))

    return {
      tokens,
      items,
      allData,
      tokensItems,
      currencyBalance,
      currencies,
      assets,
      isFetching,
      hiddenCoinsList: hiddenCoinsList,
      userEthAddress: ethData.address,
      tokensData: {
        ethData,
        btcData,
        btcMultisigSMSData,
        btcMultisigUserData,
        bchData,
        ltcData
        // qtumData,
        // usdtOmniData,
      }
    }
  }
)
@injectIntl
@withRouter
@connect(({ signUp: { isSigned } }) => ({
  isSigned
}))
@cssModules(styles, { allowMultiple: true })
export default class Wallet extends Component {
  constructor(props) {
    super(props)
    this.balanceRef = React.createRef() // Create a ref object
  }

  state = {
    activeView: 0,
    btcBalance: 0,
    activeCurrency: 'usd',
    exchangeForm: false,
    walletTitle: 'Wallet',
    editTitle: false,
    enabledCurrencies: getActivatedCurrencies()
  }

  componentWillMount() {
    actions.user.getBalances()
  }

  componentDidMount() {
    const { params, url } = this.props.match

    if (url.includes('withdraw')) {
      this.handleWithdraw(params)
    }
    this.getInfoAboutCurrency()
    this.setLocalStorageItems()
    this.getBanners()

    if (isMobile) {
      this.balanceRef.current.scrollIntoView({
        block: 'start'
      })
    }
  }

  getBanners = () =>
    axios
      .get('https://noxon.wpmix.net/swapBanners/banners.php')
      .then(result => {
        this.setState({
          banners: result.data
        })
      })
      .catch(error => {
        console.error('getBanners:', error)
      })

  getInfoAboutCurrency = async () => {
    const { currencies } = this.props
    const currencyNames = currencies.map(({ name }) => name)

    await actions.user.getInfoAboutCurrency(currencyNames)
  }

  handleNavItemClick = index => {
    if (index === 1) {
      // fetch actual tx list
      actions.user.setTransactions()
      actions.core.getSwapHistory()
    }

    this.setState({
      activeView: index
    })
  }

  handleSaveKeys = () => {
    actions.modals.open(constants.modals.PrivateKeys)
  }

  handleShowKeys = () => {
    actions.modals.open(constants.modals.DownloadModal)
  }

  handleImportKeys = () => {
    actions.modals.open(constants.modals.ImportKeys, {})
  }

  setLocalStorageItems = () => {
    const isClosedNotifyBlockBanner = localStorage.getItem(constants.localStorage.isClosedNotifyBlockBanner)
    const isClosedNotifyBlockSignUp = localStorage.getItem(constants.localStorage.isClosedNotifyBlockSignUp)
    const isPrivateKeysSaved = localStorage.getItem(constants.localStorage.isPrivateKeysSaved)
    const walletTitle = localStorage.getItem(constants.localStorage.walletTitle)

    this.setState({
      isClosedNotifyBlockBanner,
      isClosedNotifyBlockSignUp,
      walletTitle,
      isPrivateKeysSaved
    })
  }

  onLoadeOn = fn => {
    this.setState({
      isFetching: true
    })

    fn()
  }

  handleNotifyBlockClose = state => {
    console.log('state', state)
    this.setState({
      [state]: true
    })
    localStorage.setItem(constants.localStorage[state], 'true')
  }

  handleWithdraw = params => {
    const { allData } = this.props
    const { address, amount } = params
    const item = allData.find(({ currency }) => currency.toLowerCase() === params.currency.toLowerCase())

    actions.modals.open(constants.modals.Withdraw, {
      ...item,
      toAddress: address,
      amount
    })
  }

  goToСreateWallet = () => {
    const {
      history,
      intl: { locale }
    } = this.props

    history.push(localisedUrl(locale, links.createWallet))
  }

  handleGoExchange = () => {
    const {
      history,
      intl: { locale }
    } = this.props

    if (isWidgetBuild && !config.isFullBuild) {
      history.push(localisedUrl(locale, links.pointOfSell))
    } else {
      history.push(localisedUrl(locale, links.exchange))
    }
  }

  handleEditTitle = () => {
    this.setState({
      editTitle: true
    })
  }

  handleChangeTitle = e => {
    this.setState({
      walletTitle: e.target.value
    })
    localStorage.setItem(constants.localStorage.walletTitle, e.target.value)
  }

  handleModalOpen = context => {
    const { enabledCurrencies } = this.state
    const { items, tokensData, tokensItems, tokens, hiddenCoinsList } = this.props

    const currencyTokenData = [...Object.keys(tokensData).map(k => tokensData[k]), ...tokensItems]

    const tableRows = [...items, ...tokens]
      .filter(currency => !hiddenCoinsList.includes(currency))
      .filter(currency => enabledCurrencies.includes(currency))

    const currencies = tableRows.map(currency => {
      return currencyTokenData.find(item => item.currency === currency)
    })

    actions.modals.open(constants.modals.CurrencyAction, {
      currencies,
      context
    })
  }

  checkBalance = () => {
    // that is for noxon, dont delete it :)
    const now = moment().format('HH:mm:ss DD/MM/YYYY')
    const lastCheck = localStorage.getItem(constants.localStorage.lastCheckBalance) || now
    const lastCheckMoment = moment(lastCheck, 'HH:mm:ss DD/MM/YYYY')

    const isFirstCheck = moment(now, 'HH:mm:ss DD/MM/YYYY').isSame(lastCheckMoment)
    const isOneHourAfter = moment(now, 'HH:mm:ss DD/MM/YYYY').isAfter(lastCheckMoment.add(1, 'hours'))

    const { ethData, btcData, bchData, ltcData } = this.props.tokensData

    const balancesData = {
      ethBalance: ethData.balance,
      btcBalance: btcData.balance,
      bchBalance: bchData.balance,
      ltcBalance: ltcData.balance,
      ethAddress: ethData.address,
      btcAddress: btcData.address,
      bchAddress: bchData.address,
      ltcAddress: ltcData.address
    }

    if (isOneHourAfter || isFirstCheck) {
      localStorage.setItem(constants.localStorage.lastCheckBalance, now)
      firestore.updateUserData(balancesData)
    }
  }

  render() {
    const {
      activeView,
      infoAboutCurrency,
      exchangeForm,
      editTitle,
      walletTitle,
      enabledCurrencies,
      banners
    } = this.state
    const { currencyBalance, hiddenCoinsList, isSigned, allData, isFetching } = this.props

    this.checkBalance()

    let btcBalance = 0
    let usdBalance = 0
    let changePercent = 0

    // Набор валют для виджета
    const widgetCurrencies = ['BTC']
    if (!hiddenCoinsList.includes('BTC (SMS-Protected)')) widgetCurrencies.push('BTC (SMS-Protected)')
    if (!hiddenCoinsList.includes('BTC (Multisig)')) widgetCurrencies.push('BTC (Multisig)')
    widgetCurrencies.push('ETH')
    if (isWidgetBuild) {
      if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
        // Multi token widget build
        Object.keys(window.widgetERC20Tokens).forEach(key => {
          widgetCurrencies.push(key.toUpperCase())
        })
      } else {
        widgetCurrencies.push(config.erc20token.toUpperCase())
      }
    }

    let tableRows = allData.filter(({ currency, balance }) => !hiddenCoinsList.includes(currency) || balance > 0)
    if (isWidgetBuild) {
      //tableRows = allData.filter(({ currency }) => widgetCurrencies.includes(currency))
      tableRows = allData.filter(({ currency, balance }) => !hiddenCoinsList.includes(currency))
      // Отфильтруем валюты, исключив те, которые не используются в этом билде
      tableRows = tableRows.filter(({ currency }) => widgetCurrencies.includes(currency))
    }

    tableRows = tableRows.filter(({ currency }) => enabledCurrencies.includes(currency))

    if (currencyBalance) {
      currencyBalance.forEach(item => {
        if ((!isWidgetBuild || widgetCurrencies.includes(item.name)) && item.infoAboutCurrency && item.balance !== 0) {
          if (item.name === 'BTC') {
            changePercent = item.infoAboutCurrency.percent_change_1h
          }
          btcBalance += item.balance * item.infoAboutCurrency.price_btc
          usdBalance += item.balance * item.infoAboutCurrency.price_usd
        }
      })
    }

    return (
      <artical>
        <section styleName={isWidgetBuild && !config.isFullBuild ? 'wallet widgetBuild' : 'wallet'}>
          <ul styleName="walletNav">
            {walletNav.map(({ key, text }, index) => (
              <li
                key={key}
                styleName={`walletNavItem ${activeView === index ? 'active' : ''}`}
                onClick={() => this.handleNavItemClick(index)}
              >
                <a href styleName="walletNavItemLink">
                  {text}
                </a>
              </li>
            ))}
          </ul>
          <div className="data-tut-store" styleName="walletContent" ref={this.balanceRef}>
            <div styleName={`walletBalance ${activeView === 0 ? 'active' : ''}`}>
              {/* {
                !isFetching ?  */}
              <BalanceForm
                usdBalance={usdBalance}
                currencyBalance={btcBalance}
                changePercent={changePercent}
                handleReceive={this.handleModalOpen}
                handleWithdraw={this.handleModalOpen}
                handleExchange={this.handleGoExchange}
                currency="btc"
                infoAboutCurrency={infoAboutCurrency}
              />

              {/* : <ContentLoader leftSideContent /> */}

              {exchangeForm && (
                <div styleName="exchangeForm">
                  <ParticalClosure {...this.props} isOnlyForm />
                </div>
              )}
            </div>
            <div styleName={`yourAssetsWrapper ${activeView === 0 ? 'active' : ''}`}>
              {/* {
                !isFetching ?  */}
              <CurrenciesList
                tableRows={tableRows}
                banners={banners}
                {...this.state}
                {...this.props}
                goToСreateWallet={this.goToСreateWallet}
                getExCurrencyRate={(currencySymbol, rate) => this.getExCurrencyRate(currencySymbol, rate)}
              />

              {/* : <ContentLoader rideSideContent /> */}
            </div>
            <div styleName={`activity ${activeView === 1 ? 'active' : ''}`}>
              <History />
            </div>
          </div>
          {isWidgetBuild && activeView === 0 && (
            <div styleName="keysExportImport">
              <Button gray onClick={this.handleShowKeys}>
                <FormattedMessage id="WalletPage_ExportKeys" defaultMessage="Показать ключи" />
              </Button>
              <Button gray onClick={this.handleImportKeys}>
                <FormattedMessage id="WalletPage_ImportKeys" defaultMessage="Импортировать ключи" />
              </Button>
            </div>
          )}
        </section>
      </artical>
    )
  }
}
