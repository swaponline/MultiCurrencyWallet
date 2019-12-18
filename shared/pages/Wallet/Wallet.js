import React, { Component, Fragment } from 'react'
import Slider from 'react-slick';
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Wallet.scss'
import { isMobile } from 'react-device-detect'

import History from 'pages/History/History'
import NotifyBlock from './components/NotityBlock/NotifyBock'

import security from './components/NotityBlock/images/security.svg'
import mail from './components/NotityBlock/images/mail.svg'
import info from './components/NotityBlock/images/info-solid.svg'

import { links, constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import ReactTooltip from 'react-tooltip'
import ParticalClosure from "../PartialClosure/PartialClosure"

import { FormattedMessage, injectIntl } from 'react-intl'

import config from 'app-config'
import { withRouter } from 'react-router'
import BalanceForm from './components/BalanceForm/BalanceForm'
import CurrenciesList from './CurrenciesList'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

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
    .map(({ balance, currency }) => ({
      balance,
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
    isFetching: false,
    btcBalance: 0,
    activeCurrency: 'usd',
    exchangeForm: false,
    walletTitle: 'Wallet',
    editTitle: false
  }

  componentWillMount() {
    actions.user.getBalances()
  }

  componentDidMount() {
    const { params, url } = this.props.match

    if (url.includes('withdraw')) {
      this.handleWithdraw(params)
    }

    this.showPercentChange1H();
    this.getUsdBalance();
    this.setLocalStorageItems();
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
    const exCurrencyRate = await actions.user.getExchangeRate('BTC', 'usd')

    this.setState(() => ({
      exCurrencyRate
    }))
  }

  handleSignUp = () => {
    actions.modals.open(constants.modals.SignUp)
  }

  handleNotifyBlockClose = (state) => {
    this.setState({
      [state]: true
    })
    localStorage.setItem(constants.localStorage[state], 'true')
  }



  showPercentChange1H = () => {
    const { currencies, currencyBalance } = this.props
    let infoAboutCurrency = []

    this.setState({
      isFetching: true
    })

    fetch('https://noxon.io/cursAll.php')
      .then(res => res.json())
      .then(
        (result) => {
          const itemsName = currencies.map(el => el.name)
          result.map(res => {
            const btcBalance = currencyBalance.find(item => item.name === res.symbol)
            if (itemsName.includes(res.symbol)) {
              try {
                infoAboutCurrency.push({
                  name: res.symbol,
                  change: res.percent_change_1h,
                  price_btc: res.price_btc,
                  balance: btcBalance.balance * res.price_btc
                })
                /* SMS Protected and Multisign */
                if (res.symbol === 'BTC') {
                  infoAboutCurrency.push({
                    name: 'BTC (SMS-Protected)',
                    change: res.percent_change_1h,
                    price_btc: res.price_btc,
                    balance: btcBalance.balance * res.price_btc
                  })
                }
              } catch (e) { }
            }
            this.setState({
              infoAboutCurrency,
              isFetching: false
            })
          })
        },
        (error) => {
          console.log('error on fetch data from api')
        }
      )
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
      isFetching,
      exCurrencyRate,
      exchangeForm,
      isClosedNotifyBlockBanner,
      isClosedNotifyBlockSignUp,
      editTitle,
      walletTitle,
      isPrivateKeysSaved
    } = this.state;
    const {
      items,
      tokens,
      currencyBalance,
      hiddenCoinsList,
      isSigned,
      allData,
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

    let btcBalance = null;
    let usdBalance = 0;

    const tableRows = allData.filter(({ currency, balance }) => !hiddenCoinsList.includes(currency) || balance > 0)

    if (currencyBalance) {
      currencyBalance.forEach(item => {
        btcBalance += item.balance
        usdBalance = btcBalance * exCurrencyRate;
      })
    }

    return (
      <artical>
        <section styleName="wallet">
          {(walletTitle === '' || editTitle) ? <input styleName="inputTitle" onChange={(e) => this.handleChangeTitle(e)} value={walletTitle} /> : <h3 styleName="walletHeading" onDoubleClick={this.handleEditTitle}>{walletTitle || 'Wallet'}</h3>}
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
          {!isMobile && <ul styleName="walletNav">
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
          </ul>}
          <div className="data-tut-store" styleName="walletContent" >
            <div styleName={`walletBalance ${activeView === 0 ? 'active' : ''}`}>
              <BalanceForm usdBalance={usdBalance} currencyBalance={btcBalance} handleReceive={this.handleModalOpen} handleWithdraw={this.handleModalOpen} currency="btc" infoAboutCurrency={infoAboutCurrency} />
              {exchangeForm &&
                <div styleName="exchangeForm">
                  <ParticalClosure {...this.props} isOnlyForm />
                </div>
              }
            </div>
            <CurrenciesList tableRows={tableRows} {...this.state} {...this.props} goToСreateWallet={this.goToСreateWallet} />
            <div styleName={`activity ${activeView === 1 ? 'active' : ''}`}>
              <h3 styleName="activityHeading">
                <FormattedMessage id="walletHistoryActivity" defaultMessage="Активность" />
              </h3>
              <History></History>
            </div>
          </div>
        </section>
      </artical>
    )
  }
}
