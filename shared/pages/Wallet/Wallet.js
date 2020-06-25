import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Wallet.scss'
import { isMobile } from 'react-device-detect'
import moment from 'moment'
import firestore from 'helpers/firebase/firestore'

import History from 'pages/History/History'

import helpers, { links, constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { getActivatedCurrencies } from 'helpers/user'

import { injectIntl } from 'react-intl'

import config from 'helpers/externalConfig'
import { withRouter } from 'react-router'
import CurrenciesList from './CurrenciesList'
import InvoicesList from 'pages/Invoices/InvoicesList'

import DashboardLayout from 'components/layout/DashboardLayout/DashboardLayout'
import BalanceForm from 'components/BalanceForm/BalanceForm'

import { BigNumber } from 'bignumber.js'


const isWidgetBuild = config && config.isWidget
const isDark = localStorage.getItem(constants.localStorage.isDark)

@connect(
  ({
    core: { hiddenCoinsList },
    user,
    user: {
      activeFiat,
      ethData,
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      btcMultisigUserDataList,
      tokensData,
      isFetching,
      isBalanceFetching,
      multisigPendingCount,
      activeCurrency
    },
    currencies: { items: currencies },
    createWallet: { currencies: assets },
    modals,
    ui: { dashboardModalsAllowed },
  }) => {
    let widgetMultiTokens = []
    if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
      Object.keys(window.widgetERC20Tokens).forEach((key) => {
        widgetMultiTokens.push(key.toUpperCase())
      })
    }
    const tokens =
      config && config.isWidget
        ? window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length
          ? widgetMultiTokens
          : [config.erc20token.toUpperCase()]
        : Object.keys(tokensData).map((k) => tokensData[k].currency)

    const tokensItems = Object.keys(tokensData).map((k) => tokensData[k])

    const allData = [
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      ethData,
      ...Object.keys(tokensData).map((k) => tokensData[k]),
    ].map(({ account, keyPair, ...data }) => ({
      ...data,
    }))

    const items = (config && config.isWidget
      ? [btcData, ethData]
      : [btcData, btcMultisigSMSData, btcMultisigUserData, ethData]
    ).map((data) => data.currency)

    return {
      tokens,
      items,
      allData,
      tokensItems,
      currencies,
      assets,
      isFetching,
      isBalanceFetching,
      multisigPendingCount,
      hiddenCoinsList: hiddenCoinsList,
      userEthAddress: ethData.address,
      user,
      activeCurrency,
      activeFiat,
      tokensData: {
        ethData,
        btcData,
        btcMultisigSMSData,
        btcMultisigUserData,
        btcMultisigUserDataList,
      },
      dashboardView: dashboardModalsAllowed,
      modals,
    }
  }
)
@injectIntl
@withRouter
@connect(({ signUp: { isSigned } }) => ({
  isSigned,
}))
@cssModules(styles, { allowMultiple: true })
export default class Wallet extends Component {
  constructor(props) {
    super(props)

    const {
      match: {
        params: { page = null },
      },
      multisigPendingCount,
    } = props

    let activeView = 0

    if (page === 'history' && !isMobile) {
      activeView = 1
    }
    if (page === 'invoices') activeView = 2

    this.state = {
      activeView,
      btcBalance: 0,
      enabledCurrencies: getActivatedCurrencies(),
      multisigPendingCount,
    }
  }

  componentDidUpdate(prevProps) {
    const {
      activeFiat,
      match: {
        params: { page = null },
      },
      multisigPendingCount,
    } = this.props


    const {
      activeFiat: prevFiat,
      match: {
        params: { page: prevPage = null },
      },
      multisigPendingCount: prevMultisigPendingCount,
    } = prevProps

    if (activeFiat !== prevFiat) {
      this.getFiats()
    }

    if (page !== prevPage || multisigPendingCount !== prevMultisigPendingCount) {
      let activeView = 0

      if (page === 'history' && !isMobile) activeView = 1
      if (page === 'invoices') activeView = 2

      this.setState({
        activeView,
        multisigPendingCount,
      })
    }
  }

  componentDidMount() {
    const { params, url } = this.props.match
    const {
      multisigPendingCount,
    } = this.props

    actions.user.getBalances()

    actions.user.fetchMultisigStatus()

    this.getFiats()

    if (url.includes('send')) {
      this.handleWithdraw(params)
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

  handleWithdraw = params => {
    const { allData } = this.props
    const { address, amount } = params
    const item = allData.find(({ currency }) => currency.toLowerCase() === params.currency.toLowerCase())

    actions.modals.open(constants.modals.Withdraw, {
      ...item,
      toAddress: address,
      amount,
    })
  }

  goToСreateWallet = () => {
    const {
      history,
      intl: { locale },
    } = this.props

    history.push(localisedUrl(locale, links.createWallet))
  }

  handleGoExchange = () => {
    const {
      history,
      intl: { locale },
    } = this.props

    if (isWidgetBuild && !config.isFullBuild) {
      history.push(localisedUrl(locale, links.pointOfSell))
    } else {
      history.push(localisedUrl(locale, links.exchange))
    }
  }

  handleModalOpen = context => {
    const { enabledCurrencies } = this.state
    const { hiddenCoinsList } = this.props

    /* @ToDo Вынести отдельно */
    // Набор валют для виджета
    const widgetCurrencies = ['BTC']
    if (!hiddenCoinsList.includes('BTC (SMS-Protected)')) widgetCurrencies.push('BTC (SMS-Protected)')
    if (!hiddenCoinsList.includes('BTC (PIN-Protected)')) widgetCurrencies.push('BTC (PIN-Protected)')
    if (!hiddenCoinsList.includes('BTC (Multisig)')) widgetCurrencies.push('BTC (Multisig)')
    widgetCurrencies.push('ETH')
    if (isWidgetBuild) {
      if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
        // Multi token widget build
        Object.keys(window.widgetERC20Tokens).forEach(key => {
          widgetCurrencies.push(key.toUpperCase())
        })
      } else {
        widgetCurrencies.push(config.erc20token.toUpperCase())
      }
    }

    const currencies = actions.core.getWallets()
      .filter(({ currency, balance }) => {
        return (
          ((context === 'Send') ? balance : true)
          && !hiddenCoinsList.includes(currency)
          && enabledCurrencies.includes(currency)
          && ((isWidgetBuild) ?
            widgetCurrencies.includes(currency)
            : true)
        )
      })

    actions.modals.open(constants.modals.CurrencyAction, {
      currencies,
      context
    })
  }

  handleWithdrawFirstAsset = () => {
    const { hiddenCoinsList } = this.props
    const {
      history,
      intl: { locale },
    } = this.props

    const {
      Withdraw,
      WithdrawMultisigSMS,
      WithdrawMultisigUser,
    } = constants.modals

    const allData = actions.core.getWallets()

    let tableRows = allData.filter(({ currency, address, balance }) => {
      // @ToDo - В будущем нужно убрать проверку только по типу монеты.
      // Старую проверку оставил, чтобы у старых пользователей не вывалились скрытые кошельки

      return (!hiddenCoinsList.includes(currency) && !hiddenCoinsList.includes(`${currency}:${address}`)) || balance > 0
    })

    const { currency, address } = tableRows[0];

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

  checkBalance = () => {
    // that is for noxon, dont delete it :)
    const now = moment().format('HH:mm:ss DD/MM/YYYY')
    const lastCheck = localStorage.getItem(constants.localStorage.lastCheckBalance) || now
    const lastCheckMoment = moment(lastCheck, 'HH:mm:ss DD/MM/YYYY')

    const isFirstCheck = moment(now, 'HH:mm:ss DD/MM/YYYY').isSame(lastCheckMoment)
    const isOneHourAfter = moment(now, 'HH:mm:ss DD/MM/YYYY').isAfter(lastCheckMoment.add(1, 'hours'))

    const { ethData, btcData } = this.props.tokensData

    const balancesData = {
      ethBalance: ethData.balance,
      btcBalance: btcData.balance,
      ethAddress: ethData.address,
      btcAddress: btcData.address,
    }

    if (isOneHourAfter || isFirstCheck) {
      localStorage.setItem(constants.localStorage.lastCheckBalance, now)
      firestore.updateUserData(balancesData)
    }
  }


  getFiats = async () => {
    const { activeFiat } = this.props
    const { fiatsRates } = await actions.user.getFiats()

    if (fiatsRates) {
      const fiatRate = fiatsRates.find(({ key }) => key === activeFiat)
      this.setState(() => ({ multiplier: fiatRate.value }))
    }
  }


  handleModalOpen = context => {
    const { enabledCurrencies } = this.state
    const { hiddenCoinsList } = this.props

    /* @ToDo Вынести в экшены и убрать все дубляжи из всех компонентов */
    // Набор валют для виджета
    const widgetCurrencies = ['BTC']
    if (!hiddenCoinsList.includes('BTC (SMS-Protected)')) widgetCurrencies.push('BTC (SMS-Protected)')
    if (!hiddenCoinsList.includes('BTC (PIN-Protected)')) widgetCurrencies.push('BTC (PIN-Protected)')
    if (!hiddenCoinsList.includes('BTC (Multisig)')) widgetCurrencies.push('BTC (Multisig)')
    widgetCurrencies.push('ETH')
    if (isWidgetBuild) {
      if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
        // Multi token widget build
        Object.keys(window.widgetERC20Tokens).forEach(key => {
          widgetCurrencies.push(key.toUpperCase())
        })
      } else {
        widgetCurrencies.push(config.erc20token.toUpperCase())
      }
    }

    const currencies = actions.core.getWallets()
      .filter(({ currency, balance }) => {
        return (
          ((context === 'Send') ? balance : true)
          && !hiddenCoinsList.includes(currency)
          && enabledCurrencies.includes(currency)
          && ((isWidgetBuild) ?
            widgetCurrencies.includes(currency)
            : true)
        )
      })

    actions.modals.open(constants.modals.CurrencyAction, {
      currencies,
      context
    })
  }

  render() {
    const {
      multiplier,
      activeView,
      infoAboutCurrency,
      enabledCurrencies,
      multisigPendingCount,
    } = this.state

    const {
      hiddenCoinsList,
      isBalanceFetching,
      activeFiat,
      activeCurrency,
      match: {
        params: {
          page = null,
        },
      },
    } = this.props

    const allData = actions.core.getWallets()

    this.checkBalance()

    let btcBalance = 0
    let changePercent = 0

    // Набор валют для виджета
    const widgetCurrencies = ['BTC']
    if (!hiddenCoinsList.includes('BTC (SMS-Protected)')) widgetCurrencies.push('BTC (SMS-Protected)')
    if (!hiddenCoinsList.includes('BTC (PIN-Protected)')) widgetCurrencies.push('BTC (PIN-Protected)')
    if (!hiddenCoinsList.includes('BTC (Multisig)')) widgetCurrencies.push('BTC (Multisig)')
    widgetCurrencies.push('ETH')
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

    let tableRows = allData.filter(({ currency, address, balance }) => {
      // @ToDo - В будущем нужно убрать проверку только по типу монеты.
      // Старую проверку оставил, чтобы у старых пользователей не вывалились скрытые кошельки

      return (!hiddenCoinsList.includes(currency) && !hiddenCoinsList.includes(`${currency}:${address}`)) || balance > 0
    })


    if (isWidgetBuild) {
      //tableRows = allData.filter(({ currency }) => widgetCurrencies.includes(currency))
      tableRows = allData.filter(
        ({ currency, address }) =>
          !hiddenCoinsList.includes(currency) && !hiddenCoinsList.includes(`${currency}:${address}`)
      )
      // Отфильтруем валюты, исключив те, которые не используются в этом билде
      tableRows = tableRows.filter(({ currency }) => widgetCurrencies.includes(currency))
    }

    tableRows = tableRows.filter(({ currency }) => enabledCurrencies.includes(currency))

    tableRows = tableRows.map(el => {
      return ({
        ...el,
        balance: el.balance,
        fiatBalance: (el.balance > 0 && el.infoAboutCurrency) ? BigNumber(el.balance)
          .multipliedBy(el.infoAboutCurrency.price_usd)
          .multipliedBy(multiplier || 1)
          .dp(2, BigNumber.ROUND_FLOOR) : 0
      })
    })

    tableRows.forEach(({ name, infoAboutCurrency, balance, currency }) => {
      const currName = currency || name

      if ((!isWidgetBuild || widgetCurrencies.includes(currName)) && infoAboutCurrency && balance !== 0) {
        if (currName === 'BTC') {
          changePercent = infoAboutCurrency.percent_change_1h
        }
        btcBalance += balance * infoAboutCurrency.price_btc
      }
    })

    const allFiatBalance = tableRows.reduce((acc, cur) => BigNumber(cur.fiatBalance).plus(acc), 0)

    return (
      <DashboardLayout
        page={page}
        isDark={isDark}
        BalanceForm={(
          <BalanceForm
            isDark={isDark}
            activeFiat={activeFiat}
            fiatBalance={allFiatBalance}
            currencyBalance={btcBalance}
            changePercent={changePercent}
            activeCurrency={activeCurrency}
            handleReceive={this.handleModalOpen}
            handleWithdraw={this.handleWithdrawFirstAsset}
            handleExchange={this.handleGoExchange}
            isFetching={isBalanceFetching}
            type="wallet"
            currency="btc"
            infoAboutCurrency={infoAboutCurrency}
          />
        )}
      >
        {
          activeView === 0 &&
          <CurrenciesList
            isDark={isDark}
            tableRows={tableRows}
            {...this.state}
            {...this.props}
            goToСreateWallet={this.goToСreateWallet}
            multisigPendingCount={multisigPendingCount}
            getExCurrencyRate={(currencySymbol, rate) => this.getExCurrencyRate(currencySymbol, rate)}
          />
        }
        {activeView === 1 && (<History {...this.props} isDark={isDark} />)}
        {activeView === 2 && (<InvoicesList {...this.props} onlyTable={true} isDark={isDark} />)}
      </DashboardLayout>
    )
  }
}
