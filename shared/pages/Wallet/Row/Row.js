import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { connect } from 'redaction'
import helpers, { constants, links } from 'helpers'
import config from 'helpers/externalConfig'
import { isMobile } from 'react-device-detect'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import DropdownMenu from 'components/ui/DropdownMenu/DropdownMenu'
// import LinkAccount from '../LinkAccount/LinkAcount'
import { withRouter } from 'react-router'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import SwapApp from 'swap.app'
import { BigNumber } from 'bignumber.js'

import dollar from '../images/dollar.svg'
import PartOfAddress from '../components/PartOfAddress'

const langLabels = defineMessages({
  unconfirmedBalance: {
    id: 'RowWallet181',
    defaultMessage: `Unconfirmed balance`,
  },
})

@injectIntl
@withRouter
@connect(
  (
    {
      rememberedOrders,
      user: {
        activeFiat,
        ethData: {
          address,
          privateKey,
        }
      }
    },
    { currency }
  ) => ({
    activeFiat,
    decline: rememberedOrders.savedOrders,
    ethDataHelper: {
      address,
      privateKey,
    },
  })
)
@cssModules(styles, { allowMultiple: true })
export default class Row extends Component {
  state = {
    isBalanceFetching: false,
    viewText: false,
    tradeAllowed: false,
    isAddressCopied: false,
    isTouch: false,
    isBalanceEmpty: true,
    showButtons: false,
    exCurrencyRate: 0,
    existUnfinished: false,
    isDropdownOpen: false,
  }

  static getDerivedStateFromProps({ itemData: { balance } }) {
    return {
      isBalanceEmpty: balance === 0,
    }
  }

  constructor(props) {
    super(props)

  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleSliceAddress)
  }

  async componentDidMount() {
    const multiplier = await this.getFiats()

    window.addEventListener('resize', this.handleSliceAddress)

    this.setState(() => ({ multiplier }))
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      itemData: { currency, balance },
    } = this.props

    if (balance > 0) {
      actions.analytics.balanceEvent({ action: 'have', currency, balance })
    }
  }

  handleReloadBalance = () => {
    const { isBalanceFetching } = this.state

    if (isBalanceFetching) {
      return null
    }

    this.setState({
      isBalanceFetching: true,
    }, () => {
      setTimeout(async () => {
        const {
          itemData: { currency, address },
        } = this.props

        switch (currency) {
          case 'BTC (SMS-Protected)':
            await actions.btcmultisig.getBalance()
            break
          case 'BTC (Multisig)':
            await actions.btcmultisig.getBalanceUser(address)
            break
          case 'BTC (PIN-Protected)':
            await actions.btcmultisig.getBalancePin()
            break
          default:
            await actions[currency.toLowerCase()].getBalance(
              currency.toLowerCase(),
              address
            )
        }

        this.setState(() => ({
          isBalanceFetching: false,
        }))
      }, 250)
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    const getComparableProps = ({ itemData, index, selectId }) => ({
      itemData,
      index,
      selectId,
    })
    return (
      JSON.stringify({
        ...getComparableProps(nextProps),
        ...nextState,
      }) !==
      JSON.stringify({
        ...getComparableProps(this.props),
        ...this.state,
      })
    )
  }

  handleTouch = (e) => {
    this.setState({
      isTouch: true,
    })
  }

  handleSliceAddress = () => {
    const {
      itemData: { address },
    } = this.props

    const firstPart = address.substr(0, 6)
    const secondPart = address.substr(address.length - 4)

    return window.innerWidth < 700 || isMobile || address.length > 42
      ? `${firstPart}...${secondPart}`
      : address
  }

  handleTouchClear = (e) => {
    this.setState({
      isTouch: false,
    })
  }

  handleCopyAddress = () => {
    this.setState(
      {
        isAddressCopied: true,
      },
      () => {
        setTimeout(() => {
          this.setState({
            isAddressCopied: false,
          })
        }, 500)
      }
    )
  }

  handleWithdraw = () => {
    const {
      itemData: { currency, address },
      history,
      intl: { locale },
    } = this.props

    const {
      Withdraw,
      WithdrawMultisigSMS,
      WithdrawMultisigUser,
    } = constants.modals

    let withdrawModalType = Withdraw
    if (currency === 'BTC (SMS-Protected)')
      withdrawModalType = WithdrawMultisigSMS
    if (currency === 'BTC (Multisig)') withdrawModalType = WithdrawMultisigUser

    let targetCurrency = currency
    switch (currency.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (sms-protected)':
      case 'btc (pin-protected)':
        targetCurrency = 'btc'
        break
    }

    const isToken = helpers.ethToken.isEthToken({ name: currency })

    history.push(
      localisedUrl(
        locale,
        (isToken ? '/token' : '') + `/${targetCurrency}/${address}/send`
      )
    )
  }

  handleHowToExport = () => {
    const { itemData } = this.props

    if (itemData.isUserProtected) {
      console.log('Not implements')
      return
    }
    if (itemData.isSmsProtected) {
      this.handleHowExportSMS()
      return
    }
    if (itemData.isPinProtected) {
      this.handleHowExportPIN()
      return
    }

    actions.modals.open(constants.modals.HowToExportModal, {
      item: itemData,
    })
  }

  handleHowExportSMS = () => {
    actions.modals.open(constants.modals.RegisterSMSProtected, {
      initStep: 'export',
    })
  }

  handleHowExportPIN = () => {
    actions.modals.open(constants.modals.RegisterPINProtected, {
      initStep: 'export',
    })
  }

  handleReceive = () => {
    const {
      itemData: { currency, address },
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
    const {
      intl: { locale },
      decline,
    } = this.props

    const pair = currency.toLowerCase() === 'btc' ? 'eth' : 'btc'

    if (decline.length === 0) {
      window.scrollTo(0, 0)
      this.props.history.push(
        localisedUrl(
          locale,
          `${links.exchange}/${currency.toLowerCase()}-to-${pair}`
        )
      )
    } else {
      const getDeclinedExistedSwapIndex = helpers.handleGoTrade.getDeclinedExistedSwapIndex(
        { currency, decline }
      )
      if (getDeclinedExistedSwapIndex !== false) {
        this.handleDeclineOrdersModalOpen(getDeclinedExistedSwapIndex)
      } else {
        window.scrollTo(0, 0)
        this.props.history.push(
          localisedUrl(
            locale,
            `${links.exchange}/${currency.toLowerCase()}-to-${pair}`
          )
        )
      }
    }
  }

  handleDeclineOrdersModalOpen = (indexOfDecline) => {
    const orders = SwapApp.shared().services.orders.items
    const declineSwap = actions.core.getSwapById(
      this.props.decline[indexOfDecline]
    )

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

  handleActivatePinProtected = async () => {
    actions.modals.open(constants.modals.RegisterPINProtected, {})
  }

  handleGenerateMultisignLink = async () => {
    actions.modals.open(constants.modals.MultisignJoinLink, {})
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

  handleHowToWithdraw = () => {
    const {
      itemData: { currency, address },
    } = this.props

    actions.modals.open(constants.modals.HowToWithdrawModal, {
      currency,
      address,
    })
  }

  handleOpenDropdown = () => {
    this.setState({
      isDropdownOpen: true,
    })
  }

  handleCreateInvoiceLink = () => {
    const {
      itemData: { currency, address },
    } = this.props

    actions.modals.open(constants.modals.InvoiceLinkModal, {
      currency,
      address,
    })
  }

  handleSwitchMultisign = () => {
    actions.modals.open(constants.modals.BtcMultisignSwitch)
  }

  handleCreateInvoice = () => {
    const {
      itemData: {
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
    const {
      history,
      intl: { locale },
    } = this.props
    history.push(localisedUrl(locale, '/history'))
  }

  goToExchange = () => {
    const {
      history,
      intl: { locale },
    } = this.props
    history.push(localisedUrl(locale, '/exchange'))
  }

  goToBuy = () => {
    const {
      history,
      intl: { locale },
      currency,
    } = this.props

    // was pointOfSell

    history.push(
      localisedUrl(
        locale,
        `${links.exchange}/btc-to-${currency.currency.toLowerCase()}`
      )
    )
  }

  deleteThisSwap = () => {
    actions.core.forgetOrders(this.props.decline[0])
  }

  goToOrderBook = () => {
    const {
      history,
      intl: { locale },
      itemData: { currency },
    } = this.props
    history.push(localisedUrl(locale, `/${currency.toLowerCase()}-btc`))
  }

  goToCurrencyHistory = () => {
    const {
      history,
      intl: { locale },
      itemData: { currency, balance, address },
    } = this.props

    let targetCurrency = currency
    switch (currency.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (sms-protected)':
      case 'btc (pin-protected)':
        targetCurrency = 'btc'
        break
    }

    const isToken = helpers.ethToken.isEthToken({ name: currency })

    history.push(
      localisedUrl(
        locale,
        (isToken ? '/token' : '') + `/${targetCurrency}/${address}`
      )
    )
  }

  hideCurrency = () => {
    const {
      itemData: { currency, address, balance },
    } = this.props

    if (balance > 0) {
      actions.modals.open(constants.modals.AlertModal, {
        message: (
          <FormattedMessage
            id="WalletRow_Action_HideNonZero_Message"
            defaultMessage="У этого кошелка положительный баланс. Его скрыть нельзя."
          />
        ),
      })
    } else {
      actions.core.markCoinAsHidden(`${currency}:${address}`)
      actions.notifications.show(constants.notifications.Message, {
        message: (
          <FormattedMessage
            id="WalletRow_Action_Hidden"
            defaultMessage="Кошелек скрыт"
          />
        ),
      })
    }
  }

  copy = () => {
    const {
      itemData: { address, fullName },
    } = this.props

    actions.modals.open(constants.modals.WalletAddressModal, {
      address,
      fullName,
    })
  }

  copyPrivateKey = () => {
    const {
      itemData: { address, privateKey, fullName },
      ethDataHelper,
    } = this.props

    actions.modals.open(constants.modals.PrivateKeysModal, {
      key: address === ethDataHelper.address ? ethDataHelper.privateKey : privateKey,
      fullName,
    })
  }


  getFiats = async () => {
    const { activeFiat } = this.props
    const { fiatsRates } = await actions.user.getFiats()

    const fiatRate = fiatsRates.find(({ key }) => key === activeFiat)
    return fiatRate.value
  }

  getCustomRate = (cur) => {
    const wTokens = window.widgetERC20Tokens

    const dataobj = wTokens && Object.keys(wTokens).find(el => el === cur.toLowerCase())
    return dataobj ? (wTokens[dataobj] || { customEcxchangeRate: null }).customEcxchangeRate : null
  }

  render() {
    const {
      isBalanceFetching,
      // @ToDo Remove this
      // tradeAllowed,
      isBalanceEmpty,
      multiplier
    } = this.state

    const {
      itemData,
      intl: { locale },
      intl,
      activeFiat,
      isDark
    } = this.props

    const {
      currency,
      balance,
      isBalanceFetched,
      fullName,
      title,
      unconfirmedBalance,
      balanceError,
    } = itemData

    let currencyView = currency

    let nodeDownErrorShow = true
    let currencyFiatBalance = 0

    const isWidgetBuild = config && config.isWidget

    if (this.getCustomRate(currency)) {
      currencyFiatBalance = BigNumber(balance).multipliedBy(this.getCustomRate(currency)).multipliedBy(multiplier || 1)
    } else if (itemData.infoAboutCurrency) {
      currencyFiatBalance = BigNumber(balance).multipliedBy(itemData.infoAboutCurrency.price_usd).multipliedBy(multiplier || 1)
    }

    let hasHowToWithdraw = false
    if (
      config &&
      config.erc20 &&
      config.erc20[this.props.currency.currency.toLowerCase()] &&
      config.erc20[this.props.currency.currency.toLowerCase()].howToWithdraw
    )
      hasHowToWithdraw = true

    const isSafari = 'safari' in window

    let dropDownMenuItems = [
      {
        id: 1001,
        title: (
          <FormattedMessage
            id="WalletRow_Menu_Deposit"
            defaultMessage="Deposit"
          />
        ),
        action: this.handleReceive,
        disabled: false,
      },
      ...(hasHowToWithdraw
        ? [
          {
            id: 10021,
            title: (
              <FormattedMessage
                id="WalletRow_Menu_HowToWithdraw"
                defaultMessage="How to withdraw"
              />
            ),
            action: this.handleHowToWithdraw,
          },
        ]
        : []),
      {
        id: 1002,
        title: (
          <FormattedMessage id="WalletRow_Menu_Send" defaultMessage="Send" />
        ),
        action: this.handleWithdraw,
        disabled: isBalanceEmpty,
      },
      {
        id: 1004,
        title: (
          <FormattedMessage
            id="WalletRow_Menu_Exchange"
            defaultMessage="Exchange"
          />
        ),
        action: this.goToExchange,
        disabled: false,
      },
      {
        id: 1005,
        title: (
          <FormattedMessage id="WalletRow_Menu_Buy" defaultMessage="Buy" />
        ),
        action: this.goToBuy,
        disabled: false,
        hidden: this.props.currency.currency === 'BTC' ? true : false,
      },
      {
        id: 1003,
        title: (
          <FormattedMessage
            id="WalletRow_Menu_History"
            defaultMessage="History"
          />
        ),
        action: this.goToHistory,
        disabled: false,
      },
      !isSafari && {
        id: 1012,
        title: (
          <FormattedMessage
            id="WalletRow_Menu_Сopy"
            defaultMessage="Copy address"
          />
        ),
        action: this.copy,
        disabled: false,
      },
      !config.opts.hideShowPrivateKey && {
        id: 1012,
        title: (
          <FormattedMessage
            id="WalletRow_Menu_Сopy_PrivateKey"
            defaultMessage="Copy Private Key"
          />
        ),
        action: this.copyPrivateKey,
        disabled: false,
      },
      !this.props.itemData.isUserProtected && {
        id: 3012,
        title: (
          <FormattedMessage
            id="WalletRow_Menu_HowExportWallet"
            defaultMessage="How to export wallet"
          />
        ),
        action: this.handleHowToExport,
        disabled: false,
      },
    ].filter((el) => el)

    dropDownMenuItems.push({
      id: 1011,
      title: (
        <FormattedMessage id="WalletRow_Menu_Hide" defaultMessage="Hide" />
      ),
      action: this.hideCurrency,
      disabled: false,
    })

    if (currencyView == 'BTC (Multisig)') currencyView = 'BTC'
    if (currencyView == 'BTC (SMS-Protected)') currencyView = 'BTC'
    if (currencyView == 'BTC (PIN-Protected)') currencyView = 'BTC'

    if (currencyView !== 'BTC') {
      dropDownMenuItems.push({
        id: 1005,
        title: (
          <FormattedMessage
            id="WalletRow_Menu_Orderbook"
            defaultMessage="Orderbook"
          />
        ),
        action: this.goToOrderBook,
      })
    }

    if (
      ['BTC', 'ETH'].includes(currencyView) &&
      !isWidgetBuild &&
      config.opts.invoiceEnabled
    ) {
      dropDownMenuItems.push({
        id: 1004,
        title: (
          <FormattedMessage
            id="WalletRow_Menu_Invoice"
            defaultMessage="Выставить счет"
          />
        ),
        action: this.handleCreateInvoice,
        disable: false,
      })
      dropDownMenuItems.push({
        id: 1005,
        title: (
          <FormattedMessage
            id="WalletRow_Menu_InvoiceLink"
            defaultMessage="Получить ссылку для выставления счета"
          />
        ),
        action: this.handleCreateInvoiceLink,
        disable: false,
      })
    }

    let showBalance = true
    let statusInfo = false

    if (
      this.props.itemData.isPinProtected &&
      !this.props.itemData.isRegistered
    ) {
      statusInfo = 'Not activated'
      showBalance = false
      nodeDownErrorShow = false
      dropDownMenuItems = [
        {
          id: 1,
          title: (
            <FormattedMessage
              id="WalletRow_Menu_ActivatePinProtected"
              defaultMessage="Activate"
            />
          ),
          action: this.handleActivatePinProtected,
          disabled: false,
        },
        {
          id: 1011,
          title: (
            <FormattedMessage id="WalletRow_Menu_Hide" defaultMessage="Hide" />
          ),
          action: this.hideCurrency,
          disabled: false,
        },
      ]
    }

    if (
      this.props.itemData.isSmsProtected &&
      !this.props.itemData.isRegistered
    ) {
      statusInfo = 'Not activated'
      showBalance = false
      nodeDownErrorShow = false
      dropDownMenuItems = [
        {
          id: 1,
          title: (
            <FormattedMessage
              id="WalletRow_Menu_ActivateSMSProtected"
              defaultMessage="Activate"
            />
          ),
          action: this.handleActivateProtected,
          disabled: false,
        },
        {
          id: 1011,
          title: (
            <FormattedMessage id="WalletRow_Menu_Hide" defaultMessage="Hide" />
          ),
          action: this.hideCurrency,
          disabled: false,
        },
      ]
    }
    if (this.props.itemData.isUserProtected) {
      if (!this.props.itemData.active) {
        statusInfo = 'Not joined'
        showBalance = false
        nodeDownErrorShow = false
        dropDownMenuItems = []
      } else {
        dropDownMenuItems.push({
          id: 1105,
          title: (
            <FormattedMessage
              id="WalletRow_Menu_BTCMS_SwitchMenu"
              defaultMessage="Switch wallet"
            />
          ),
          action: this.handleSwitchMultisign,
          disabled: false,
        })
      }
      dropDownMenuItems.push({
        id: 3,
        title: (
          <FormattedMessage
            id="WalletRow_Menu_BTCMS_GenerateJoinLink"
            defaultMessage="Generate join link"
          />
        ),
        action: this.handleGenerateMultisignLink,
        disabled: false,
      })
      if (!this.props.itemData.active) {
        dropDownMenuItems.push({
          id: 1011,
          title: (
            <FormattedMessage id="WalletRow_Menu_Hide" defaultMessage="Hide" />
          ),
          action: this.hideCurrency,
          disabled: false,
        })
      }
    }

    return (
      <tr>
        <td styleName={`assetsTableRow ${isDark ? 'dark' : ''}`}>
          <div styleName="assetsTableCurrency">
            <a
              onClick={this.goToCurrencyHistory}
              title={`Online ${fullName} wallet`}
            >
              <Coin className={styles.assetsTableIcon} name={currency} />
            </a>
            <div styleName="assetsTableInfo">
              <div styleName="nameRow">
                <a
                  onClick={this.goToCurrencyHistory}
                  title={`Online ${fullName} wallet`}
                >
                  {fullName}
                </a>
              </div>
              {title ? <strong>{title}</strong> : ''}
            </div>
            {balanceError && nodeDownErrorShow ? (
              <div className={styles.errorMessage}>
                <FormattedMessage
                  id="RowWallet276"
                  defaultMessage=" node is down (You can not perform transactions). "
                />
                <a href="https://wiki.swaponline.io/faq/bitcoin-node-is-down-you-cannot-make-transactions/">
                  <FormattedMessage
                    id="RowWallet282"
                    defaultMessage="No connection..."
                  />
                </a>
              </div>
            ) : (
                ''
              )}
            <span styleName="assetsTableCurrencyWrapper">
              {showBalance && (
                <Fragment>
                  {!isBalanceFetched || isBalanceFetching ? (
                    this.props.itemData.isUserProtected &&
                      !this.props.itemData.active ? (
                        <span>
                          <FormattedMessage
                            id="walletMultisignNotJoined"
                            defaultMessage="Not joined"
                          />
                        </span>
                      ) : (
                        <div styleName="loader">
                          {!(balanceError && nodeDownErrorShow) && <InlineLoader />}
                        </div>
                      )
                  ) : (
                      <div
                        styleName="no-select-inline"
                        onClick={this.handleReloadBalance}
                      >
                        <i className="fas fa-sync-alt" styleName="icon" />
                        <span>
                          {balanceError
                            ? '?'
                            : BigNumber(balance)
                              .dp(5, BigNumber.ROUND_FLOOR)
                              .toString()}{' '}
                        </span>
                        <span styleName="assetsTableCurrencyBalance">
                          {currencyView}
                        </span>
                        {unconfirmedBalance !== 0 && (
                          <Fragment>
                            <br />
                            <span
                              styleName="unconfirmedBalance"
                              title={intl.formatMessage(
                                langLabels.unconfirmedBalance
                              )}
                            >
                              {unconfirmedBalance > 0 && <>{'+'}</>}
                              {unconfirmedBalance}{' '}
                            </span>
                          </Fragment>
                        )}
                      </div>
                    )}
                </Fragment>
              )}
            </span>
            {isMobile ? (
              <Fragment>
                {!statusInfo ? (
                  <PartOfAddress {...itemData} onClick={this.goToCurrencyHistory} />
                ) : (
                    <p styleName="statusStyle">{statusInfo}</p>
                  )}
              </Fragment>
            ) : (
                <Fragment>
                  {!statusInfo ? (
                    <p styleName="addressStyle">{itemData.address}</p>
                  ) : (
                      <p styleName="addressStyle">{statusInfo}</p>
                    )}
                </Fragment>
              )}

            {currencyFiatBalance && showBalance && !balanceError ? (
              <div styleName="assetsTableValue">
                {/* <img src={dollar} /> */}
                <p>{BigNumber(currencyFiatBalance).dp(2, BigNumber.ROUND_FLOOR).toString()}</p>
                <strong>{activeFiat}</strong>
                {/* {inneedData && <span>   {`${inneedData.change} %`} </span>} */}
              </div>
            ) : (
                ''
              )}
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
