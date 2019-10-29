import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './NewWallet.scss'
import NewButton from 'components/controls/NewButton/NewButton'
import History from 'pages/History/History'
import Wallet from 'pages/Wallet/Wallet'
import Row from './Row/Row'
import Table from 'components/tables/Table/Table'
import NotifyBlock from './components/NotityBlock/NotifyBock'

import security from './images/security.svg'
import mail from './images/mail.svg'
import dollar from './images/dollar.svg'
import dollar2 from './images/dollar2.svg'
import btcIcon from './images/btcIcon.svg'

import { links, constants } from 'helpers'
import ReactTooltip from 'react-tooltip'

import { FormattedMessage, injectIntl } from 'react-intl'

import config from 'app-config'
import { withRouter } from 'react-router'

const newWalletNav = ['My balances', 'Transactions'];


@connect(({
  core: { hiddenCoinsList },
  user: {
    ethData,
    btcData,
    bchData,
    tokensData,
    eosData,
    telosData,
    ltcData,
    qtumData,
    // usdtOmniData,
    // nimData,
    // xlmData,
  },
  currencies: { items: currencies },
}) => {
  const tokens = (
    config && config.isWidget
      ? [ config.erc20token.toUpperCase() ]
      : Object.keys(tokensData).map(k => tokensData[k].currency)
  )

  const items = (
    config && config.isWidget ? [
      btcData,
      ethData,
      // usdtOmniData,
    ] : [
      btcData,
      bchData,
      ethData,
      eosData,
      telosData,
      ltcData,
      qtumData,
      // usdtOmniData,
      // nimData,
      // xlmData,
    ]
  )
    .map(data => data.currency)

  const currencyBalance = [
    btcData,
    bchData,
    ethData,
    eosData,
    telosData,
    ltcData,
    qtumData,
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
      bchData,
      ltcData,
      eosData,
      telosData,
      qtumData,
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
export default class NewWallet extends Component {

  state = {
    activeView: 0,
    isFetching: false,
    usdBalance: 0,
    btcBalance: 0,
    activeCurrency: 'usd'
  }

  componentDidMount = () => {
    this.showPercentChange1H();
  }

  handleNavItemClick = (index) => {
    this.setState({
      activeView: index
    })
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
              infoAboutCurrency.push({
                name: res.symbol,
                change: res.percent_change_1h,
                price_btc: res.price_btc,
                balance: btcBalance.balance * res.price_btc
              }
             )
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

  render() {
    const {
      activeView, 
      infoAboutCurrency, 
      isFetching, 
      usdBalance,
      activeCurrency
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

    const tableRows = [ ...items, ...tokens ].filter(currency => !hiddenCoinsList.includes(currency))

    if(infoAboutCurrency) {
      infoAboutCurrency.forEach(item => {
        btcBalance += item.balance
      })
    }
    
    return (
      <section styleName="newWallet">
        <h3 styleName="newWalletHeading">Wallet</h3>
        <ul styleName="newWalletNav">
          {newWalletNav.map((item, index) => <li styleName={`newWalletNavItem ${activeView === index ? 'active' : ''}`} onClick={() => this.handleNavItemClick(index)}><a href styleName="newWalletNavItemLink">{item}</a></li>)}
        </ul>

        {
          isSigned ? 
            <NotifyBlock 
              className="notifyBlockSaveKeys"
              descr="Before you continue be sure to save your private keys!" 
              tooltip="We do not store your private keys and will not be able to restore them" 
              icon={security}
              firstBtn="Show my keys"
              secondBtn="I saved my keys" /> :
            <NotifyBlock 
              className="notifyBlockSignUp"
              descr="Sign up and get your free cryptocurrency for test!" 
              tooltip="You will also be able to receive notifications regarding updates with your account" 
              icon={mail}
              firstBtn="Sign Up"
              secondBtn="I’ll do this later" />
        }
        <div styleName="newWalletContent">
          <div styleName={`newWalletBalance yourBalance ${activeView === 0 ? 'active' : ''}`}>
            <div styleName="yourBalanceTop">
              <p styleName="yourBalanceDescr">Your total balance</p>
              <div styleName="yourBalanceValue">
                {activeCurrency === 'usd' ? <img src={dollar}/> : <img src={btcIcon}/> }
                {activeCurrency === 'usd' ? <p>{usdBalance}</p> : <p>{parseFloat(btcBalance).toFixed(5)}</p>}
                <span>+0.0%</span>
              </div>
              <div styleName="yourBalanceCurrencies">
                <button styleName={activeCurrency === 'usd' && 'active'} onClick={() => this.setState({activeCurrency: 'usd'})}>
                  <img src={dollar2}/>
                </button>
                <span></span>
                <button styleName={activeCurrency === 'btc' && 'active'} onClick={() => this.setState({activeCurrency: 'btc'})}>
                  <img src={btcIcon}/>
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
              className={styles.newWalletTable}
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
            <NewButton blue transparent fullWidth>
              Add Asset
             </NewButton>
          </div>
          <div styleName={`activity ${activeView === 1 ? 'active' : ''}`}>
            <h3 styleName="activityHeading">Activity</h3>
            <History></History>
          </div>
        </div>
      </section>
    )
  }
}
