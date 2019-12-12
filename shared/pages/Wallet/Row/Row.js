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
    btcMultisigSMSData,
    btcMultisigUserData,
    bchData,
    eosData,
    telosData,
    nimData,
    //qtumData,
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
    btcMultisigSMSData,
    btcMultisigUserData,
    ethData,
    eosData,
    telosData,
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

    this.handleTelosActivate()
    this.getUsdBalance()

    window.addEventListener('resize', this.handleSliceAddress)
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

    const { item: { currency, address } } = this.props

    switch (currency) {
      case 'BTC (SMS-Protected)':
        await actions.btcmultisig.getBalance()
        break;
      case 'BTC (Multisig)':
        await actions.btcmultisig.getBalanceUser()
        break
      default:
        await actions[currency.toLowerCase()].getBalance(currency.toLowerCase(), address)
    }

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
    const { currency } = this.props
    let currencySymbol = currency
    // BTC SMS Protected and BTC-Multisign
    if (currencySymbol === 'BTC (SMS-Protected)') currencySymbol = 'BTC'
    if (currencySymbol === 'BTC (Multisig)') currencySymbol = 'BTC'

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
        currency,
      },
      item
    } = this.props

    const { Withdraw, WithdrawMultisigSMS, WithdrawMultisigUser } = constants.modals;

    let withdrawModalType = Withdraw;
    if (currency === 'BTC (SMS-Protected)') withdrawModalType = WithdrawMultisigSMS;
    if (currency === 'BTC (Multisig)') withdrawModalType = WithdrawMultisigUser;

    actions.modals.open(withdrawModalType, item)
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

    const pair = currency.toLowerCase() === 'btc' ? 'eth' : 'btc'

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

  handleActivateProtected = async () => {
    actions.modals.open(constants.modals.RegisterSMSProtected, {})
  }

  handleGenerateMultisignLink = async () => {
    actions.modals.open(constants.modals.MultisignJoinLink, {})
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

  handleCreateInvoiceLink = () => {
    const {
      item: {
        currency,
        address,
      },
    } = this.props

    actions.modals.open(constants.modals.InvoiceLinkModal, {
      currency,
      address,
    })
  }

  handleCreateInvoice = () => {
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

    actions.modals.open(constants.modals.InvoiceModal, {
      currency,
      address,
      contractAddress,
      decimals,
      token,
      balance,
      unconfirmedBalance,
    })
  }

  goToHistory = () => {
    const { history, intl: { locale } } = this.props
    history.push(localisedUrl(locale, '/history'))
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

    let currencyView = currency
    let eosAccountActivated = false
    let eosActivationPaymentSent = false
    if (currency === 'EOS') {
      eosAccountActivated = this.props.item.isAccountActivated
      eosActivationPaymentSent = this.props.item.isActivationPaymentSent
    }

    let inneedData = null
    let nodeDownErrorShow = true

    const currencyUsdBalance = BigNumber(balance).dp(5, BigNumber.ROUND_FLOOR).toString() * exCurrencyRate;

    if (infoAboutCurrency) {
      inneedData = infoAboutCurrency.find(el => el.name === currency)
    }

    let dropDownMenuItems = [
      {
        id: 1001,
        title: <FormattedMessage id='WalletRow_Menu_Deposit' defaultMessage='Deposit' />,
        action: this.handleReceive,
        disabled: false,
      },
      {
        id: 1002,
        title: <FormattedMessage id='WalletRow_Menu_Send' defaultMessage='Send' />,
        action: this.handleWithdraw,
        disabled: isBalanceEmpty,
      },
      {
        id: 1003,
        title: <FormattedMessage id='WalletRow_Menu_History' defaultMessage='History' />,
        action: this.goToHistory,
        disabled: false
      }
    ]

    if (currencyView == 'BTC (Multisig)') currencyView = 'BTC'
    if (currencyView == 'BTC (SMS-Protected)') currencyView = 'BTC'

    if (currencyView == 'BTC') {
      dropDownMenuItems.push({
        id: 1004,
        title: <FormattedMessage id='WalletRow_Menu_Invoice' defaultMessage='Выставить счет' />,
        action: this.handleCreateInvoice,
        disable: false,
      })
      dropDownMenuItems.push({
        id: 1005,
        title: <FormattedMessage id='WalletRow_Menu_InvoiceLink' defaultMessage='Получить ссылку для выставления счета' />,
        action: this.handleCreateInvoiceLink,
        disable: false,
      })
    }

    if (this.props.item.isSmsProtected && !this.props.item.isRegistered) {
      currencyView = 'Not activated'
      nodeDownErrorShow = false
      dropDownMenuItems = [{
        id: 1,
        title: <FormattedMessage id='WalletRow_Menu_ActivateSMSProtected' defaultMessage='Activate' />,
        action: this.handleActivateProtected,
        disabled: false,
      }]
    }
    if (this.props.item.isUserProtected) {
      if (!this.props.item.active) {
        currencyView = 'Not joined'
        nodeDownErrorShow = false
        dropDownMenuItems = []
      }
      dropDownMenuItems.push({
        id: 3,
        title: <FormattedMessage id='WalletRow_Menu_BTCMS_GenerateJoinLink' defaultMessage='Generate join link' />,
        action: this.handleGenerateMultisignLink,
        disabled: false,
      })
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
                    balanceError && nodeDownErrorShow &&
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
                    </div> || fullName
                  }
                </p>
              </Link>
              <span>
                {
                  !isBalanceFetched || isBalanceFetching ? (
                    this.props.item.isUserProtected && !this.props.item.active ? (
                      <span>
                        <FormattedMessage id="walletMultisignNotJoined" defaultMessage="Not joined" />
                      </span>
                    ) : (
                        <div styleName="loader">
                          <InlineLoader />
                        </div>
                      )
                  ) : (
                      <div styleName="no-select-inline" onClick={this.handleReloadBalance} >
                        <i className="fas fa-sync-alt" styleName="icon" />
                        <span>
                          {
                            balanceError ? '?' : BigNumber(balance).dp(5, BigNumber.ROUND_FLOOR).toString()
                          }{' '}
                        </span>
                        <span>{currencyView}</span>
                        {unconfirmedBalance > 0 && (
                          <Fragment>
                            <br />
                            <span styleName="unconfirmedBalance">
                              <FormattedMessage id="RowWallet181" defaultMessage="Unconfirmed balance" />
                              {unconfirmedBalance} {' '}
                            </span>
                          </Fragment>
                        )}
                      </div>
                    )
                }
              </span>
              <strong>{title}</strong>
            </div>
            <div styleName="assetsTableValue">
              <img src={dollar} />
              <p>{currencyUsdBalance && currencyUsdBalance.toFixed(2) || '0.00'}</p>
              {inneedData && <span>   {`${inneedData.change} %`} </span>}
            </div>
          </div>
          <div onClick={this.handleOpenDropdown} styleName="assetsTableDots">
            <DropdownMenu
              size="regular"
              className="walletControls"
              items={dropDownMenuItems}
            />
          </div>
        </td>
      </tr>
    )
  }
}

