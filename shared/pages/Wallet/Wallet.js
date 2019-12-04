import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Wallet.scss'
import NewButton from 'components/controls/NewButton/NewButton'
import History from 'pages/History/History'
import Row from './Row/Row'
import Table from 'components/tables/Table/Table'
import NotifyBlock from './components/NotityBlock/NotifyBock'

import security from './images/security.svg'
import mail from './images/mail.svg'
import dollar from './images/dollar.svg'
import dollar2 from './images/dollar2.svg'
import btcIcon from './images/btcIcon.svg'

import { links, constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import ReactTooltip from 'react-tooltip'
import ParticalClosure from "../PartialClosure/PartialClosure"

import { FormattedMessage, injectIntl } from 'react-intl'

import config from 'app-config'
import { withRouter } from 'react-router'
import BalanceForm from './BalanceForm'
import CurrenciesList from './CurrenciesList'

const walletNav = ['My balances', 'Transactions'];


@connect(({
  core: { hiddenCoinsList },
  user: {
    ethData,
    btcData,
    btcMultisigSMSData,
    btcMultisigUserData,
    bchData,
    tokensData,
    eosData,
    telosData,
    ltcData,
    // qtumData,
    // usdtOmniData,
    // nimData,
    // xlmData,
  },
  currencies: { items: currencies },
}) => {
  const tokens = (
    config && config.isWidget
      ? [config.erc20token.toUpperCase()]
      : Object.keys(tokensData).map(k => tokensData[k].currency)
  )

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
        eosData,
        telosData,
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
    eosData,
    telosData,
    ltcData,
    // qtumData,
    // usdtOmniData,
    // nimData,
    // xlmData,
    ...Object.keys(tokensData).map(k => tokensData[k]),
  ]
    .map(({ balance, currency }) => ({
      balance,
      name: currency,
    }))

  return {
    tokens,
    items,
    currencyBalance,
    currencies,
    hiddenCoinsList: config && config.isWidget ? [] : hiddenCoinsList,
    userEthAddress: ethData.address,
    tokensData: {
      ethData,
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      bchData,
      ltcData,
      eosData,
      telosData,
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
  }

  componentWillMount() {
    console.log('BTC-Protected', this.props.btcMultisigData)
    actions.user.getBalances()
  }

  componentDidMount() {
    this.showPercentChange1H();
    this.getUsdBalance()
  }

  handleNavItemClick = (index) => {
    this.setState({
      activeView: index
    })
  }

  handleSaveKeys = () => {
    actions.modals.open(constants.modals.PrivateKeys)
  }

  handleDeposit = () => {
    actions.modals.open(constants.modals.Withdraw, {
      currency,
      address,
      contractAddress,
      decimals,
      token,
      balance,
      unconfirmedBalance,
    })
  }

  handleShowKeys = () => {
    actions.modals.open(constants.modals.DownloadModal)
  }

  getUsdBalance = async () => {
    const exCurrencyRate = await actions.user.getExchangeRate('BTC', 'usd')

    this.setState(() => ({
      exCurrencyRate
    }))
  }

  handleSignUp = () => {
    actions.modals.open(constants.modals.SignUp, {})
  }

  handleNotifyBlockClose = () => {
    alert('close')
  }

  showPercentChange1H = () => {
    const { currencies, currencyBalance } = this.props
    let infoAboutCurrency = []

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
          })
          this.setState({
            infoAboutCurrency,
            isFetching: true
          })
        },
        (error) => {
          console.log('error on fetch data from api')
        }
      )
  }

  goToRegister = () => {
    const { history, intl: { locale } } = this.props
    history.push(localisedUrl(locale, '/createWallet'))
  }

  render() {
    const {
      activeView,
      infoAboutCurrency,
      isFetching,
      activeCurrency,
      exCurrencyRate,
      exchangeForm,
    } = this.state;
    const {
      items,
      tokens,
      currencies,
      hiddenCoinsList,
      intl,
      isSigned,
      location,
    } = this.props

    let btcBalance = 0;
    let usdBalance = 0;


    const tableRows = [...items, ...tokens].filter(currency => !hiddenCoinsList.includes(currency))

    if (infoAboutCurrency) {
      infoAboutCurrency.forEach(item => {
        btcBalance += item.balance
        usdBalance = btcBalance * exCurrencyRate;
      })
    }

    const isPrivateKeysSaved = localStorage.getItem(constants.localStorage.privateKeysSaved)

    return (
      <artical>
        <section styleName="wallet">
          <h3 styleName="walletHeading">Wallet</h3>
          {
            isSigned && !isPrivateKeysSaved &&
            <NotifyBlock
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
            !isSigned && <NotifyBlock
              className="notifyBlockSignUp"
              descr="Sign up and get your free cryptocurrency for test!"
              tooltip="You will also be able to receive notifications regarding updates with your account"
              icon={mail}
              firstBtn="Sign Up"
              firstFunc={this.handleSignUp}
              secondBtn="I’ll do this later"
              secondFunc={this.handleNotifyBlockClose} />

          }
          <ul styleName="walletNav">
            {walletNav.map((item, index) => <li key={index} styleName={`walletNavItem ${activeView === index ? 'active' : ''}`} onClick={() => this.handleNavItemClick(index)}><a href styleName="walletNavItemLink">{item}</a></li>)}
          </ul>
          <div className="data-tut-store" styleName="walletContent" >
            <div styleName={`walletBalance ${activeView === 0 ? 'active' : ''}`}>
              <BalanceForm usdBalance={usdBalance} btcBalance={btcBalance} {...this.state} />
              {exchangeForm &&
                <div styleName="exchangeForm">
                  <ParticalClosure {...this.props} isOnlyForm />
                </div>
              }
            </div>
            <CurrenciesList tableRows={tableRows} {...this.state} {...this.props} />
            <div styleName={`activity ${activeView === 1 ? 'active' : ''}`}>
              <h3 styleName="activityHeading">Activity</h3>
              <History></History>
            </div>
          </div>
        </section>
      </artical>
    )
  }
}
