import React, { Component, Fragment } from 'react'
import Slider from './components/WallerSlider';
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Wallet.scss'
import { isMobile } from 'react-device-detect'

import History from 'pages/History/History'

import { links, constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import ReactTooltip from 'react-tooltip'
import ParticalClosure from "../PartialClosure/PartialClosure"

import { FormattedMessage, injectIntl } from 'react-intl'

import config from 'app-config'
import { withRouter } from 'react-router'
import BalanceForm from './components/BalanceForm/BalanceForm'
import CurrenciesList from './CurrenciesList'
import NewButton from 'components/controls/NewButton/NewButton'
import ContentLoader from '../../components/loaders/ContentLoader/ContentLoader'


const walletNav = [
  { key: 'My balances', text: <FormattedMessage id="MybalanceswalletNav" defaultMessage="Мой баланс" /> },
  { key: 'Transactions', text: <FormattedMessage id="TransactionswalletNav" defaultMessage="Переводы" /> }
];


@connect(({
  core: { hiddenCoinsList },
  user: {
    ethData,
    btcData,
    btcMultisigSMSData,
    btcMultisigUserData,
    bchData,
    tokensData,
    ltcData,
    // qtumData,
    // usdtOmniData,
    // nimData,
    // xlmData,
    isFetching
  },
  currencies: { items: currencies },
  createWallet: { currencies: assets },
}) => {
  const tokens = (
    config && config.isWidget
      ? [config.erc20token.toUpperCase()]
      : Object.keys(tokensData).map(k => tokensData[k].currency)
  )

  const tokensItems = (
    Object.keys(tokensData).map(k => tokensData[k])
  )

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
    ...Object.keys(tokensData).map(k => (tokensData[k])),
  ]
    .map(({ account, keyPair, ...data }) => ({
      ...data,
    }))

  const items = (
    config && config.isWidget ? [
      btcData,
      ethData,
      // usdtOmniData,
    ] : [
        btcData,
        btcMultisigSMSData,
        btcMultisigUserData,
        bchData,
        ethData,
        ltcData,
        // qtumData,
        // usdtOmniData,
        // nimData,
        // xlmData,
      ]
  )
    .map(data => data.currency)

  const currencyBalance = [
    btcData,
    btcMultisigSMSData,
    btcMultisigUserData,
    bchData,
    ethData,
    ltcData,
    // qtumData,
    // usdtOmniData,
    // nimData,
    // xlmData,
  ]
    .map(({ balance, currency, infoAboutCurrency }) => ({
      balance,
      infoAboutCurrency,
      name: currency,
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
    hiddenCoinsList: config && config.isWidget ? [] : hiddenCoinsList,
    userEthAddress: ethData.address,
    tokensData: {
      ethData,
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      bchData,
      ltcData,
      // qtumData,
      // usdtOmniData,
    },
  }
})
@injectIntl
@withRouter
@connect(({ signUp: { isSigned } }) => ({
  isSigned
}))

@cssModules(styles, { allowMultiple: true })
export default class Wallet extends Component {

  state = {
    activeView: 0,
    btcBalance: 0,
    activeCurrency: 'usd',
    exchangeForm: false,
    walletTitle: 'Wallet',
    editTitle: false,
  }

  componentWillMount() {
    actions.user.getBalances()
  }

  componentDidMount() {
    const { params, url } = this.props.match

    if (url.includes('withdraw')) {
      this.handleWithdraw(params)
    }
    this.getInfoAboutCurrency();
    this.setLocalStorageItems();
  }

  getInfoAboutCurrency = async () => {
    const { currencies } = this.props;
    const currencyNames = currencies.map(({ name }) => name)

    await actions.user.getInfoAboutCurrency(currencyNames);
  }

  handleNavItemClick = (index) => {
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

  onLoadeOn = (fn) => {
    this.setState({
      isFetching: true
    })

    fn();
  }

  handleNotifyBlockClose = (state) => {
    this.setState({
      [state]: true
    })
    localStorage.setItem(constants.localStorage[state], 'true')
  }

  handleWithdraw = (params) => {
    const { allData } = this.props
    const { address, amount } = params
    const item = allData.find(({ currency }) => currency.toLowerCase() === params.currency.toLowerCase())

    actions.modals.open(constants.modals.Withdraw, { ...item, toAddress: address, amount })
  }

  goToСreateWallet = () => {
    const { history, intl: { locale } } = this.props

    history.push(localisedUrl(locale, '/createWallet'))
  }

  handleGoExchange = () => {
    const { history, intl: { locale } } = this.props
    history.push(localisedUrl(locale, links.exchange))
  }

  handleEditTitle = () => {
    this.setState({
      editTitle: true
    })
  }

  handleChangeTitle = (e) => {
    this.setState({
      walletTitle: e.target.value
    })
    localStorage.setItem(constants.localStorage.walletTitle, e.target.value)
  }


  handleModalOpen = (context) => {
    const {
      items,
      tokensData,
      tokensItems,
      tokens,
      hiddenCoinsList
    } = this.props;


    const currencyTokenData = [...Object.keys(tokensData).map(k => (tokensData[k])), ...tokensItems]

    const tableRows = [...items, ...tokens].filter(currency => !hiddenCoinsList.includes(currency))

    const currencies = tableRows.map(currency => {
      return currencyTokenData.find(item => item.currency === currency);
    })

    actions.modals.open(constants.modals.CurrencyAction, { currencies, context })
  }

  render() {
    const {
      activeView,
      infoAboutCurrency,
      exchangeForm,
      editTitle,
      walletTitle,
    } = this.state;
    const {
      currencyBalance,
      hiddenCoinsList,
      isSigned,
      allData,
      isFetching,
    } = this.props


    let settings = {
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 6000,
      fade: true,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    let btcBalance = 0;
    let usdBalance = 0;
    let changePercent = 0;

    const isWidgetBuild = (config && config.isWidget)
    const widgetCurrencies = (isWidgetBuild) ? ['BTC', 'ETH', config.erc20token.toUpperCase()] : []

    let tableRows = allData.filter(({ currency, balance }) => !hiddenCoinsList.includes(currency) || balance > 0)
    if (isWidgetBuild) {
      tableRows = allData.filter(({ currency }) => widgetCurrencies.includes(currency))
    }
    
    if (currencyBalance) {
      currencyBalance.forEach(item => {
        if (!isWidgetBuild || widgetCurrencies.includes(item.name)) {
          btcBalance += item.balance * item.infoAboutCurrency.price_btc;
          usdBalance = btcBalance * item.infoAboutCurrency.price_usd;
          changePercent = item.infoAboutCurrency.percent_change_1h;
        }
      })
    }

    return (
      <artical>
        <section styleName={(isWidgetBuild) ? 'wallet widgetBuild' : 'wallet'}>
          {(walletTitle === '' || editTitle) ? <input styleName="inputTitle" onChange={(e) => this.handleChangeTitle(e)} value={walletTitle} /> : <h3 styleName="walletHeading" onDoubleClick={this.handleEditTitle}>{walletTitle || 'Wallet'}</h3>}
          <Slider
            settings={settings}
            isSigned={isSigned}
            handleNotifyBlockClose={this.handleNotifyBlockClose}
            {...this.state}
          />
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
              </li>))}
          </ul>
          <div className="data-tut-store" styleName="walletContent" >
            <div styleName={`walletBalance ${activeView === 0 ? 'active' : ''}`}>
              {
                !isFetching ? 
                  <BalanceForm 
                    usdBalance={usdBalance} 
                    currencyBalance={btcBalance} 
                    changePercent={changePercent}
                    handleReceive={this.handleModalOpen} 
                    handleWithdraw={this.handleModalOpen} 
                    handleExchange={this.handleGoExchange}
                    currency="btc" 
                    infoAboutCurrency={infoAboutCurrency} 
                /> : <ContentLoader leftSideContent />
              }
              {exchangeForm &&
                <div styleName="exchangeForm">
                  <ParticalClosure {...this.props} isOnlyForm />
                </div>
              }
            </div>
            <div styleName={`yourAssetsWrapper ${activeView === 0 ? 'active' : ''}`}>
              {
                !isFetching ? 
                  <CurrenciesList 
                    tableRows={tableRows} {...this.state} {...this.props} 
                    goToСreateWallet={this.goToСreateWallet}
                    getExCurrencyRate={(currencySymbol, rate) => this.getExCurrencyRate(currencySymbol, rate)}
                  /> : <ContentLoader rideSideContent />
              }
            </div>
            <div styleName={`activity ${activeView === 1 ? 'active' : ''}`}>
              <History />
            </div>
          </div>
          {(isWidgetBuild && activeView === 0) &&
            <div styleName="keysExportImport">
              <NewButton gray onClick={this.handleShowKeys}>
                <FormattedMessage id="WalletPage_ExportKeys" defaultMessage="Показать ключи" />
              </NewButton>
              <NewButton gray onClick={this.handleImportKeys}>
                <FormattedMessage id="WalletPage_ImportKeys" defaultMessage="Импортировать ключи" />
              </NewButton>
            </div>
          }
        </section>
      </artical >
    )
  }
}
