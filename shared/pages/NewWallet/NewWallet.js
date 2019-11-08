import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './NewWallet.scss'
import NewButton from 'components/controls/NewButton/NewButton'
import History from 'pages/History/History'
import Wallet from 'pages/Wallet/Wallet'
import Input from 'components/forms/Input/Input'
import Row from './Row/Row'
import Table from 'components/tables/Table/Table'

import NotifyBlock from './components/NotityBlock/NotifyBock'

import security from './images/security.svg'
import mail from './images/mail.svg'

import { links, constants } from 'helpers'

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
    usdBalance: 0
  }

  componentDidMount = () => {
    this.showPercentChange1H();
  }

  handleNavItemClick = (index) => {
    this.setState({
      activeView: index
    })
  }

  getCurrencyUsd = (usd) => {
    this.setState({
      usdBalance: this.state.usdBalance + usd
    });
  }

  showPercentChange1H = () => {
    const { currencies } = this.props
    let infoAboutCurrency = []

    fetch('https://noxon.io/cursAll.php')
      .then(res => res.json())
      .then(
        (result) => {
          const itemsName = currencies.map(el => el.name)
          console.log('result', result)
          result.map(res => {
            if (itemsName.includes(res.symbol)) {
              infoAboutCurrency.push({
                name: res.symbol,
                change: res.percent_change_1h,
                price_btc: res.price_btc
              })
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
    const {activeView, infoAboutCurrency, isFetching, usdBalance} = this.state;
    const {
      items,
      tokens,
      currencies,
      hiddenCoinsList,
      intl,
      isSigned,
      location,
    } = this.props

    const tableRows = [ ...items, ...tokens ].filter(currency => !hiddenCoinsList.includes(currency))
    
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
          <div styleName="newWalletBalance yourBalance">
            <div styleName="yourBalanceTop">
              <p styleName="yourBalanceDescr">Your total balance</p>
              <div styleName="yourBalanceValue">
                <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.6748 9.88867C8.6748 10.2051 8.61328 10.5156 8.49023 10.8203C8.36719 11.1191 8.19141 11.3975 7.96289 11.6553C7.74023 11.9131 7.46484 12.1445 7.13672 12.3496C6.81445 12.5547 6.45117 12.7129 6.04688 12.8242V13.9141H5.08008V12.9824C5.00391 12.9941 4.92773 13 4.85156 13H4.37695V13.9141H3.40137V12.8418C3.02051 12.7363 2.67188 12.584 2.35547 12.3848C2.03906 12.1855 1.76367 11.9453 1.5293 11.6641C1.29492 11.377 1.11328 11.0518 0.984375 10.6885C0.855469 10.3193 0.791016 9.91504 0.791016 9.47559H2.45215C2.45215 9.84473 2.53125 10.1963 2.68945 10.5303C2.85352 10.8643 3.09082 11.1367 3.40137 11.3477V7.40137C3.02051 7.27832 2.66895 7.13477 2.34668 6.9707C2.02441 6.80664 1.74609 6.61035 1.51172 6.38184C1.27734 6.15332 1.0957 5.88672 0.966797 5.58203C0.837891 5.27734 0.773438 4.92285 0.773438 4.51855C0.773438 4.14355 0.837891 3.80371 0.966797 3.49902C1.0957 3.19434 1.27441 2.9248 1.50293 2.69043C1.7373 2.4502 2.01562 2.25098 2.33789 2.09277C2.66016 1.92871 3.01465 1.80273 3.40137 1.71484V0.651367H4.37695V1.5918H4.88672C4.95117 1.5918 5.01562 1.59766 5.08008 1.60938V0.651367H6.04688V1.75C6.38672 1.83789 6.70312 1.96387 6.99609 2.12793C7.28906 2.28613 7.54688 2.48242 7.76953 2.7168C7.99219 2.94531 8.17383 3.20898 8.31445 3.50781C8.45508 3.80664 8.5459 4.1377 8.58691 4.50098H7.11035C7.05762 4.20215 6.94043 3.92969 6.75879 3.68359C6.57715 3.43164 6.33984 3.22656 6.04688 3.06836V6.78613C6.90234 7.0791 7.55273 7.4834 7.99805 7.99902C8.44922 8.51465 8.6748 9.14453 8.6748 9.88867ZM5.08008 7.86719L4.37695 7.65625V11.708C4.42383 11.7197 4.46777 11.7256 4.50879 11.7256H4.86035C4.93066 11.7256 5.00391 11.7197 5.08008 11.708V7.86719ZM5.08008 6.50488C5.08008 6.1123 5.07715 5.72266 5.07129 5.33594C5.07129 4.94922 5.06836 4.5918 5.0625 4.26367C5.0625 3.92969 5.05664 3.63379 5.04492 3.37598C5.03906 3.1123 5.03027 2.90723 5.01855 2.76074H4.97461C4.91602 2.74902 4.86035 2.74023 4.80762 2.73438C4.75488 2.72852 4.69922 2.72559 4.64062 2.72559H4.37695V6.26758C4.48242 6.31445 4.59375 6.35547 4.71094 6.39062C4.82812 6.42578 4.95117 6.46387 5.08008 6.50488ZM3.40137 2.9541C3.08496 3.10645 2.85352 3.31738 2.70703 3.58691C2.56055 3.85059 2.4873 4.14355 2.4873 4.46582C2.4873 4.61816 2.49902 4.75879 2.52246 4.8877C2.55176 5.01074 2.60156 5.13086 2.67188 5.24805C2.74219 5.35938 2.83594 5.46777 2.95312 5.57324C3.07031 5.67285 3.21973 5.77246 3.40137 5.87207V2.9541ZM6.89062 9.77441C6.89062 9.49316 6.82617 9.23535 6.69727 9.00098C6.57422 8.76074 6.35742 8.54102 6.04688 8.3418V11.3652C6.3457 11.1777 6.55957 10.9404 6.68848 10.6533C6.82324 10.3662 6.89062 10.0732 6.89062 9.77441Z" fill="#8E9AA3"/>
                </svg>
                <p>{usdBalance.toFixed(2)}</p>
                <span>+0.0%</span>
              </div>
              <div styleName="yourBalanceCurrencies">
                <a href>
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.70312 7.58542C6.10729 6.9625 5.525 6.75937 4.11667 6.13646C3.62917 5.91979 3.19583 5.73021 3.00625 5.37812C2.91146 5.21562 2.89792 5.0125 2.89792 4.87708C2.89792 4.61979 2.97917 4.37604 3.15521 4.2C3.37188 3.94271 3.72396 3.79375 4.07604 3.79375C4.55 3.79375 4.88854 4.06458 5.11875 4.40312C5.25417 4.67396 5.29479 4.87708 5.29479 5.09375L7.24479 5.08021C7.21771 4.41667 7.04167 3.88854 6.67604 3.34687C6.28333 2.77812 5.70104 2.38542 5.0375 2.18229V0.909375H3.19583V2.15521C2.68125 2.27708 2.22083 2.50729 1.84167 2.84583C1.3 3.34687 0.947917 4.15937 0.947917 4.90417C0.947917 5.44583 1.15104 6.04167 1.40833 6.40729C1.7875 6.9625 2.28854 7.30104 2.73542 7.54479C3.42604 7.95104 4.29271 8.11354 4.98333 8.57396C5.38958 8.84479 5.47083 9.06146 5.47083 9.37292C5.47083 9.73854 5.34896 9.98229 5.05104 10.1854C4.78021 10.3885 4.37396 10.4562 4.08958 10.4562C3.58854 10.4562 3.16875 10.1719 2.88438 9.725C2.74896 9.52187 2.68125 9.16979 2.68125 8.99375H0.8125C0.8125 9.61667 0.975 10.1854 1.3 10.7C1.70625 11.4042 2.39688 11.8781 3.19583 12.0813V13.3542H5.0375V12.1083C5.37604 12.0406 5.71458 11.9323 5.97188 11.7969C6.89271 11.3229 7.42083 10.3208 7.42083 9.42708C7.42083 8.70937 7.20417 8.1 6.70312 7.58542Z" fill="#1F2D48"/>
                  </svg>
                </a>
                <span>|</span>
                <a href>
                  <svg width="7" height="13" viewBox="0 0 7 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.509 12.274V11H0.17V1.718H1.509V0.404999H2.38V1.718H2.406C2.70933 1.718 2.98667 1.731 3.238 1.757V0.404999H4.109V1.9C4.66367 2.03867 5.07967 2.28133 5.357 2.628C5.643 2.97467 5.786 3.45567 5.786 4.071C5.786 4.59967 5.69067 5.046 5.5 5.41C5.30933 5.774 5.03633 5.995 4.681 6.073V6.138C4.93233 6.19867 5.15767 6.307 5.357 6.463C5.55633 6.619 5.71667 6.84433 5.838 7.139C5.95933 7.43367 6.02 7.82367 6.02 8.309C6.02 8.96767 5.851 9.518 5.513 9.96C5.175 10.3933 4.707 10.6923 4.109 10.857V12.274H3.238V11C3.16 11 3.07767 11 2.991 11H2.38V12.274H1.509ZM2.133 5.397H2.627C3.06033 5.397 3.35933 5.306 3.524 5.124C3.68867 4.942 3.771 4.67767 3.771 4.331C3.771 3.97567 3.67133 3.72 3.472 3.564C3.27267 3.408 2.95633 3.33 2.523 3.33H2.133V5.397ZM2.133 6.957V9.375H2.77C3.22067 9.375 3.53267 9.26233 3.706 9.037C3.888 8.803 3.979 8.49533 3.979 8.114C3.979 7.76733 3.888 7.49 3.706 7.282C3.524 7.06533 3.19033 6.957 2.705 6.957H2.133Z" fill="#8E9AA3"/>
                  </svg>
                </a>
              </div>
            </div>
            <div styleName="yourBalanceBottom">
            <NewButton blue>
                Deposit
              </NewButton>
              <NewButton transparent disabled>
                Send
              </NewButton>
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
