import { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { connect } from 'redaction'
import cssModules from 'react-css-modules'
import { isMobile } from 'react-device-detect'
import { BigNumber } from 'bignumber.js'
import moment from 'moment'

import appConfig from 'app-config'
import actions from 'redux/actions'
import { links, constants, stats, user, routing } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import config from 'helpers/externalConfig'
import metamask from 'helpers/metamask'
import wpLogoutModal from 'helpers/wpLogoutModal'
import feedback from 'helpers/feedback'

import InvoicesList from 'pages/Invoices/InvoicesList'
import History from 'pages/History/History'
import DashboardLayout from 'components/layout/DashboardLayout/DashboardLayout'
import BalanceForm from 'components/BalanceForm/BalanceForm'
import CurrenciesList from './CurrenciesList'
import styles from './Wallet.scss'

const host = window.location.hostname || document.location.host
const isWidgetBuild = config && config.isWidget

@connect(
  ({
    core: { hiddenCoinsList },
    user,
    user: {
      activeFiat,
      ethData,
      bnbData,
      maticData,
      arbethData,
      aurethData,
      xdaiData,
      ftmData,
      movrData,
      oneData,
      ameData,
      avaxData,
      btcData,
      ghostData,
      nextData,
      phiData,
      phi_v2Data,
      tokensData,
      btcMultisigSMSData,
      btcMultisigUserData,
      btcMultisigUserDataList,
      isBalanceFetching,
      multisigPendingCount,
      activeCurrency,
      metamaskData,
    },
    currencies: { items: currencies },
    modals,
  }) => {
    const userCurrencyData = [
      ethData,
      bnbData,
      maticData,
      arbethData,
      aurethData,
      xdaiData,
      ftmData,
      avaxData,
      movrData,
      oneData,
      ameData,
      btcData,
      ghostData,
      nextData,
      phiData,
      phi_v2Data,
      ...Object.keys(tokensData).map((k) => tokensData[k]),
    ]

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
        bnbData,
        maticData,
        arbethData,
        aurethData,
        xdaiData,
        ftmData,
        avaxData,
        movrData,
        oneData,
        ameData,
        phiData,
        phi_v2Data,
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
  },
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
    } = props

    let activeComponentNum = 0

    if (page === 'history' && !isMobile) {
      activeComponentNum = 1
    }
    if (page === 'invoices') {
      activeComponentNum = 2
    }

    this.state = {
      activeComponentNum,
      btcBalance: 0,
      enabledCurrencies: user.getActivatedCurrencies(),
      multisigPendingCount,
    }
    window.testSaveShamirsSecrets = () => { this.testSaveShamirsSecrets() }
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
    } = this.props

    if (
      pathname.toLowerCase() !== prevPathname.toLowerCase()
      && pathname.toLowerCase() === links.connectWallet.toLowerCase()
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
    // @ts-ignore
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

    if (pathname.toLowerCase() === links.connectWallet.toLowerCase()) {
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
    const currencyNames = currencies.map(({ value, name }) => value || name)

    await actions.user.getInfoAboutCurrency(currencyNames)
  }

  handleWithdraw = (params) => {
    const { userCurrencyData } = this.state
    const { address, amount } = params
    const item = userCurrencyData.find(
      ({ currency }) => currency.toLowerCase() === params.currency.toLowerCase(),
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
    const widgetCurrencies = user.getWidgetCurrencies()
    const filteredCurrencies = user.filterUserCurrencyData(actions.core.getWallets())

    const availableWallets = filteredCurrencies.filter((item) => {
      const { isMetamask, isConnected, currency, balance } = item

      return (
        (context !== 'Send' || balance)
        && (!isMetamask || (isMetamask && isConnected))
        && (!isWidgetBuild || widgetCurrencies.includes(currency))
      )
    })

    actions.modals.open(constants.modals.CurrencyAction, {
      currencies: availableWallets,
      context,
    })
  }

  showNoWalletsNotification = () => {
    actions.notifications.show(
      constants.notifications.Message,
      { message: (
        <FormattedMessage
          id="WalletEmptyBalance"
          defaultMessage="No wallets available"
        />
      ) },
    )
  }

  handleWithdrawFirstAsset = () => {
    const {
      history,
      intl: { locale },
    } = this.props
    const userCurrencyData = actions.core.getWallets({})
    const availableWallets = user.filterUserCurrencyData(userCurrencyData)

    if (
      !Object.keys(availableWallets).length
      || (Object.keys(availableWallets).length === 1 && !user.isCorrectWalletToShow(availableWallets[0]))
    ) {
      this.showNoWalletsNotification()
      return
    }

    const firstAvailableWallet = availableWallets.find((wallet) => (
      user.isCorrectWalletToShow(wallet)
        && !wallet.balanceError
        && new BigNumber(wallet.balance).isPositive()
    ))

    if (!firstAvailableWallet) {
      this.showNoWalletsNotification()
      return
    }

    const { currency, address, tokenKey } = firstAvailableWallet
    let targetCurrency = currency

    switch (currency.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (sms-protected)':
      case 'btc (pin-protected)':
        targetCurrency = 'btc'
    }

    const firstUrlPart = tokenKey ? `/token/${tokenKey}` : `/${targetCurrency}`

    history.push(
      localisedUrl(locale, `${firstUrlPart}/${address}/send`),
    )
  }

  returnFiatBalanceByWallet = (wallet) => {
    const hasFiatPrice = wallet.balance > 0 && wallet.infoAboutCurrency?.price_fiat

    if (hasFiatPrice) {
      return new BigNumber(wallet.balance)
        .multipliedBy(wallet.infoAboutCurrency.price_fiat)
        .dp(2, BigNumber.ROUND_FLOOR)
        .toNumber()
    }

    return 0
  }

  testSaveShamirsSecrets = () => {
    actions.modals.open(constants.modals.ShamirsSecretSave)
  }
  
  
  addFiatBalanceInUserCurrencyData = (currencyData) => {
    currencyData.forEach((wallet) => {
      wallet.fiatBalance = this.returnFiatBalanceByWallet(wallet)
    })

    return currencyData
  }

  returnBalanceInBtc = (wallet) => {
    const widgetCurrencies = user.getWidgetCurrencies()
    const name = wallet.isToken
      ? wallet.tokenKey.toUpperCase()
      : (wallet.currency || wallet.name)

    if (
      (!isWidgetBuild || widgetCurrencies.includes(name))
      && !wallet.balanceError
      && wallet.infoAboutCurrency?.price_btc
      && wallet.balance > 0
    ) {
      return wallet.balance * wallet.infoAboutCurrency.price_btc
    }

    return 0
  }

  returnTotalBalanceInBtc = (currencyData) => {
    let balance = new BigNumber(0)

    currencyData.forEach((wallet) => {
      balance = balance.plus(this.returnBalanceInBtc(wallet))
    })

    return balance.toNumber()
  }

  returnTotalFiatBalance = (currencyData) => {
    let balance = new BigNumber(0)

    currencyData.forEach((wallet) => {
      balance = balance.plus(wallet.fiatBalance)
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
      lastCheckMoment.add(1, 'hours'),
    )

    const { coinsData, coinsData: ethData } = this.props

    this.syncTimer = setTimeout(async () => {
      if (host === 'localhost' || config?.entry !== 'mainnet' || !metamask.isCorrectNetwork()) {
        return
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
              ipInfo.locale
              || (navigator.userLanguage || navigator.language || 'en-gb').split('-')[0],
            ip: ipInfo.ip,
          }

          let widgetUrl
          if (appConfig.isWidget) {
            widgetUrl = routing.getTopLocation().origin

            registrationData.widget_url = widgetUrl
          }

          const tokensArray: any[] = Object.values(coinsData)

          const wallets = tokensArray.map((item) => ({
            symbol: item && item.currency ? item.currency.split(' ')[0] : '',
            type: item && item.currency ? item.currency.split(' ')[1] || 'common' : '',
            address: item && item.address ? item.address : '',
            balance: item && item.balance ? new BigNumber(item.balance).toNumber() : 0,
            public_key: item && item.publicKey ? item.publicKey.toString('Hex') : '',
            entry: config?.entry ? config.entry : 'testnet:undefined',
          }))

          registrationData.wallets = wallets

          await stats.updateUser(ethData.address, routing.getTopLocation().host, registrationData)
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

    if (!config.isWidget || window?.STATISTICS_ENABLED) {
      this.syncData()
    }

    let userWallets = user.filterUserCurrencyData(actions.core.getWallets({}))

    userWallets = this.addFiatBalanceInUserCurrencyData(userWallets)

    const balanceInBtc = this.returnTotalBalanceInBtc(userWallets)
    const allFiatBalance = this.returnTotalFiatBalance(userWallets)

    return (
      <DashboardLayout
        page={page}
        BalanceForm={(
          <BalanceForm
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
        )}
      >
        {activeComponentNum === 0 && (
          <CurrenciesList
            tableRows={userWallets}
            hiddenCoinsList={hiddenCoinsList}
            goToСreateWallet={this.goToСreateWallet}
            multisigPendingCount={multisigPendingCount}
          />
        )}
        {activeComponentNum === 1 && <History {...this.props} />}
        {activeComponentNum === 2 && <InvoicesList {...this.props} onlyTable />}
      </DashboardLayout>
    )
  }
}

export default injectIntl(Wallet)
