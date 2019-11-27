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

const walletNav = ['My balances', 'Transactions'];


@connect(({
  core: { hiddenCoinsList },
  user: {
    ethData,
    btcData,
    btcMultisigData,
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
        btcMultisigData,
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
    btcMultisigData,
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
      btcMultisigData,
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
    activeCurrency: 'usd'
  }

  componentWillMount() {
    console.log(this.props)
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
      exCurrencyRate
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
          <div styleName="walletContent">
            <div styleName={`walletBalance yourBalance ${activeView === 0 ? 'active' : ''}`}>
              <div styleName="yourBalanceTop">
                <p styleName="yourBalanceDescr">Your total balance</p>
                <div styleName="yourBalanceValue">
                  {activeCurrency === 'usd' ? <img src={dollar} /> : <img src={btcIcon} />}
                  {activeCurrency === 'usd' ? <p>{usdBalance.toFixed(2)}</p> : <p>{parseFloat(btcBalance).toFixed(5)}</p>}
                  <span>+0.0%</span>
                </div>
                <div styleName="yourBalanceCurrencies">
                  <button styleName={activeCurrency === 'usd' && 'active'} onClick={() => this.setState({ activeCurrency: 'usd' })}>
                    <img src={dollar2} />
                  </button>
                  <span></span>
                  <button styleName={activeCurrency === 'btc' && 'active'} onClick={() => this.setState({ activeCurrency: 'btc' })}>
                    <img src={btcIcon} />
                  </button>
                </div>
              </div>
              <div styleName="yourBalanceBottom">
                <Fragment>
                  <NewButton blue id="depositBtn">
                    Deposit
                </NewButton>
                  <ReactTooltip id="depositBtn" type="light" effect="solid">
                    <FormattedMessage id="depositBtn" defaultMessage="Для пополнения валюты нажмите три точки напротив нужного актива" />
                  </ReactTooltip>
                </Fragment>
                <Fragment>
                  <NewButton blue id="sendBtn">
                    Send
                </NewButton>
                  <ReactTooltip id="sendBtn" type="light" effect="solid">
                    <FormattedMessage id="sendBtn" defaultMessage="Для отправки валюты нажмите три точки напротив нужного актива" />
                  </ReactTooltip>
                </Fragment>
              </div>
            </div>
            <div styleName="yourAssets" styleName={`yourAssets ${activeView === 0 ? 'active' : ''}`}>
              <h3 styleName="yourAssetsHeading">Your Assets</h3>
              <p styleName="yourAssetsDescr">Here you can safely store and promptly exchange Bitcoin, Ethereum, <br /> EOS, USD, Tether, BCH, and numerous ERC-20 tokens</p>
              {isFetching && <Table
                className={styles.walletTable}
                rows={tableRows}
                rowRender={(row, index, selectId, handleSelectId) => (
                  <Row
                    key={row}
                    index={index}
                    getCurrencyUsd={(usd) => this.getCurrencyUsd(usd)}
                    currency={row}
                    currencies={currencies}
                    infoAboutCurrency={infoAboutCurrency}
                    hiddenCoinsList={hiddenCoinsList}
                    selectId={selectId}
                    handleSelectId={handleSelectId}
                  />
                )}
              />}
              <NewButton onClick={this.goToRegister} blue transparent fullWidth>
                Add Asset
             </NewButton>
            </div>
            <div styleName={`activity ${activeView === 1 ? 'active' : ''}`}>
              <h3 styleName="activityHeading">Activity</h3>
              <History></History>
            </div>
          </div>
        </section>
        <section styleName="indent">
          <ParticalClosure {...this.props} />
        </section>
      </artical>
    )
  }
}
