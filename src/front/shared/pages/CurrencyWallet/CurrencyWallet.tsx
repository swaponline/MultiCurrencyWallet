import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { withRouter } from 'react-router-dom'
import erc20Like from 'common/erc20Like'
import { links, constants } from 'helpers'
import { getWalletUrl, getTokenWallet } from 'helpers/links'

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

@connect(
  ({
    core,
    user,
    history: { transactions, swapHistory },
    user: {
      activeFiat,
      activeCurrency,
      isBalanceFetching,
      multisigPendingCount,
    },
  }) => ({
    user,
    activeFiat,
    hiddenCoinsList: core.hiddenCoinsList,
    txHistory: transactions,
    swapHistory,
    activeCurrency,
    isBalanceFetching,
    multisigPendingCount,
  })
)
@withRouter
@CSSModules({ ...styles, ...stylesHere }, { allowMultiple: true })
class CurrencyWallet extends Component<any, any> {
  _mounted = false

  constructor(props) {
    super(props)

    const {
      match: {
        params: { fullName = null, ticker = null, address = null },
      },
      hiddenCoinsList,
    } = props

    const items = actions.core.getWallets({})

    this.updateRedirectUrls({
      address,
      ticker,
      fullName,
    })

    const walletAddress = address

    // оставляю запасной вариант для старых ссылок
    if (fullName) {
      //@ts-ignore
      ticker = fullName
    }

    let itemCurrency = this.filterCurrencies({
      items,
      ticker,
      walletAddress,
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
      //@ts-ignore
      const { currency, address, contractAddress, decimals, balance, infoAboutCurrency } = itemCurrency
      const hasCachedData = lsDataCache.get(`TxHistory_${getCurrencyKey(currency, true).toLowerCase()}_${address}`)
      
      // TODO: delete
      const isErc20Token = erc20Like.erc20.isToken({ name: currency })
      const isBep20Token = erc20Like.bep20.isToken({ name: currency })

      this.state = {
        itemCurrency,
        address,
        walletAddress,
        balance,
        decimals,
        currency,
        txItems: hasCachedData,
        contractAddress,
        hiddenCoinsList,
        isLoading: false,
        infoAboutCurrency,
        filterValue: walletAddress || address || '',
        isErc20Token,
        isBep20Token,
        token: erc20Like.isToken({ name: ticker }),
      }
    }
  }

  componentDidMount() {
    this._mounted = true
    
    const {
      currency,
      itemCurrency,
      token,
      isErc20Token,
      isBep20Token,
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

    if (token) {
      if (isErc20Token) {
        actions.erc20.getBalance(currency.toLowerCase())
      }

      if (isBep20Token) {
        actions.bep20.getBalance(currency.toLowerCase())
      }
    }

    const actionName = isErc20Token
      ? 'erc20' : isBep20Token
      ? 'bep20' : currency.toLowerCase()

    address && actions[getCurrencyKey(actionName, false)]
      .fetchBalance(address)
      .then((balance) => this.setState({ balance }))

    // if address is null, take transactions from current user
    address
      ? actions.history.setTransactions(address, currency.toLowerCase(), this.pullTransactions)
      : actions.user.setTransactions()

    if (!address) {
      actions.core.getSwapHistory()
    }

    const targetCurrency = getCurrencyKey(currency.toLowerCase(), true)
    const firstUrlPart = itemCurrency.tokenKey ? `/token/${itemCurrency.tokenKey}` : `/${targetCurrency}`
    const withdrawUrl = `${firstUrlPart}/${address}/send`
    const receiveUrl = `${firstUrlPart}/${address}/receive`

    const currentUrl = this.props.history.location.pathname.toLowerCase()

    if (currentUrl === withdrawUrl.toLowerCase() && balance !== 0) {
      actions.modals.open(constants.modals.Withdraw, {
        currency,
        address,
        balance,
        infoAboutCurrency,
        hiddenCoinsList,
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

    let {
      match: {
        params: { address = null, fullName = null, ticker = null, action = null },
      },
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
      const items = actions.core.getWallets({})

      this.updateRedirectUrls({
        address,
        ticker,
        fullName,
      })

      const walletAddress = address

      // оставляю запасной вариант для старых ссылок
      if (fullName) {
        ticker = fullName
      }
      
      let itemCurrency = this.filterCurrencies({
        items,
        ticker,
        walletAddress,
      })

      if (itemCurrency.length) {
        itemCurrency = itemCurrency[0]

        const {
          currency,
          address,
          contractAddress,
          decimals,
          balance,
          infoAboutCurrency,
          tokenKey,
        } = itemCurrency
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
            token: erc20Like.isToken({ name: currency }),
          },
          () => {
            if (prevProps.location.pathname !== this.props.location.pathname) {
              if (activeCurrency.toUpperCase() !== activeFiat) {
                actions.user.pullActiveCurrency(currency.toLowerCase())
              }
            }
            const targetCurrency = getCurrencyKey(currency.toLowerCase(), true)
            const firstUrlPart = tokenKey ? `/token/${tokenKey}` : `/${targetCurrency}`
            const withdrawUrl = `${firstUrlPart}/${address}/send`
            const receiveUrl = `${firstUrlPart}/${address}/receive`
            const currentUrl = this.props.location.pathname.toLowerCase()

            if (currentUrl === withdrawUrl.toLowerCase()) {
              actions.modals.open(constants.modals.Withdraw, {
                currency,
                address,
                balance,
                infoAboutCurrency,
                itemCurrency,
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
    this._mounted = false
  }

  filterCurrencies = (params) => {
    const { items, ticker, walletAddress } = params

    return items.filter((item) => {
      if (
        (
          item.currency.toLowerCase() === ticker.toLowerCase() ||
          item.tokenKey?.toLowerCase() === ticker.toLowerCase()
        ) && item.address.toLowerCase() === walletAddress.toLowerCase()
      ) {
        return true
      }
    })
  }

  updateRedirectUrls = (params) => {
    const { address, ticker, fullName, isErc20Token, isBep20Token } = params

    const setRedirectUrl = (url) => {
      this.setState(() => ({
        isRedirecting: true,
        redirectUrl: url,
      }))
    }

    if (!address && !ticker) {
      if (fullName) {
        if (erc20Like.isToken({ name: fullName })) {
          // TODO: сразу передавать нужный ключ для токена
          // TODO: tokenCurrency можно удалить, тк все уже есть в обьекте токена
          const tokenCurrency = isErc20Token ? 'eth' : isBep20Token ? 'bnb' : ''

          const tokenWallet = getTokenWallet({
            tokenName: fullName,
            currency: tokenCurrency,
          })
          setRedirectUrl(tokenWallet)
          return
        }

        if (fullName.toLowerCase() === `bitcoin`) {
          setRedirectUrl(getWalletUrl({ name: 'btc' }))
          return
        }

        if (fullName.toLowerCase() === `ghost`) {
          setRedirectUrl(getWalletUrl({ name: 'ghost' }))
          return
        }

        if (fullName.toLowerCase() === `next`) {
          setRedirectUrl(getWalletUrl({ name: 'next' }))
          return
        }

        if (fullName.toLowerCase() === `ethereum`) {
          setRedirectUrl(getWalletUrl({ name: 'eth' }))
          return
        }

        if (fullName.toLowerCase() === `binance coin`) {
          setRedirectUrl(getWalletUrl({ name: 'bnb' }))
          return
        }
      }

      throw new Error('Currency wallet: wrong url parameters')
    }
  }

  getRows = (txHistory) => {
    this.setState(() => ({ rows: txHistory }))
  }

  pullTransactions = (transactions) => {
    if (!this._mounted) return
    //@ts-ignore: strictNullChecks
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

  handleReceive = () => {
    const { currency, address } = this.state

    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.ReceiveModal, {
      currency,
      address,
    })
  }

  handleInvoice = () => {
    const { currency, address } = this.state

    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.InvoiceModal, {
      currency: currency.toUpperCase(),
      toAddress: address,
    })
  }

  handleWithdraw = () => {
    const {
      history,
      intl: { locale },
    } = this.props
    const { itemCurrency, currency, address } = this.state

    const targetCurrency = getCurrencyKey(currency.toLowerCase(), true).toLowerCase()
    const firstUrlPart = itemCurrency.tokenKey ? `/token/${itemCurrency.tokenKey}` : `/${targetCurrency}`

    history.push(localisedUrl(
      locale,
      `${firstUrlPart}/${address}/send`
    ))
  }

  handleGoTrade = () => {
    const { currency } = this.state
    const {
      history,
      intl: { locale },
    } = this.props

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
      isBalanceFetching,
      activeFiat,
      activeCurrency,
      multisigPendingCount,
    } = this.props

    const {
      currency,
      itemCurrency,
      balance,
      fullName,
      infoAboutCurrency,
      isRedirecting,
      txItems,
      filterValue,
      isLoading,
    } = this.state

    let currencyKey = getCurrencyKey(currency, true)

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

    const showSwapHistory = (address.toLowerCase() === itemCurrency.address.toLowerCase())

    if (showSwapHistory)
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

    if (infoAboutCurrency && infoAboutCurrency.price_fiat) {
      currencyFiatBalance =
        new BigNumber(balance).dp(6, BigNumber.ROUND_FLOOR).toString() as any * infoAboutCurrency.price_fiat as any
      changePercent = infoAboutCurrency.percent_change_1h
    } else {
      currencyFiatBalance = 0
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
            txHistory
              ?
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
                multisigPendingCount={multisigPendingCount}
              />
              :
              <Fragment>
                {/*
                //@ts-ignore */}
                <ContentLoader leftSideContent />
              </Fragment>
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
                    {/*
                    //@ts-ignore */}
                    <ContentLoader rideSideContent empty nonHeader inner />
                  </div>
                ))}
            {(!txHistory || isLoading) && (
              <div styleName="historyContent">
                {/*
                //@ts-ignore */}
                <ContentLoader rideSideContent nonHeader />
              </div>
            )}
          </div>
          {showSwapHistory && (
            <>
              {!actions.btcmultisig.isBTCSMSAddress(`${address}`) &&
                !actions.btcmultisig.isBTCMSUserAddress(`${address}`) &&
                (swapHistory.filter((item) => item.step >= 1).length > 0 ? (
                    <SwapsHistory orders={swapHistory.filter((item) => item.step >= 4)} />
                  ) : (
                    ''
                  )
                )
              }
            </>
          )}
        </DashboardLayout>
        <Fragment>{seoPage && seoPage.footer && <div>{seoPage.footer}</div>}</Fragment>
      </div>
    )
  }
}

export default injectIntl(CurrencyWallet)
