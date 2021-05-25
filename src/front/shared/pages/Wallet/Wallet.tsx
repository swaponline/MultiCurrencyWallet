import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { connect } from 'redaction'
import cssModules from 'react-css-modules'
import { isMobile } from 'react-device-detect'
import { BigNumber } from 'bignumber.js'
import moment from 'moment'

import appConfig from 'app-config'
import actions from 'redux/actions'
import styles from './Wallet.scss'
import erc20Like from 'common/erc20Like'
import { links, constants, stats, user } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import getTopLocation from 'helpers/getTopLocation'
import config from 'helpers/externalConfig'
import metamask from 'helpers/metamask'
import wpLogoutModal from 'helpers/wpLogoutModal'
import feedback from 'helpers/feedback'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'

import CurrenciesList from './CurrenciesList'
import InvoicesList from 'pages/Invoices/InvoicesList'
import History from 'pages/History/History'
import DashboardLayout from 'components/layout/DashboardLayout/DashboardLayout'
import BalanceForm from 'components/BalanceForm/BalanceForm'


const isWidgetBuild = config && config.isWidget
const isDark = localStorage.getItem(constants.localStorage.isDark)

@connect(
  ({
    core: { hiddenCoinsList },
    user,
    user: {
      activeFiat,
      ethData,
      bnbData,
      btcData,
      ghostData,
      nextData,
      btcMultisigSMSData,
      btcMultisigUserData,
      btcMultisigUserDataList,
      tokensData,
      isBalanceFetching,
      multisigPendingCount,
      activeCurrency,
      metamaskData,
    },
    currencies: { items: currencies },
    modals,
  }) => {
    const userCurrencyData = {
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      ethData,
      bnbData,
      ghostData,
      nextData,
    }

    Object.keys(tokensData).forEach((k) => {
      // TODO: temporarily.
      // delete this loop when in the tokensData
      // will be only token's standards
      Object.keys(TOKEN_STANDARDS).forEach((key) => {
        const standard = TOKEN_STANDARDS[key].standard

        userCurrencyData[standard] = tokensData[standard]
      })

      // userCurrencyData[k] = tokensData[k]
    })

    return {
      userCurrencyData,
      currencies,
      isBalanceFetching,
      multisigPendingCount,
      hiddenCoinsList,
      user,
      activeCurrency,
      activeFiat,
      coinsData: {
        ethData,
        metamaskData: {
          ...metamaskData,
          currency: 'ETH Metamask',
        },
        btcData,
        ghostData,
        nextData,
        btcMultisigSMSData,
        btcMultisigUserData,
        btcMultisigUserDataList,
      },
      modals,
    }
  }
)
@withRouter
@cssModules(styles, { allowMultiple: true })
class Wallet extends PureComponent<any, any> {
  syncTimer: ReturnType<typeof setTimeout> | null = null

  constructor(props) {
    super(props)

    const {
      match: {
        params: { page = null },
      },
      multisigPendingCount,
      userCurrencyData,
    } = props

    const tokenStandards = Object.keys(TOKEN_STANDARDS).map((key) => {
      return TOKEN_STANDARDS[key].standard
    })

    let activeComponentNum = 0

    if (page === 'history' && !isMobile) {
      activeComponentNum = 1
    }
    if (page === 'invoices') {
      activeComponentNum = 2
    }

    this.state = {
      userCurrencyData,
      tokenStandards,
      activeComponentNum,
      btcBalance: 0,
      enabledCurrencies: user.getActivatedCurrencies(),
      multisigPendingCount,
    }
  }

  handleConnectWallet() {
    const {
      history,
      intl: { locale },
    } = this.props

    if (metamask.isConnected()) {
      history.push(localisedUrl(locale, links.home))
      return
    }

    setTimeout(() => {
      metamask.connect({})
    }, 100)
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { page: prevPage = null },
      },
      multisigPendingCount: prevMultisigPendingCount,
      location: { pathname: prevPathname },
      userCurrencyData: prevAllData,
    } = prevProps

    const {
      match: {
        params: { page = null },
      },
      multisigPendingCount,
      intl,
      intl: { locale },
      location: { pathname },
      history,
      userCurrencyData,
    } = this.props

    if (JSON.stringify(userCurrencyData) !== JSON.stringify(prevAllData)) {
      this.setState(() => ({
        userCurrencyData,
      }))
    }

    if (
      pathname.toLowerCase() != prevPathname.toLowerCase() &&
      pathname.toLowerCase() == links.connectWallet.toLowerCase()
    ) {
      this.handleConnectWallet()
    }

    if (page !== prevPage || multisigPendingCount !== prevMultisigPendingCount) {
      let activeComponentNum = 0

      if (page === 'history' && !isMobile) activeComponentNum = 1
      if (page === 'invoices') activeComponentNum = 2

      if (page === 'exit') {
        wpLogoutModal(() => {
          history.push(localisedUrl(locale, links.home))
        }, intl)
      }

      this.setState(() => ({
        activeComponentNum,
        multisigPendingCount,
      }))
    }
    //@ts-ignore
    clearTimeout(this.syncTimer)
  }

  componentDidMount() {
    const {
      match: {
        params,
        params: { page },
        url,
      },
      multisigPendingCount,
      history,
      location: { pathname },
      intl,
      intl: { locale },
    } = this.props

    if (pathname.toLowerCase() == links.connectWallet.toLowerCase()) {
      this.handleConnectWallet()
    }

    actions.user.getBalances()

    actions.user.fetchMultisigStatus()

    if (url.includes('send')) {
      this.handleWithdraw(params)
    }

    if (page === 'exit') {
      wpLogoutModal(() => {
        history.push(localisedUrl(locale, links.home))
      }, intl)
    }
    this.getInfoAboutCurrency()
    this.setState({
      multisigPendingCount,
    })
  }

  getInfoAboutCurrency = async () => {
    const { currencies } = this.props
    const currencyNames = currencies.map(({ name }) => name)

    await actions.user.getInfoAboutCurrency(currencyNames)
  }

  handleWithdraw = (params) => {
    const { userCurrencyData } = this.state
    const { address, amount } = params
    const item = userCurrencyData.find(
      ({ currency }) => currency.toLowerCase() === params.currency.toLowerCase()
    )

    actions.modals.open(constants.modals.Withdraw, {
      ...item,
      toAddress: address,
      amount,
    })
  }

  goToСreateWallet = () => {
    feedback.wallet.pressedAddCurrency()
    const {
      history,
      intl: { locale },
    } = this.props

    history.push(localisedUrl(locale, links.createWallet))
  }

  handleReceive = (context) => {
    const { userCurrencyData } = this.state
    const widgetCurrencies = this.returnWidgetCurrencies()
    const filteredCurrencies = user.filterUserCurrencyData(userCurrencyData)
    const flattenedCurrencyData = user.flattenUserCurrencyData(filteredCurrencies)

    const availableWallets = flattenedCurrencyData.filter((item) => {
      const { isMetamask, isConnected, currency, balance } = item

      return (
        (context !== 'Send' || balance) &&
        (!isMetamask || (isMetamask && isConnected)) &&
        (!isWidgetBuild || widgetCurrencies.includes(currency))
      )
    })

    actions.modals.open(constants.modals.CurrencyAction, {
      currencies: availableWallets,
      context,
    })
  }

  handleWithdrawFirstAsset = () => {
    const {
      history,
      intl: { locale },
    } = this.props
    const { userCurrencyData } = this.state
    const availableWallets = user.filterUserCurrencyData(userCurrencyData)

    if (!Object.keys(availableWallets).length) {
      actions.notifications.show(
        constants.notifications.Message,
        {message: (
          <FormattedMessage 
            id="WalletEmptyBalance"
            defaultMessage="No wallets available"
          />
        )}
      )

      return
    }

    const flattenedCurrencyData = user.flattenUserCurrencyData(availableWallets)
    const { currency, address } = flattenedCurrencyData[0]
    let targetCurrency = currency

    switch (currency.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (sms-protected)':
      case 'btc (pin-protected)':
        targetCurrency = 'btc'
    }

    const isToken = erc20Like.isToken({ name: currency })

    history.push(
      localisedUrl(locale, (isToken ? '/token' : '') + `/${targetCurrency}/${address}/send`)
    )
  }

  // TODO: maybe to move it in helpers/user
  returnWidgetCurrencies = () => {
    const { hiddenCoinsList } = this.props
    const widgetCurrencies = ['BTC']

    if (!hiddenCoinsList.includes('BTC (PIN-Protected)')) {
      widgetCurrencies.push('BTC (PIN-Protected)')
    }
    if (!hiddenCoinsList.includes('BTC (Multisig)')) {
      widgetCurrencies.push('BTC (Multisig)')
    }

    widgetCurrencies.push('ETH')
    widgetCurrencies.push('BNB')
    widgetCurrencies.push('GHOST')
    widgetCurrencies.push('NEXT')

    if (isWidgetBuild) {
      if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
        // Multi token widget build
        Object.keys(window.widgetERC20Tokens).forEach((key) => {
          widgetCurrencies.push(key.toUpperCase())
        })
      } else {
        widgetCurrencies.push(config.erc20token.toUpperCase())
      }
    }

    return widgetCurrencies
  }

  addFiatBalanceInUserCurrencyData = (currencyData) => {
    const { tokenStandards } = this.state
    const newData = {}

    function returnFiatBalance(target) {
      return target.balance > 0 && target.infoAboutCurrency?.price_fiat
        ? new BigNumber(target.balance)
            .multipliedBy(target.infoAboutCurrency.price_fiat)
            .dp(2, BigNumber.ROUND_FLOOR)
            .toNumber()
        : 0
    }

    for (let dataKey in currencyData) {
      const dataItem = currencyData[dataKey]

      if ( tokenStandards.includes(dataKey) ) {
        for (let tokenKey in dataItem) {
          const token = dataItem[tokenKey]

          token.fiatBalance = returnFiatBalance(dataItem)

          newData[dataKey] = {
            ...newData[dataKey],
            [tokenKey]: token,
          }
        }
      } else {
        dataItem.fiatBalance = returnFiatBalance(dataItem)
        newData[dataKey] = dataItem
      }
    }

    return newData
  }

  returnBalanceInBtc = (currencyData) => {
    const { tokenStandards } = this.state
    const widgetCurrencies = this.returnWidgetCurrencies()
    let balance = 0

    function returnAmount(target) {
      const name = target.currency || target.name
      if (
        (!isWidgetBuild || widgetCurrencies.includes(name)) &&
        target.infoAboutCurrency?.price_btc &&
        target.balance !== 0
      ) {
        return target.balance * target.infoAboutCurrency.price_btc
      }

      return 0
    }

    for (let dataKey in currencyData) {
      const dataItem = currencyData[dataKey]

      if ( tokenStandards.includes(dataKey) ) {
        for (let tokenKey in dataItem) {
          const token = dataItem[tokenKey]

          balance += returnAmount(token)
        }
      } else {
        balance += returnAmount(dataItem)
      }
    }

    return balance
  }

  returnTotalFiatBalance = (currencyData) => {
    const { tokenStandards } = this.state
    let balance = new BigNumber(0)

    Object.keys(currencyData).forEach((dataKey) => {
      const dataItem = currencyData[dataKey]

      if ( tokenStandards.includes(dataKey) ) {
        for (let tokenKey in dataItem) {
          const token = dataItem[tokenKey]

          balance = balance.plus(token.fiatBalance)
        }
      } else {
        balance = balance.plus(dataItem.fiatBalance)
      }
    })

    return balance.toNumber()
  }

  syncData = () => {
    // that is for noxon, dont delete it :)
    const now = moment().format('HH:mm:ss DD/MM/YYYY')
    const lastCheck = localStorage.getItem(constants.localStorage.lastCheckBalance) || now
    const lastCheckMoment = moment(lastCheck, 'HH:mm:ss DD/MM/YYYY')

    const isFirstCheck = moment(now, 'HH:mm:ss DD/MM/YYYY').isSame(lastCheckMoment)
    const isOneHourAfter = moment(now, 'HH:mm:ss DD/MM/YYYY').isAfter(
      lastCheckMoment.add(1, 'hours')
    )

    const { ethData } = this.props.coinsData

    this.syncTimer = setTimeout(async () => {
      if (config?.entry !== 'mainnet' || !metamask.isCorrectNetwork()) {
        return;
      }
      if (isOneHourAfter || isFirstCheck) {
        localStorage.setItem(constants.localStorage.lastCheckBalance, now)
        try {
          const ipInfo = await stats.getIPInfo()

          const registrationData: {
            locale: string
            ip: string
            widget_url?: string
            wallets?: IUniversalObj[]
          } = {
            locale:
              ipInfo.locale ||
              (navigator.userLanguage || navigator.language || 'en-gb').split('-')[0],
            ip: ipInfo.ip,
          }

          let widgetUrl
          if (appConfig.isWidget) {
            widgetUrl = getTopLocation().origin

            registrationData.widget_url = widgetUrl
          }

          const tokensArray: any[] = Object.values(this.props.coinsData)

          const wallets = tokensArray.map((item) => ({
            symbol: item && item.currency ? item.currency.split(' ')[0] : '',
            type: item && item.currency ? item.currency.split(' ')[1] || 'common' : '',
            address: item && item.address ? item.address : '',
            balance: item && item.balance ? new BigNumber(item.balance).toNumber() : 0,
            public_key: item && item.publicKey ? item.publicKey.toString('Hex') : '',
            entry: config?.entry ? config.entry : 'testnet:undefined',
          }))

          registrationData.wallets = wallets

          await stats.updateUser(ethData.address, getTopLocation().host, registrationData)
        } catch (error) {
          console.group('wallet >%c syncData', 'color: red;')
          console.error(`Sync error in wallet: ${error}`)
          console.groupEnd()
        }
      }
    }, 2000)
  }

  render() {
    const {
      userCurrencyData,
      activeComponentNum,
      multisigPendingCount,
    } = this.state

    const {
      hiddenCoinsList,
      isBalanceFetching,
      activeFiat,
      activeCurrency,
      match: {
        params: { page = null },
      },
    } = this.props

    this.syncData()

    let filteredUserData = user.filterUserCurrencyData(userCurrencyData)
    filteredUserData = this.addFiatBalanceInUserCurrencyData(filteredUserData)

    const balanceInBtc = this.returnBalanceInBtc(filteredUserData)
    const allFiatBalance = this.returnTotalFiatBalance(filteredUserData)
    const tableRows = user.flattenUserCurrencyData(filteredUserData)

    return (
      <DashboardLayout
        page={page}
        isDark={isDark}
        BalanceForm={
          <BalanceForm
            isDark={isDark}
            activeFiat={activeFiat}
            fiatBalance={allFiatBalance}
            currencyBalance={balanceInBtc}
            activeCurrency={activeCurrency}
            handleReceive={this.handleReceive}
            handleWithdraw={this.handleWithdrawFirstAsset}
            isFetching={isBalanceFetching}
            type="wallet"
            currency="btc"
            multisigPendingCount={multisigPendingCount}
          />
        }
      >
        {activeComponentNum === 0 && (
          <CurrenciesList
            isDark={!!isDark}
            tableRows={tableRows}
            hiddenCoinsList={hiddenCoinsList}
            goToСreateWallet={this.goToСreateWallet}
            multisigPendingCount={multisigPendingCount}
          />
        )}
        {activeComponentNum === 1 && <History {...this.props} isDark={isDark} />}
        {activeComponentNum === 2 && <InvoicesList {...this.props} onlyTable={true} isDark={isDark} />}
      </DashboardLayout>
    )
  }
}

export default injectIntl(Wallet)
