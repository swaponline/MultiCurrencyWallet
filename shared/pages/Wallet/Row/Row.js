import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { connect } from 'redaction'
import helpers, { constants, links } from 'helpers'
import config from 'app-config'
import { isMobile } from 'react-device-detect'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import { Link } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'

import Coin from 'components/Coin/Coin'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import BtnTooltip from 'components/controls/WithdrawButton/BtnTooltip'
import DropdownMenu from 'components/ui/DropdownMenu/DropdownMenu'
// import LinkAccount from '../LinkAccount/LinkAcount'
// import KeychainStatus from '../KeychainStatus/KeychainStatus'
import { withRouter } from 'react-router'
import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from 'react-intl'
import CurrencyButton from 'components/controls/CurrencyButton/CurrencyButton'
import { relocalisedUrl, localisedUrl } from 'helpers/locale'
import SwapApp from 'swap.app'
import { BigNumber } from 'bignumber.js'

import dollar from '../images/dollar.svg'

@injectIntl
@withRouter
@connect(({
  rememberedOrders,
  user: {
    ethData,
    btcData,
    btcMultisigData,
    bchData,
    eosData,
    telosData,
    nimData,
    qtumData,
    ltcData,
    // xlmData,
    // usdtOmniData,
    tokensData,
  },
  currencies: { items: currencies },
}, { currency }) => ({
  currencies,
  item: [
    btcData,
    btcMultisigData,
    ethData,
    eosData,
    telosData,
    bchData,
    ltcData,
    qtumData,
    // xlmData,
    // usdtOmniData,
    ...Object.keys(tokensData).map(k => (tokensData[k])),
  ]
    .map(({ account, keyPair, ...data }) => ({
      ...data,
    }))
    .find((item) => item.currency === currency),
  decline: rememberedOrders.savedOrders,
}))
@cssModules(styles, { allowMultiple: true })

export default class Row extends Component {

  state = {
    isBalanceFetching: false,
    viewText: false,
    tradeAllowed: false,
    isAddressCopied: false,
    isTouch: false,
    isBalanceEmpty: true,
    telosRegister: false,
    showButtons: false,
    exCurrencyRate: 0,
    existUnfinished: false,
    isDropdownOpen: false
  }

  static getDerivedStateFromProps({ item: { balance } }) {
    return {
      isBalanceEmpty: balance === 0,
    }
  }

  constructor(props) {
    super(props)

    const { currency, currencies } = props

    const isBlockedCoin = config.noExchangeCoins
      .map(item => item.toLowerCase())
      .includes(currency.toLowerCase())

    this.state.tradeAllowed = !!currencies.find(c => c.value === currency.toLowerCase()) && !isBlockedCoin

  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleSliceAddress)
  }

  componentDidMount() {
    const { hiddenCoinsList } = this.props

    this.handleTelosActivate()
    this.getUsdBalance()

    window.addEventListener('resize', this.handleSliceAddress)

    Object.keys(config.erc20)
      .forEach(name => {
        if (!hiddenCoinsList.includes(name.toUpperCase())) {
          actions.core.markCoinAsVisible(name.toUpperCase())
        }
      })
  }

  componentDidUpdate(prevProps, prevState) {
    const { item: { currency, balance } } = this.props
    
    if (balance > 0) {
      actions.analytics.balanceEvent({ action: 'have', currency, balance })
    }
  }

  handleReloadBalance = async () => {
    const { isBalanceFetching } = this.state

    if (isBalanceFetching) {
      return null
    }

    this.setState({
      isBalanceFetching: true,
    })

    const { item: { currency } } = this.props

    await actions[currency.toLowerCase()].getBalance(currency.toLowerCase())

    this.setState(() => ({
      isBalanceFetching: false,
    }))

  }

  shouldComponentUpdate(nextProps, nextState) {
    const getComparableProps = ({ item, index, selectId }) => ({
      item,
      index,
      selectId,
    })
    return JSON.stringify({
      ...getComparableProps(nextProps),
      ...nextState,
    }) !== JSON.stringify({
      ...getComparableProps(this.props),
      ...this.state,
    })
  }

  getUsdBalance = async () => {
    const { currency }  = this.props
    let currencySymbol = currency
    // BTC SMS Protected and BTC-Multisign
    if (currencySymbol === 'BTC (SMS-Protected)') currencySymbol = 'BTC'
    if (currencySymbol === 'BTC (Multisign)') currencySymbol = 'BTC'

    const exCurrencyRate = await actions.user.getExchangeRate(currencySymbol, 'usd')

    this.setState(() => ({
      exCurrencyRate
    }))
  }

  handleTouch = (e) => {
    this.setState({
      isTouch: true,
    })
  }

  handleSliceAddress = () => {
    const { item: { address } } = this.props

    const firstPart = address.substr(0, 6)
    const secondPart = address.substr(address.length - 4)

    return (window.innerWidth < 700 || isMobile || address.length > 42) ? `${firstPart}...${secondPart}` : address
  }

  handleTouchClear = (e) => {
    this.setState({
      isTouch: false,
    })
  }

  handleCopyAddress = () => {
    this.setState({
      isAddressCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isAddressCopied: false,
        })
      }, 500)
    })
  }

  handleEosRegister = () => {
    actions.modals.open(constants.modals.EosRegister, {})
  }

  handleTelosChangeAccount = () => {
    actions.modals.open(constants.modals.TelosChangeAccount, {})
  }

  handleEosBuyAccount = async () => {
    actions.modals.open(constants.modals.EosBuyAccount)
  }

  handleWithdraw = () => {
    const {
      item: {
        decimals,
        token,
        contractAddress,
        unconfirmedBalance,
        currency,
        address,
        balance,
      },
    } = this.props

    // actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
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

  handleReceive = () => {
    const {
      item: {
        currency,
        address,
      },
    } = this.props

    actions.modals.open(constants.modals.ReceiveModal, {
      currency,
      address,
    })
  }

  handleShowOptions = () => {
    this.setState({
      showMobileButtons: true,
    })
  }

  handleGoTrade = (currency) => {
    const { intl: { locale }, decline } = this.props

    const pair = currency.toUpperCase() === 'btc' ? 'eth' : 'btc'

    if (decline.length === 0) {
      window.scrollTo(0, 0)
      this.props.history.push(localisedUrl(locale, `${links.exchange}/${currency.toLowerCase()}-to-${pair}`))
    } else {
      const getDeclinedExistedSwapIndex = helpers.handleGoTrade.getDeclinedExistedSwapIndex({ currency, decline })
      if (getDeclinedExistedSwapIndex !== false) {
        this.handleDeclineOrdersModalOpen(getDeclinedExistedSwapIndex)
      } else {
        window.scrollTo(0, 0)
        this.props.history.push(localisedUrl(locale, `${links.exchange}/${currency.toLowerCase()}-to-${pair}`))
      }
    }
  }

  handleDeclineOrdersModalOpen = (indexOfDecline) => {
    const orders = SwapApp.shared().services.orders.items
    const declineSwap = actions.core.getSwapById(this.props.decline[indexOfDecline])

    if (declineSwap !== undefined) {
      actions.modals.open(constants.modals.DeclineOrdersModal, {
        declineSwap,
      })
    }
  }

  handleMarkCoinAsHidden = (coin) => {
    actions.core.markCoinAsHidden(coin)
  }

  handleTelosActivate = async () => {
    const telosActivePrivateKey = localStorage.getItem(constants.privateKeyNames.telosPrivateKey)
    const telosActivePublicKey = localStorage.getItem(constants.privateKeyNames.telosPublicKey)
    const telosAccount = localStorage.getItem(constants.privateKeyNames.telosAccount)
    const telosAccountActivated = localStorage.getItem(constants.localStorage.telosAccountActivated) === 'true'
    const telosRegistrated = localStorage.getItem(constants.localStorage.telosRegistrated) === 'true'

    this.setState(() => ({
      telosAccountActivated,
      telosActivePublicKey,
      telosRegistrated,
    }))

    if (!telosAccountActivated && !telosRegistrated) {
      const { accountName, activePrivateKey, activePublicKey } = await actions.tlos.loginWithNewAccount()
      localStorage.setItem(constants.localStorage.telosRegistrated, true)
    }
    // if (telosRegistrated) {
    //   await actions.tlos.activateAccount(telosAccount, telosActivePrivateKey, telosActivePublicKey)
    // } на время проблем с работой сервера
  }

  showButtons = () => {
    this.setState(() => ({
      showButtons: true,
    }))
  }

  hideButtons = () => {
    this.setState(() => ({
      showButtons: false,
    }))
  }

  handleOpenDropdown = () => {
    this.setState({
      isDropdownOpen: true
    })
  }
  

  deleteThisSwap = () => {
    actions.core.forgetOrders(this.props.decline[0])
  }

  render() {
    const {
      isBalanceFetching,
      tradeAllowed,
      isAddressCopied,
      isTouch,
      isBalanceEmpty,
      telosAccountActivated,
      telosActivePublicKey,
      showButtons,
      exCurrencyRate,
      isDropdownOpen
    } = this.state
console.log(this.props)
    const {
      item: {
        currency,
        balance,
        isBalanceFetched,
        address,
        fullName,
        title,
        unconfirmedBalance,
        contractAddress,
        balanceError,
      },
      intl: { locale },
      infoAboutCurrency,
    } = this.props

    let eosAccountActivated = false
    let eosActivationPaymentSent = false
    if (currency === 'EOS') {
      eosAccountActivated = this.props.item.isAccountActivated
      eosActivationPaymentSent = this.props.item.isActivationPaymentSent
    }

    let inneedData = null

    const currencyUsdBalance = BigNumber(balance).dp(5, BigNumber.ROUND_FLOOR).toString() * exCurrencyRate;

    if (infoAboutCurrency) {
      inneedData = infoAboutCurrency.find(el => el.name === currency)
    }

    return (
      <tr>
        <td styleName="assetsTableRow">
          <div styleName="assetsTableCurrency">
            <Link to={localisedUrl(locale, `/${fullName}-wallet`)} title={`Online ${fullName} wallet`}>
              <Coin className={styles.assetsTableIcon} name={currency} />
            </Link>
            <div styleName="assetsTableInfo">
              <Link to={localisedUrl(locale, `/${fullName}-wallet`)} title={`Online ${fullName} wallet`}>
                <p>
                {
                 balanceError &&
                    <div className={styles.errorMessage}>
                      {fullName}
                      <FormattedMessage
                        id="RowWallet276"
                        defaultMessage=" node is down (You can not perform transactions). " />
                      <a href="https://wiki.swap.online/faq/bitcoin-node-is-down-you-cannot-make-transactions/">
                        <FormattedMessage
                          id="RowWallet282"
                          defaultMessage="Need help?" />
                      </a>
                    </div> ||  fullName
                }
                </p>
              </Link>
              <span>
              {
                !isBalanceFetched || isBalanceFetching ? (
                  <div styleName="loader">
                    <InlineLoader />
                  </div>
                ) : (
                  <div styleName="no-select-inline" onClick={this.handleReloadBalance} >
                    <i className="fas fa-sync-alt" styleName="icon" />
                    <span>
                      {
                        balanceError ? '?' : BigNumber(balance).dp(5, BigNumber.ROUND_FLOOR).toString()
                      }{' '}
                    </span>
                    <span>{currency}</span>
                    { currency === 'BTC' && unconfirmedBalance !== 0 && (
                      <Fragment>
                        <br />
                        <span styleName="unconfirmedBalance">
                          <FormattedMessage id="RowWallet181" defaultMessage="Unconfirmed balance" />
                          {unconfirmedBalance} {' '}
                        </span>
                      </Fragment>
                    ) }
                    { currency === 'BCH' && unconfirmedBalance !== 0 && (
                      <Fragment>
                        <br />
                        <span styleName="unconfirmedBalance">
                          <FormattedMessage id="RowWallet181" defaultMessage="Unconfirmed balance" />
                          {unconfirmedBalance} {' '}
                        </span>
                      </Fragment>
                    ) }
                    { currency === 'LTC' && unconfirmedBalance !== 0 && (
                      <Fragment>
                        <br />
                        <span styleName="unconfirmedBalance">
                          <FormattedMessage id="RowWallet189" defaultMessage="Unconfirmed balance" />
                          {unconfirmedBalance}
                        </span>
                      </Fragment>
                    ) }
                    {/* currency === 'USDT' && unconfirmedBalance !== 0 && (
                      <Fragment>
                        <br />
                        <span styleName="unconfirmedBalance">
                          <FormattedMessage id="RowWallet197" defaultMessage="Unconfirmed balance" />
                          {unconfirmedBalance}
                        </span>
                      </Fragment>
                    ) */}
                  </div>
                )
              }
              </span>
              <strong>{title}</strong>
            </div>
            <div styleName="assetsTableValue">
              <img src={dollar}/>
              <p>{currencyUsdBalance && currencyUsdBalance.toFixed(2) || '0.00'}</p>
              {inneedData && <span>   {`${inneedData.change} %`} </span>}
            </div>
            <div onClick={this.handleOpenDropdown} styleName="assetsTableDots">
              <DropdownMenu
                size="regular"
                className="walletControls"
                items={[
                  {
                    id: 1,
                    title: 'Deposit',
                    action: this.handleReceive,
                    disabled: false
                  },
                  {
                    id: 2,
                    title: 'Send',
                    action: this.handleWithdraw,
                    disabled: isBalanceEmpty
                  }
                ]}
              />
            </div>
          </div>
        </td>
      </tr>
    )
  }
}

