import { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { connect } from 'redaction'
import erc20Like from 'common/erc20Like'
import { constants, metamask, utils, externalConfig } from 'helpers'
import config from 'helpers/externalConfig'
import { isMobile } from 'react-device-detect'

import cssModules from 'react-css-modules'
import styles from './Row.scss'
import Coin from 'components/Coin/Coin'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import DropdownMenu from 'components/ui/DropdownMenu/DropdownMenu'
import { withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import { BigNumber } from 'bignumber.js'
import { Button } from 'components/controls'
import PartOfAddress from '../PartOfAddress'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { ApiEndpoint } from '../Endpoints'
import Copy from 'components/ui/Copy/Copy'

type RowProps = {
  // from component
  currency: IUniversalObj
  itemData: IUniversalObj
  // from store
  activeFiat?: string
  ethDataHelper?: {
    address: string
    privateKey: string
  }
  history?: IUniversalObj
  intl?: IUniversalObj
  multisigStatus?: any
}

type RowState = {
  isBalanceFetching: boolean
  isBalanceEmpty: boolean
  isDropdownOpen: boolean
  isToken: boolean
  reduxActionName: string
}

const langLabels = defineMessages({
  unconfirmedBalance: {
    id: 'RowWallet181',
    defaultMessage: `Unconfirmed balance`,
  },
  msConfirmCount: {
    id: 'RowWallet_MsConfirmCountMobile',
    defaultMessage: `{count} tx wait your confirm`,
  },
})

@withRouter
@connect(
  (
    {
      user: {
        activeFiat,
        ethData: {
          address,
          privateKey,
        },
        multisigStatus,
      }
    }
  ) => ({
    activeFiat,
    multisigStatus,
    ethDataHelper: {
      address,
      privateKey,
    },
  })
)
@cssModules(styles, { allowMultiple: true })
class Row extends Component<RowProps, RowState> {
  constructor(props) {
    super(props)
    
    const { currency, itemData } = props
    const currencyName = currency.currency
    const isToken = erc20Like.isToken({ name: currencyName })
    const reduxActionName = itemData.standard || currencyName.toLowerCase()

    this.state = {
      isBalanceFetching: false,
      isBalanceEmpty: true,
      isDropdownOpen: false,
      isToken,
      reduxActionName,
    }
  }

  async componentDidMount() {
    const { balance } = this.props.itemData

    this.setState({
      isBalanceEmpty: balance === 0,
    })
  }

  componentDidUpdate(prevProps) {
    const {
      itemData: { 
        balance: prevBalance
      }
    } = prevProps

    const {
      itemData: { 
        currency, 
        balance 
      }
    } = this.props

    if (balance > 0) {
      actions.analytics.balanceEvent({ action: 'have', currency, balance })
    }

    if (prevBalance !== balance) {
      this.setState({
        isBalanceEmpty: balance === 0,
      })
    }
  }

  handleReloadBalance = () => {
    const {
      isBalanceFetching,
      isToken,
      reduxActionName,
    } = this.state
    const {
      itemData: {
        isMetamask,
        isConnected,
      }
    } = this.props

    if (isBalanceFetching) {
      return null
    }

    if (isMetamask && !isConnected ) {
      this.setState({
        isBalanceFetching: true,
      }, () => {
        setTimeout(() => {
          this.setState({isBalanceFetching: false})
        }, 500)
      })
      return null
    }

    this.setState({
      isBalanceFetching: true,
    }, () => {
      // here is timeout for the impression of the balance request
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
            if (isMetamask && !isToken && metamask.isAvailableNetwork()) {
              await metamask.getBalance()
            } else {
              await actions[reduxActionName].getBalance(currency)
            }
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
        //@ts-ignore
        ...getComparableProps(this.props),
        ...this.state,
      })
    )
  }

  handleWithdrawPopup = () => {
    const {
      itemData
    } = this.props

    actions.modals.open(constants.modals.Withdraw, itemData)
  }

  handleWithdraw = () => {
    const {
      itemData,
      history,
      intl
    } = this.props

    if (itemData.currency.toLowerCase() === 'ghost') {
      this.handleWithdrawPopup()
      return
    }

    if (itemData.currency.toLowerCase() === 'next') {
      this.handleWithdrawPopup()
      return
    }

    let targetCurrency = itemData.currency
    switch (itemData.currency.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (sms-protected)':
      case 'btc (pin-protected)':
        targetCurrency = 'btc'
        break
    }

    const firstUrlPart = itemData.tokenKey ? `/token/${itemData.tokenKey}` : `/${targetCurrency}`

    history?.push(
      localisedUrl(intl?.locale, `${firstUrlPart}/${itemData.address}/send`)
    )
  }

  handleReceive = () => {
    const {
      itemData: { currency, address, standard, tokenKey },
    } = this.props

    actions.modals.open(constants.modals.ReceiveModal, {
      currency: (tokenKey || currency),
      address,
      standard,
    })
  }

  handleActivatePinProtected = async () => {
    actions.modals.open(constants.modals.RegisterPINProtected, {})
  }

  handleGenerateMultisignLink = async () => {
    actions.modals.open(constants.modals.MultisignJoinLink, {})
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
      itemData: { currency, address, tokenKey },
    } = this.props

    actions.modals.open(constants.modals.InvoiceLinkModal, {
      currency,
      address,
      tokenKey,
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
        tokenKey,
        address,
        balance,
      },
      itemData
    } = this.props

    actions.modals.open(constants.modals.InvoiceModal, {
      currency: ((tokenKey) ? tokenKey : currency).toUpperCase(),
      address,
      contractAddress,
      decimals,
      token,
      balance,
      unconfirmedBalance,
    })
  }

  goToExchange = () => {
    const {
      history,
      intl,
    } = this.props
    history?.push(localisedUrl(intl?.locale, '/exchange'))
  }

  goToCurrencyHistory = () => {
    const {
      history,
      intl,
      itemData,
    } = this.props


    let targetCurrency = itemData.currency
    switch (itemData.currency.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (sms-protected)':
      case 'btc (pin-protected)':
        targetCurrency = 'btc'
        break
    }


    const firstUrlPart = itemData.tokenKey ? `/token/${itemData.tokenKey}` : `/${targetCurrency}`

    history?.push(
      localisedUrl(intl?.locale, `${firstUrlPart}/${itemData.address}`)
    )
  }

  hideCurrency = () => {
    const {
      itemData: { currency, address, balance, isToken, tokenKey },
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
      actions.core.markCoinAsHidden(`${isToken ? tokenKey.toUpperCase() : currency}:${address}`)
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
      key: address === ethDataHelper?.address ? ethDataHelper?.privateKey : privateKey,
      fullName,
    })
  }

  handleShowMnemonic = () => {
    actions.modals.open(constants.modals.SaveWalletSelectMethod)
  }

  connectMetamask = () => {
    metamask.handleConnectMetamask()
  }

  render() {
    const {
      isBalanceFetching,
      isBalanceEmpty,
    } = this.state

    const {
      itemData,
      intl,
      activeFiat,
      multisigStatus,
    } = this.props

    const {
      currency,
      baseCurrency,
      balance,
      isBalanceFetched,
      fullName,
      unconfirmedBalance,
      balanceError,
      standard,
      isToken,
    } = itemData

    let nodeDownErrorShow = true
    let currencyFiatBalance
    let currencyView = (isToken) ? currency.replaceAll(`*`,``) : currency

    switch (currencyView) {
      case 'BTC (Multisig)':
      case 'BTC (SMS-Protected)':
      case 'BTC (PIN-Protected)':
        currencyView = 'BTC'
        break
    }

    if (itemData?.infoAboutCurrency?.price_fiat) {
      currencyFiatBalance = utils.toMeaningfulFloatValue({
        value: balance,
        rate: itemData.infoAboutCurrency.price_fiat,
      })
    }

    let hasHowToWithdraw = false
    if (
      config?.erc20?.[this.props.currency.currency.toLowerCase()]?.howToWithdraw
    ) {
      hasHowToWithdraw = true
    }

    const isSafari = 'safari' in window

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicSaved = (mnemonic === `-`)

    type DropDownItem = {
      action: () => void
      disabled?: boolean
      title: JSX.Element
      id: number
    }

    //@ts-ignore: strictNullChecks
    let dropDownMenuItems: DropDownItem[] = [
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
                id="HowToWithdrawModal_Title"
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
      !config.opts.exchangeDisabled && {
        id: 1004,
        title: (
          <FormattedMessage
            id="menu.exchange"
            defaultMessage="Exchange"
          />
        ),
        action: this.goToExchange,
        disabled: false,
      },
      {
        id: 1003,
        title: (
          <FormattedMessage
            id="WalletRow_Menu_History"
            defaultMessage="History"
          />
        ),
        action: this.goToCurrencyHistory,
        disabled: !mnemonicSaved,
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
        disabled: !mnemonicSaved,
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
      {
        id: 1011,
        title: (
          <FormattedMessage id="WalletRow_Menu_Hide" defaultMessage="Hide" />
        ),
        action: this.hideCurrency,
        disabled: false,
      },
    ].filter((el) => el)

    if (
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
        disabled: false,
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
        disabled: false,
      })
    }

    if (itemData.isMetamask
      && !itemData.isConnected
    ) {
      dropDownMenuItems = [{
        id: 1,
        title: (
          <FormattedMessage
            id="WalletRow_MetamaskConnect"
            defaultMessage="Подключить"
          />
        ),
        action: metamask.handleConnectMetamask,
        disabled: false,
      }]
    }

    if (itemData.isMetamask
      && itemData.isConnected
    ) {
      dropDownMenuItems = [
        {
          id: 1123,
          title: (
            <FormattedMessage
              id="MetamaskDisconnect"
              defaultMessage="Disconnect wallet"
            />
          ),
          action: metamask.handleDisconnectWallet,
          disabled: false
        },
        ...dropDownMenuItems
      ]
    }

    let showBalance = true
    let statusInfo = ''

    // Prevent render SMS wallet
    if (itemData.isSmsProtected) return null

    if (
      itemData.isPinProtected &&
      !itemData.isRegistered
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

    const msConfirmCount = (
      itemData.isUserProtected
      && multisigStatus
      && multisigStatus[itemData.address]
      && multisigStatus[itemData.address].count
    ) ? multisigStatus[itemData.address].count : false

    if (itemData.isUserProtected) {
      if (!itemData.active) {
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
      if (!itemData.active) {
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

    const ethRowWithoutExternalProvider = itemData.address.toLowerCase() === 'not connected' && !metamask.web3connect.isInjectedEnabled()
    const web3Type = metamask.web3connect.getInjectedType()

    const isMetamask = itemData.isMetamask
    const metamaskIsConnected = isMetamask && itemData.isConnected
    const metamaskDisconnected = isMetamask && !itemData.isConnected
    const isAvailableMetamaskNetwork = isMetamask && metamask.isAvailableNetwork()
    const isNotAvailableMetamaskNetwork = isMetamask && !metamask.isAvailableNetwork()
    const currencyTitleId = `${standard ? standard.toLowerCase() : ''}${currency.toLowerCase()}`
    const showFiatBalance =
      currencyFiatBalance !== undefined &&
      !Number.isNaN(currencyFiatBalance) &&
      showBalance &&
      !balanceError

    return (
      !ethRowWithoutExternalProvider
      && <tr>
        <td styleName={`assetsTableRow`}>
          <div styleName="assetsTableCurrency">
            <Coin
              className={styles.assetsTableIcon}
              name={metamaskDisconnected || isNotAvailableMetamaskNetwork ? web3Type : currency }
            />

            {/* Title-Link */}
            <div id={currencyTitleId + 'WalletTitle'} styleName="assetsTableInfo">
              <div styleName="nameRow">
                <a onClick={
                  metamaskDisconnected
                    ? this.connectMetamask
                    : isNotAvailableMetamaskNetwork
                      ? () => null
                      : mnemonicSaved || (metamaskIsConnected && isAvailableMetamaskNetwork)
                        ? this.goToCurrencyHistory
                        : () => null
                  }
                  styleName={`${
                    mnemonicSaved && isMobile
                      ? 'linkToHistory mobile'
                        : mnemonicSaved || (metamaskIsConnected && isAvailableMetamaskNetwork)
                          ? 'linkToHistory desktop'
                          : ''
                  }`}
                  title={`Online ${fullName} wallet`}
                >
                  {fullName}
                  {/* label for tokens */}
                  {standard ? (
                    <span styleName="tokenStandard">
                      {` ${standard.toUpperCase()}`}
                    </span>
                  ) : ''}
                </a>
              </div>
            </div>

            {/* Tip - if something wrong with endpoint */}
            {balanceError && nodeDownErrorShow && (
              <div className={styles.errorMessage}>
                <ApiEndpoint
                  contractAddress={itemData.contractAddress}
                  address={itemData.address}
                  symbol={itemData.currency}
                  isERC20={itemData.isERC20}
                  isBTC={itemData.isBTC}
                >
                  <FormattedMessage
                    id="RowWallet276"
                    defaultMessage="Node is down"
                  />
                </ApiEndpoint>
                {' '}
                <Tooltip id="WalletRowNodeIsDownTooltip">
                  <div style={{ textAlign: 'center' }}>
                    <FormattedMessage
                      id="WalletRowNodeIsDownTooltipMessage"
                      defaultMessage="You can not perform transactions"
                    />
                  </div>
                </Tooltip>
              </div>
            )}

            {/* Currency amount */}
            <span styleName="assetsTableCurrencyWrapper">
              {showBalance && (
                <Fragment>
                  {/*
                  If it's a metamask and it disconnected then showing connect button
                  else if balance fetched or fetching then showing loader
                  else showing fetch-button and currency balance
                  */}
                  {metamaskDisconnected ? (
                      <Button small empty onClick={metamask.handleConnectMetamask}>
                        <FormattedMessage id="CommonTextConnect" defaultMessage="Connect" />
                      </Button>
                    ) :
                      isNotAvailableMetamaskNetwork
                        ? (
                          <Button small empty onClick={metamask.handleDisconnectWallet}>
                            <FormattedMessage id="MetamaskDisconnect" defaultMessage="Disconnect wallet" />
                          </Button>
                        )
                        : !isBalanceFetched || isBalanceFetching ? (
                          itemData.isUserProtected &&
                            !itemData.active ? (
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
                          <button
                            id="walletRowUpdateBalanceBtn"
                            styleName="cryptoBalanceBtn"
                            onClick={this.handleReloadBalance}
                          >
                            <i className="fas fa-sync-alt" styleName="icon" />
                            <span id="walletRowCryptoBalance">
                              {balanceError
                                ? '?'
                                : utils.toMeaningfulFloatValue({
                                    value: balance,
                                    meaningfulDecimals: 5,
                                  })}{' '}
                            </span>
                            <span styleName="assetsTableCurrencyBalance">
                              {currencyView}
                            </span>
                            {unconfirmedBalance !== 0 && (
                              <Fragment>
                                <br />
                                <span
                                  styleName="unconfirmedBalance"
                                  title={intl?.formatMessage(
                                    langLabels.unconfirmedBalance
                                  )}
                                >
                                  {unconfirmedBalance > 0 && <>{'+'}</>}
                                  {unconfirmedBalance}{' '}
                                </span>
                              </Fragment>
                            )}
                          </button>
                        )
                  }
                </Fragment>
              )}
            </span>

            {/* Address */}
            <Fragment>
              {statusInfo ?
                <p styleName="statusStyle">{statusInfo}</p>
                :
                !mnemonicSaved && !itemData.isMetamask ?
                  <p styleName="showAddressStyle" onClick={this.handleShowMnemonic}>
                    <FormattedMessage
                      id="WalletRow_ShowAddress"
                      defaultMessage="Show address"
                    />
                  </p>
                  : // only for metamask
                  metamaskDisconnected ?
                    <p styleName="addressStyle">
                      <FormattedMessage
                        id="WalletRow_MetamaskNotConnected"
                        defaultMessage="Not connected"
                      />
                    </p>
                    : isNotAvailableMetamaskNetwork
                      ?
                        <p styleName="addressStyle">
                          <FormattedMessage
                            id="WalletRow_MetamaskNotAvailableNetwork"
                            defaultMessage="Please choose another"
                          />
                        </p>
                      : // Address shows
                      <div styleName="addressStyle">
                        <Copy text={itemData.address}>
                          {isMobile ? (
                              <PartOfAddress
                                withoutLink
                                currency={itemData.currency}
                                contractAddress={itemData.contractAddress}
                                address={itemData.address}
                                style={{
                                  position: 'relative',
                                  bottom: '16px',
                                }}
                              />
                            ) : (
                              <p id={`${
                                baseCurrency ? baseCurrency + currency.toLowerCase() : currency.toLowerCase()
                              }Address`}>
                                {itemData.address}
                              </p>
                            )
                          }
                        </Copy>
                      </div>
              }
            </Fragment>

            {/* Fiat amount */}
            {showFiatBalance || msConfirmCount ? (
              <div styleName="assetsTableValue">
                {msConfirmCount && !isMobile && (
                  <p styleName="txWaitConfirm" onClick={this.goToCurrencyHistory}>
                    {intl?.formatMessage(
                      langLabels.msConfirmCount,
                      {
                        count: msConfirmCount,
                      }
                    )}
                  </p>
                )}
                {showFiatBalance && (
                  <>
                    <p>{currencyFiatBalance}</p>
                    <strong>{activeFiat}</strong>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {/* Additional option. Ethereum row with external wallet */}
          {!metamaskDisconnected && !isNotAvailableMetamaskNetwork &&
            <div onClick={this.handleOpenDropdown} styleName="assetsTableDots">
              <DropdownMenu
                className="walletControls"
                items={dropDownMenuItems}
              />
            </div>
          }
        </td>
      </tr>
    )
  }
}

export default injectIntl(Row)
