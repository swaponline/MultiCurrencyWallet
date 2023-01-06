import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { withRouter } from 'react-router-dom'
import erc20Like from 'common/erc20Like'
import { links, constants } from 'helpers'

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
import getCoinInfo from 'common/coins/getCoinInfo'


const isWidgetBuild = config && config.isWidget

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
  mounted = false

  constructor(props) {
    super(props)

    const {
      match: {
        params: { ticker = null, address = null },
      },
      hiddenCoinsList,
    } = props

    const items = actions.core.getWallets({})
    const walletAddress = address

    let itemCurrency = this.filterCurrencies({
      items,
      ticker,
      walletAddress,
    })

    if (!itemCurrency.length) {
      itemCurrency = items.filter((item) => {
        if (
          (item.balance >= 0)
          && (
            (item.currency.toLowerCase() === ticker.toLowerCase())
            || (item.tokenKey && item.tokenKey.toLowerCase() === ticker.toLowerCase())
          )
        ) return true
      })
    }

    if (itemCurrency.length) {
      itemCurrency = itemCurrency[0]

      //@ts-ignore
      const { currency, standard, tokenKey, address, contractAddress, decimals, balance, infoAboutCurrency } = itemCurrency
      const hasCachedData = lsDataCache.get(`TxHistory_${getCurrencyKey(currency, true).toLowerCase()}_${walletAddress}`)

console.log('>>> standard, tokenKey', standard, tokenKey)
      this.state = {
        itemCurrency,
        address,
        standard,
        tokenKey,
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
        ticker,
        token: erc20Like.isToken({ name: ticker }),
      }
    }
  }

  componentDidMount() {
    this.mounted = true
    
    const {
      currency,
      itemCurrency,
      itemCurrency: {
        tokenKey,
        standard,
      },
      token,
      balance,
      infoAboutCurrency,
      hiddenCoinsList,
      ticker,
      walletAddress,
    } = this.state

    let {
      match: {
        params: {
          address = null,
          action,
        },
      },
      activeCurrency,
      activeFiat
    } = this.props

    if (action == 'send') {
      actions.user.getBalances()
    }

    if (token && standard) {
      actions[standard].getBalance(currency.toLowerCase(), walletAddress).then((balance) => {
        this.setState({
          balance,
        })
      })
    } else {
      const actionName = currency.toLowerCase()

      address && actions[getCurrencyKey(actionName, false)]
        .fetchBalance(address)
        .then((balance) => this.setState({ balance }))
    }

    if (action !== 'send') {
      actions.history.setTransactions(walletAddress, ticker.toLowerCase())
    }

    if (!address) {
      actions.core.getSwapHistory()
    }

    const targetCurrency = getCurrencyKey(currency.toLowerCase(), true)
    const firstUrlPart = tokenKey ? `/token/${tokenKey}` : `/${targetCurrency}`
    const withdrawUrl = `${firstUrlPart}/${address}/send`
    const receiveUrl = `${firstUrlPart}/${address}/receive`

    const currentUrl = this.props.history.location.pathname.toLowerCase()

    if (currentUrl === withdrawUrl.toLowerCase() && balance !== 0) {
      actions.modals.open(constants.modals.Withdraw, {
        currency,
        address,
        balance,
        itemCurrency,
        infoAboutCurrency,
        hiddenCoinsList,
      })
      if (activeCurrency.toUpperCase() !== activeFiat) {
        actions.user.pullActiveCurrency(currency.toLowerCase())
      }
    }

    if (this.props.history.location.pathname.toLowerCase() === receiveUrl.toLowerCase()) {
      actions.modals.open(constants.modals.ReceiveModal, {
        currency: (tokenKey || currency),
        address,
        standard,
      })
    }
  }

  componentDidUpdate(prevProps) {
    let {
      txHistory: prevTransactions,
      match: {
        params: { address: prevAddress = null },
      },
    } = prevProps

    let {
      txHistory,
      match: {
        params: { address = null, ticker = null, action = null },
      },
      activeCurrency,
      activeFiat,
    } = this.props

    const { currency } = this.state

    if (JSON.stringify(txHistory) !== JSON.stringify(prevTransactions)) {
      this.updateTransactions()
    }

    if (
      prevProps.location.pathname !== this.props.location.pathname ||
      prevProps.isBalanceFetching !== this.props.isBalanceFetching
    ) {
      const items = actions.core.getWallets({})
      const walletAddress = address
      
      let itemCurrency = this.filterCurrencies({
        items,
        ticker,
        walletAddress,
      })

      if (!itemCurrency.length) {
        itemCurrency = items.filter((item) => {
          if (
            (item.balance >= 0)
            && (
              (item.currency.toLowerCase() === ticker.toLowerCase())
              || (item.tokenKey && item.tokenKey.toLowerCase() === ticker.toLowerCase())
            )
          ) return true
        })
      }

      if (itemCurrency.length) {
        itemCurrency = itemCurrency[0]

        const {
          currency,
          contractAddress,
          decimals,
          balance,
          infoAboutCurrency,
          tokenKey,
          standard,
        } = itemCurrency
        const {
          txItems: oldTxItems,
        } = this.state

        const hasCachedData = lsDataCache.get(`TxHistory_${getCurrencyKey(currency, true).toLowerCase()}_${address}`)

        if (!this.mounted) return
        const token = erc20Like.isToken({ name: ticker })

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
            token,
          },
          () => {
            if (prevProps.location.pathname !== this.props.location.pathname) {
              if (activeCurrency.toUpperCase() !== activeFiat) {
                actions.user.pullActiveCurrency(currency.toLowerCase())
              }
              if (token && standard) {
                actions[standard].getBalance(currency.toLowerCase(), address).then((balance) => {
                  this.setState({
                    balance,
                  })
                })
              } else {
                const actionName = currency.toLowerCase()

                address && actions[getCurrencyKey(actionName, false)]
                  .fetchBalance(address)
                  .then((balance) => this.setState({ balance }))
              }

              if (action !== 'send') {
                actions.history.setTransactions(address, ticker.toLowerCase())
              }

              if (!address) {
                actions.core.getSwapHistory()
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
                currency: (tokenKey || currency),
                address,
                standard,
              })
            }
          }
        )
      }
    }
  }

  componentWillUnmount() {
    this.mounted = false
  }

  filterCurrencies = (params) => {
    const { items, ticker, walletAddress } = params

    const {
      coin,
      blockchain,
    } = getCoinInfo(ticker)

    return items.filter((item) => {
      let {currency: currencyName} = item

      switch (currencyName.toLowerCase()) {
        case 'btc (multisig)':
        case 'btc (sms-protected)':
        case 'btc (pin-protected)':
          currencyName = 'btc'
      }

      const blockchainOk = (blockchain && item.blockchain)
        ? item.blockchain.toLowerCase() === blockchain.toLowerCase()
        : ((blockchain && !item.blockchain) || (!blockchain && item.blockchain))
          ? false
          : true

      if (
        currencyName.toLowerCase() === coin.toLowerCase() &&
        item.address.toLowerCase() === walletAddress.toLowerCase() &&
        blockchainOk
      ) {
        return true
      }
    })
  }

  updateTransactions = () => {
    if (!this.mounted) return

    const { txHistory } = this.props
    const { currency, address } = this.state

    this.setState(() => ({
      txItems: txHistory,
    }))

    lsDataCache.push({
      key: `TxHistory_${getCurrencyKey(currency, true).toLowerCase()}_${address}`,
      data: txHistory,
      time: 3600,
    })
  }

  handleReceive = () => {
    const {
      currency,
      address,
      itemCurrency: {
        tokenKey,
        standard,
      },
    } = this.state

    actions.modals.open(constants.modals.ReceiveModal, {
      currency: (tokenKey || currency),
      address,
      standard,
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
    actions.history.setTransactions(address, currency.toLowerCase())
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
      itemCurrency: {
        isToken,
        tokenKey,
      },
      balance,
      infoAboutCurrency,
      txItems,
      filterValue,
      isLoading,
    } = this.state

    let currencyName = currency.toLowerCase()
    let currencyViewName = (isToken) ? currency.replaceAll(`*`,``).toLowerCase() : currency.toLowerCase()

    switch (currencyName) {
      case 'btc (multisig)':
      case 'btc (sms-protected)':
      case 'btc (pin-protected)':
        currencyName = 'btc'
    }

    txHistory = txItems || txHistory

    if (txHistory) {
      
      txHistory = txHistory.filter((tx) => {
        if (tx?.type) {
          return (isToken) ? (tx.tokenKey === tokenKey) : (tx.type.toLowerCase() === currencyName)
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

    if (infoAboutCurrency && infoAboutCurrency.price_fiat) {
      currencyFiatBalance =
        new BigNumber(balance).dp(6, BigNumber.ROUND_FLOOR).toString() as any * infoAboutCurrency.price_fiat as any
    } else {
      currencyFiatBalance = 0
    }

    return (
      <div styleName="root">
        <PageSeo
          location={location}
          defaultTitle={intl.formatMessage(title.metaTitle, {
            fullName: currency,
            currency,
          })}
          defaultDescription={intl.formatMessage(description.metaDescription, {
            fullName: currency,
            currency,
          })}
        />

        <DashboardLayout
          page="history"
          BalanceForm={
            <BalanceForm
              type="currencyWallet"
              activeFiat={activeFiat}
              currencyBalance={balance}
              fiatBalance={currencyFiatBalance}
              activeCurrency={activeCurrency}
              isFetching={isBalanceFetching}
              handleReceive={this.handleReceive}
              handleWithdraw={this.handleWithdraw}
              handleInvoice={this.handleInvoice}
              showButtons={actions.user.isOwner(
                address,
                itemCurrency.tokenKey || currencyName
              )}
              currency={currency.toLowerCase()}
              currencyView={currencyViewName}
              singleWallet={true}
              multisigPendingCount={multisigPendingCount}
            />
          }
        >
          <div styleName="currencyWalletActivity">
            <FilterForm
              filterValue={filterValue}
              onSubmit={this.handleFilter}
              onChange={this.handleFilterChange}
              resetFilter={this.resetFilter}
            />
            {txHistory &&
              !isLoading &&
              (txHistory.length > 0 ? (
                // TODO: use the infinite list component or smth else
                // if we have lots of tx with the Table then it 
                // load long time and display all transaction
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
          {showSwapHistory && (
            <>
              {!actions.btcmultisig.isBTCMSUserAddress(`${address}`) &&
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
