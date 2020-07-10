import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import Slider from 'pages/Wallet/components/WallerSlider'
import { withRouter } from 'react-router-dom'

import helpers, { links, constants, ethToken } from 'helpers'
import { getTokenWallet, getBitcoinWallet, getEtherWallet } from 'helpers/links'

import CSSModules from 'react-css-modules'
import styles from './CurrencyWallet.scss'
import stylesHere from '../History/History.scss'

import Row from 'pages/History/Row/Row'
import SwapsHistory from 'pages/History/SwapsHistory/SwapsHistory'

import Table from 'components/tables/Table/Table'
import PageSeo from 'components/Seo/PageSeo'
import { getSeoPage } from 'helpers/seo'
import { injectIntl, defineMessages } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import config from 'app-config'
import BalanceForm from 'components/BalanceForm/BalanceForm'
import { BigNumber } from 'bignumber.js'
import ContentLoader from 'components/loaders/ContentLoader/ContentLoader'
import FilterForm from 'components/FilterForm/FilterForm'
import DashboardLayout from 'components/layout/DashboardLayout/DashboardLayout'

import getCurrencyKey from 'helpers/getCurrencyKey'
import lsDataCache from 'helpers/lsDataCache'


const isWidgetBuild = config && config.isWidget
const isDark = localStorage.getItem(constants.localStorage.isDark)

@connect(({ signUp: { isSigned } }) => ({
  isSigned,
}))
@connect(
  ({
    core,
    user,
    history: { transactions, swapHistory },
    history,
    user: {
      ethData,
      btcData,
      activeFiat,
      activeCurrency,
      btcMultisigSMSData,
      btcMultisigUserData,
      isFetching,
      isBalanceFetching,
      tokensData,
      multisigStatus,
    },
  }) => ({
    items: [
      ethData,
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      ...Object.keys(tokensData).map((k) => tokensData[k]),
    ],
    tokens: [...Object.keys(tokensData).map((k) => tokensData[k])],
    user,
    activeFiat,
    historyTx: history,
    hiddenCoinsList: core.hiddenCoinsList,
    txHistory: transactions,
    swapHistory,
    isFetching,
    activeCurrency,
    isBalanceFetching,
    multisigStatus,
  })
)
@injectIntl
@withRouter
@CSSModules({ ...styles, ...stylesHere }, { allowMultiple: true })
export default class CurrencyWallet extends Component {
  constructor(props) {
    super(props)

    const {
      match: {
        params: { fullName = null, ticker = null, address = null, action = null },
      },
      intl: { locale },
      //items,
      txHistory,
      hiddenCoinsList,
    } = props

    const items = actions.core.getWallets()

    if (!address && !ticker) {
      if (fullName) {
        // Если это токен - перенаправляем на адрес /token/name/address
        if (ethToken.isEthToken({ name: fullName })) {
          this.state = {
            ...this.state,
            ...{
              isRedirecting: true,
              redirectUrl: getTokenWallet(fullName),
            },
          }
          return
        }

        if (fullName.toLowerCase() === `bitcoin`) {
          this.state = {
            ...this.state,
            ...{
              isRedirecting: true,
              redirectUrl: getBitcoinWallet(),
            },
          }
          return
        }

        if (fullName.toLowerCase() === `ethereum`) {
          this.state = {
            ...this.state,
            ...{
              isRedirecting: true,
              redirectUrl: getEtherWallet(),
            },
          }
          return
        }
      }
      // @ToDO throw error
    }

    const walletAddress = address

    // оставляю запасной вариант для старых ссылок
    if (fullName) {
      ticker = fullName
    }

    // MultiWallet - after Sweep - названию валюты доверять нельзя - нужно проверяться также адрес - и выбирать по адресу
    let itemCurrency = items.filter((item) => {
      if (ethToken.isEthToken({ name: ticker })) {
        if (
          item.currency.toLowerCase() === ticker.toLowerCase() &&
          item.address.toLowerCase() === walletAddress.toLowerCase()
        ) {
          return true
        }
      } else {
        if (!ethToken.isEthToken({ name: ticker }) && item.address.toLowerCase() === walletAddress.toLowerCase()) {
          return true
        }
      }
    })
    if (!itemCurrency.length) {
      itemCurrency = items.filter((item) => {
        if (item.balance > 0 && item.currency.toLowerCase() === ticker.toLowerCase()) return true
      })
    }
    if (!itemCurrency.length) {
      itemCurrency = items.filter((item) => {
        if (item.balance >= 0 && item.currency.toLowerCase() === ticker.toLowerCase()) return true
      })
    }

    if (itemCurrency.length) {
      itemCurrency = itemCurrency[0]

      const { currency, address, contractAddress, decimals, balance, infoAboutCurrency } = itemCurrency

      const hasCachedData = lsDataCache.get(`TxHistory_${getCurrencyKey(currency, true).toLowerCase()}_${address}`)

      this.state = {
        itemCurrency,
        address,
        balance,
        decimals,
        currency,
        txItems: hasCachedData,
        contractAddress,
        hiddenCoinsList,
        isLoading: false,
        infoAboutCurrency,
        filterValue: address || '',
        token: ethToken.isEthToken({ name: ticker }),
      }
    }
  }

  componentDidMount() {
    console.log('CurrencyWallet mounted')
    const {
      currency,
      itemCurrency,
      token,
      isRedirecting,
      redirectUrl,
      balance,
      infoAboutCurrency,
      hiddenCoinsList,
    } = this.state

    actions.user.getBalances()

    if (isRedirecting) {
      const {
        history,
        intl: { locale },
      } = this.props
      history.push(localisedUrl(locale, redirectUrl))
      setTimeout(() => {
        location.reload()
      }, 100)
      return
    }

    let {
      match: {
        params: { address = null },
      },
      activeCurrency,
      activeFiat
    } = this.props

    if (currency) {
      // actions.analytics.dataEvent(`open-page-${currency.toLowerCase()}-wallet`)
    }
    if (token) {
      actions.token.getBalance(currency.toLowerCase())
    }

    // set balance for the address
    address &&
      actions[getCurrencyKey(currency.toLowerCase())]
        .fetchBalance(address)
        .then((balance) => this.setState({ balance }))

    this.setLocalStorageItems()

    // if address is null, take transactions from current user
    address
      ? actions.history.setTransactions(address, currency.toLowerCase(), this.pullTransactions)
      : actions.user.setTransactions()

    if (!address) actions.core.getSwapHistory()

    const { Withdraw, WithdrawMultisigSMS, WithdrawMultisigUser } = constants.modals

    const targetCurrency = getCurrencyKey(currency.toLowerCase(), true)
    const isToken = helpers.ethToken.isEthToken({ name: currency })

    const withdrawUrl = (isToken ? '/token' : '') + `/${targetCurrency}/${address}/send`
    const receiveUrl = (isToken ? '/token' : '') + `/${targetCurrency}/${address}/receive`

    if (this.props.history.location.pathname.toLowerCase() === withdrawUrl.toLowerCase() && balance !== 0) {
      let modalType = Withdraw
      if (itemCurrency.isSmsProtected) modalType = WithdrawMultisigSMS
      if (itemCurrency.isUserProtected) modalType = WithdrawMultisigUser

      actions.modals.open(modalType, {
        currency,
        address,
        balance,
        infoAboutCurrency,
        hiddenCoinsList,
        currencyRate: itemCurrency.currencyRate,
      })
      if (activeCurrency.toUpperCase() !== activeFiat) {
        actions.user.pullActiveCurrency(currency.toLowerCase())
      }
    }
    if (this.props.history.location.pathname.toLowerCase() === receiveUrl.toLowerCase()) {
      actions.modals.open(constants.modals.ReceiveModal, {
        currency,
        address,
      })
    }
  }

  componentDidUpdate(prevProps) {
    const { currency } = this.state

    const { activeFiat } = this.props
    const { activeFiat: prevFiat } = prevProps

    let {
      match: {
        params: { address = null, fullName = null, ticker = null, action = null },
      },
      hiddenCoinsList,
      activeCurrency
    } = this.props

    let {
      match: {
        params: { address: prevAddress = null },
      },
    } = prevProps
    if (prevAddress !== address) {
      address
        ? actions.history.setTransactions(address, currency.toLowerCase(), this.pullTransactions)
        : actions.user.setTransactions()
    }

    if (
      prevProps.location.pathname !== this.props.location.pathname ||
      prevProps.isBalanceFetching !== this.props.isBalanceFetching
    ) {
      const items = actions.core.getWallets()

      if (!address && !ticker) {
        if (fullName) {
          // Если это токен - перенаправляем на адрес /token/name/address
          if (ethToken.isEthToken({ name: fullName })) {
            this.state = {
              ...this.state,
              ...{
                isRedirecting: true,
                redirectUrl: getTokenWallet(fullName),
              },
            }
            return
          }

          if (fullName.toLowerCase() === `bitcoin`) {
            this.state = {
              ...this.state,
              ...{
                isRedirecting: true,
                redirectUrl: getBitcoinWallet(),
              },
            }
            return
          }

          if (fullName.toLowerCase() === `ethereum`) {
            this.state = {
              ...this.state,
              ...{
                isRedirecting: true,
                redirectUrl: getEtherWallet(),
              },
            }
            return
          }
        }
        // @ToDO throw error
      }

      const walletAddress = address

      // оставляю запасной вариант для старых ссылок
      if (fullName) {
        ticker = fullName
      }
      // MultiWallet - after Sweep - названию валюты доверять нельзя - нужно проверяться также адрес - и выбирать по адресу
      let itemCurrency = items.filter((item) => {
        if (ethToken.isEthToken({ name: ticker })) {
          if (
            item.currency.toLowerCase() === ticker.toLowerCase() &&
            item.address.toLowerCase() === walletAddress.toLowerCase()
          ) {
            return true
          }
        } else {
          if (!ethToken.isEthToken({ name: ticker }) && item.address.toLowerCase() === walletAddress.toLowerCase()) {
            return true
          }
        }
      })

      if (itemCurrency.length) {
        itemCurrency = itemCurrency[0]

        const { currency, address, contractAddress, decimals, balance, infoAboutCurrency } = itemCurrency

        const { Withdraw, WithdrawMultisigSMS, WithdrawMultisigUser } = constants.modals

        let modalWithdraw = Withdraw
        if (itemCurrency.isSmsProtected) modalWithdraw = WithdrawMultisigSMS
        if (itemCurrency.isUserProtected) modalWithdraw = WithdrawMultisigUser

        const {
          txItems: oldTxItems,
        } = this.state

        const hasCachedData = lsDataCache.get(`TxHistory_${getCurrencyKey(currency, true).toLowerCase()}_${address}`)

        this.setState(
          {
            itemCurrency,
            address,
            decimals,
            currency,
            balance,
            txItems: (hasCachedData || oldTxItems),
            contractAddress,
            isLoading: false,
            infoAboutCurrency,
            filterValue: address || '',
            token: ethToken.isEthToken({ name: ticker }),
          },
          () => {
            if (prevProps.location.pathname !== this.props.location.pathname) {
              if (activeCurrency.toUpperCase() !== activeFiat) {
                actions.user.pullActiveCurrency(currency.toLowerCase())
              }
            }
            const targetCurrency = getCurrencyKey(currency.toLowerCase(), true)
            const isToken = helpers.ethToken.isEthToken({ name: currency })

            const withdrawUrl = (isToken ? '/token' : '') + `/${targetCurrency}/${address}/send`
            const receiveUrl = (isToken ? '/token' : '') + `/${targetCurrency}/${address}/receive`
            const currentUrl = this.props.location.pathname.toLowerCase()

            if (currentUrl === withdrawUrl.toLowerCase()) {
              actions.modals.open(modalWithdraw, {
                currency,
                address,
                balance,
                infoAboutCurrency,
                hiddenCoinsList,
                itemCurrency,
                currencyRate: itemCurrency.currencyRate,
              })
            }
            if (currentUrl === receiveUrl.toLowerCase()) {
              actions.modals.open(constants.modals.ReceiveModal, {
                currency,
                address,
              })
            }
          }
        )
      }
    }
  }

  componentWillUnmount() {
    console.log('CurrencyWallet unmounted')
  }

  getRows = (txHistory) => {
    this.setState(() => ({ rows: txHistory }))
  }

  pullTransactions = (transactions) => {
    let data = [].concat([], ...transactions).sort((a, b) => b.date - a.date)
    this.setState({
      txItems: data,
    })

    const {
      currency,
      address,
    } = this.state

    lsDataCache.push({
      key: `TxHistory_${getCurrencyKey(currency, true).toLowerCase()}_${address}`,
      data,
      time: 3600,
    })
  }

  setLocalStorageItems = () => {
    const isClosedNotifyBlockBanner = localStorage.getItem(constants.localStorage.isClosedNotifyBlockBanner)
    const isClosedNotifyBlockSignUp = localStorage.getItem(constants.localStorage.isClosedNotifyBlockSignUp)
    const isPrivateKeysSaved = localStorage.getItem(constants.localStorage.privateKeysSaved)
    const walletTitle = localStorage.getItem(constants.localStorage.walletTitle)

    this.setState({
      isClosedNotifyBlockBanner,
      isClosedNotifyBlockSignUp,
      walletTitle,
      isPrivateKeysSaved,
    })
  }

  handleReceive = () => {
    const { currency, address } = this.state

    actions.modals.open(constants.modals.ReceiveModal, {
      currency,
      address,
    })
  }

  handleInvoice = () => {
    const { currency, address } = this.state

    actions.modals.open(constants.modals.InvoiceModal, {
      currency: currency.toUpperCase(),
      toAddress: address,
    })
  }

  handleWithdraw = () => {
    const {
      history,
      hiddenCoinsList,
      intl: { locale },
    } = this.props
    const { itemCurrency, currency, address, contractAddress, decimals, balance, isBalanceEmpty } = this.state

    // actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    let withdrawModal = constants.modals.Withdraw
    if (itemCurrency.isSmsProtected) withdrawModal = withdrawModal = constants.modals.WithdrawMultisigSMS
    if (itemCurrency.isUserProtected) withdrawModal = constants.modals.WithdrawMultisigUser

    let targetCurrency = getCurrencyKey(currency.toLowerCase(), true).toLowerCase()

    const isToken = helpers.ethToken.isEthToken({ name: currency })

    history.push(localisedUrl(locale, (isToken ? '/token' : '') + `/${targetCurrency}/${address}/send`))

    /*
    actions.modals.open(withdrawModal, {
      currency,
      address,
      contractAddress,
      decimals,
      balance,
      hiddenCoinsList,
    })
    */
  }

  handleGoWalletHome = () => {
    const {
      history,
      intl: { locale },
    } = this.props

    history.push(localisedUrl(locale, links.wallet))
  }

  handleGoTrade = () => {
    const { currency } = this.state
    const {
      history,
      intl: { locale },
    } = this.props
    // was pointOfSell
    history.push(localisedUrl(locale, `${links.exchange}/btc-to-${currency.toLowerCase()}`))
  }

  rowRender = (row, rowIndex) => {
    const {
      history,
      activeFiat,
    } = this.props

    return <Row key={rowIndex} {...row} activeFiat={activeFiat} history={history} />
  }

  handleFilterChange = ({ target }) => {
    const { value } = target

    this.setState(() => ({ filterValue: value }))
  }

  handleFilter = () => {
    const { filterValue, txItems } = this.state
    this.loading()

    if (filterValue.toLowerCase() && filterValue.length) {
      const newRows = txItems.filter(
        ({ address }) => address && address.toLowerCase().includes(filterValue.toLowerCase())
      )

      this.setState(() => ({ txItems: newRows }))
    } else {
      this.resetFilter()
    }
  }

  loading = () => {
    this.setState(() => ({ isLoading: true }))
    setTimeout(() => this.setState(() => ({ isLoading: false })), 1000)
  }

  resetFilter = () => {
    this.loading()
    const { address, currency } = this.state
    this.setState(() => ({ filterValue: address }))
    actions.history.setTransactions(address, currency.toLowerCase(), this.pullTransactions)
  }

  render() {
    let {
      swapHistory,
      txHistory,
      location,
      match: {
        params: { address = null },
      },
      intl,
      hiddenCoinsList,
      isSigned,
      isBalanceFetching,
      activeFiat,
      multisigStatus,
      activeCurrency,
    } = this.props

    const {
      currency,
      balance,
      fullName,
      infoAboutCurrency,
      isRedirecting,
      txItems,
      filterValue,
      isLoading,
      multiplier,
    } = this.state

    const currencyKey = getCurrencyKey(currency, true)

    if (isRedirecting) return null

    txHistory = txItems || txHistory

    if (txHistory) {
      txHistory = txHistory.filter((tx) => {
        if (tx && tx.type) {
          return tx.type.toLowerCase() === currencyKey.toLowerCase()
        }
        return false
      })
    }

    swapHistory = Object.keys(swapHistory)
      .map((key) => swapHistory[key])
      .filter((swap) => swap.sellCurrency === currency || swap.buyCurrency === currency)
      .reverse()

    const seoPage = getSeoPage(location.pathname)

    const titleSwapOnline = defineMessages({
      metaTitle: {
        id: 'CurrencyWalletTitle',
        defaultMessage: 'Swap.Online - {fullName} ({currency}) Web Wallet with Atomic Swap.',
      },
    })
    const titleWidgetBuild = defineMessages({
      metaTitle: {
        id: 'CurrencyWalletWidgetBuildTitle',
        defaultMessage: '{fullName} ({currency}) Web Wallet with Atomic Swap.',
      },
    })
    const title = isWidgetBuild ? titleWidgetBuild : titleSwapOnline

    const description = defineMessages({
      metaDescription: {
        id: 'CurrencyWallet154',
        defaultMessage:
          'Atomic Swap Wallet allows you to manage and securely exchange ${fullName} (${currency}) with 0% fees. Based on Multi-Sig and Atomic Swap technologies.',
      },
    })

    if (hiddenCoinsList.includes(currency)) {
      actions.core.markCoinAsVisible(currency)
    }

    let currencyFiatBalance
    let changePercent

    if (infoAboutCurrency) {
      currencyFiatBalance =
        BigNumber(balance).dp(5, BigNumber.ROUND_FLOOR).toString() * infoAboutCurrency.price_usd
      changePercent = infoAboutCurrency.percent_change_1h
    } else {
      currencyFiatBalance = 0
    }

    let settings = {
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 6000,
      fade: true,
      slidesToShow: 1,
      slidesToScroll: 1,
    }

    return (
      <div styleName={`root ${isDark ? 'dark' : ''}`}>
        <PageSeo
          location={location}
          defaultTitle={intl.formatMessage(title.metaTitle, {
            fullName,
            currency,
          })}
          defaultDescription={intl.formatMessage(description.metaDescription, {
            fullName,
            currency,
          })}
        />

        <DashboardLayout
          page="history"
          BalanceForm={
            txHistory ? (
              <BalanceForm
                address={address}
                activeFiat={activeFiat}
                currencyBalance={balance}
                fiatBalance={currencyFiatBalance}
                changePercent={changePercent}
                activeCurrency={activeCurrency}
                isFetching={isBalanceFetching}
                handleReceive={this.handleReceive}
                handleWithdraw={this.handleWithdraw}
                handleExchange={this.handleGoTrade}
                handleInvoice={this.handleInvoice}
                showButtons={actions.user.isOwner(address, currency)}
                currency={currency.toLowerCase()}
                singleWallet={true}
              />
            ) : (
                <ContentLoader leftSideContent />
              )
          }
        >
          <div styleName={`currencyWalletActivity ${isDark ? 'darkActivity' : ''}`}>
            <FilterForm
              filterValue={filterValue}
              onSubmit={this.handleFilter}
              onChange={this.handleFilterChange}
              resetFilter={this.resetFilter}
            />
            {txHistory &&
              !isLoading &&
              (txHistory.length > 0 ? (
                <Table rows={txHistory} styleName="currencyHistory" rowRender={this.rowRender} />
              ) : (
                  <div styleName="historyContent">
                    <ContentLoader rideSideContent empty nonHeader inner />
                  </div>
                ))}
            {(!txHistory || isLoading) && (
              <div styleName="historyContent">
                <ContentLoader rideSideContent nonHeader />
              </div>
            )}
          </div>
          {!actions.btcmultisig.isBTCSMSAddress(`${address}`) &&
            !actions.btcmultisig.isBTCMSUserAddress(`${address}`) &&
            (swapHistory.filter((item) => item.step >= 4).length > 0 ? (
              <div styleName={`currencyWalletSwapHistory ${isDark ? 'darkHistory' : ''}`}>
                <SwapsHistory orders={swapHistory.filter((item) => item.step >= 4)} />
              </div>
            ) : (
                ''
              ))}
        </DashboardLayout>
        <Fragment>{seoPage && seoPage.footer && <div>{seoPage.footer}</div>}</Fragment>
      </div>
    )
  }
}
