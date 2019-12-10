import React, { Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { Link, withRouter } from 'react-router-dom'

import { links, constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './CurrencyWallet.scss'

import Row from 'pages/History/Row/Row'
import SwapsHistory from 'pages/History/SwapsHistory/SwapsHistory'

import Table from 'components/tables/Table/Table'
import { Button } from 'components/controls'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import PageSeo from 'components/Seo/PageSeo'
import { getSeoPage } from 'helpers/seo'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import CurrencyButton from 'components/controls/CurrencyButton/CurrencyButton'
import { localisedUrl } from 'helpers/locale'
import config from 'app-config'


const isWidgetBuild = config && config.isWidget

const titles = [
  <FormattedMessage id="currencyWallet27" defaultMessage="Coin" />,
  <FormattedMessage id="currencyWallet28" defaultMessage="Status" />,
  <FormattedMessage id="currencyWallet29" defaultMessage="Statement" />,
  <FormattedMessage id="currencyWallet30" defaultMessage="Amount" />,
]

@connect(({ core, user, history: { transactions, swapHistory }, history,
  user: {
    ethData,
    btcData,
    btcMultisigSMSData,
    btcMultisigUserData,
    bchData,
    ltcData,
    tokensData, eosData, nimData, telosData/* usdtOmniData */ } }) => ({
      items: [
        ethData,
        btcData,
        btcMultisigSMSData,
        btcMultisigUserData,
        bchData,
        eosData, ltcData, telosData, ...Object.keys(tokensData).map(k => (tokensData[k])) /* nimData, usdtOmniData */],
      tokens: [...Object.keys(tokensData).map(k => (tokensData[k]))],
      user,
      historyTx: history,
      hiddenCoinsList: core.hiddenCoinsList,
      txHistory: transactions,
      swapHistory,
    }))

@injectIntl
@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class CurrencyWallet extends Component {

  constructor() {
    super()

    this.state = {
      currency: null,
      address: null,
      contractAddress: null,
      decimals: null,
      balance: null,
      isBalanceEmpty: false,
    }
  }

  static getDerivedStateFromProps({ match: { params: { fullName } }, intl: { locale }, items, history, tokens }) {
    const item = items.map(item => item.fullName.toLowerCase())
    const token = tokens.map(item => item.fullName).includes(fullName.toUpperCase())

    if (item.includes(fullName.toLowerCase())) {
      const itemCurrency = items.filter(item => item.fullName.toLowerCase() === fullName.toLowerCase())[0]

      const {
        currency,
        address,
        contractAddress,
        decimals,
        balance,
      } = itemCurrency

      return {
        token,
        currency,
        address,
        contractAddress,
        decimals,
        balance,
        isBalanceEmpty: balance === 0,
      }
    }
    history.push(localisedUrl(locale, `${links.notFound}`))
  }

  componentDidMount() {
    const { currency, token } = this.state

    if (currency) {
      // actions.analytics.dataEvent(`open-page-${currency.toLowerCase()}-wallet`)
    }
    if (token) {
      actions.token.getBalance(currency.toLowerCase())
    }

    actions.user.setTransactions()
    actions.core.getSwapHistory()
  }

  handleReceive = () => {
    const { currency, address } = this.state

    actions.modals.open(constants.modals.ReceiveModal, {
      currency,
      address,
    })
  }

  handleWithdraw = () => {
    let { match: { params: { fullName } }, items } = this.props
    const {
      currency,
      address,
      contractAddress,
      decimals,
      balance,
      isBalanceEmpty,
    } = this.state

    // actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    actions.modals.open(constants.modals.Withdraw, {
      currency,
      address,
      contractAddress,
      decimals,
      balance,
    })
  }

  handleGoTrade = (currency) => {
    const { intl: { locale } } = this.props
    const whatDoUserProbablyWantToBuy = currency.toLowerCase()

    this.props.history.push(localisedUrl(locale, `${links.exchange}/${currency.toLowerCase()}-to-${whatDoUserProbablyWantToBuy}`))
  }

  handleEosBuyAccount = async () => {
    actions.modals.open(constants.modals.EosBuyAccount)
  }

  rowRender = (row) => (
    <Row key={row.hash} {...row} />
  )

  render() {

    let { swapHistory, txHistory, location, match: { params: { fullName } }, intl, hiddenCoinsList } = this.props
    const {
      currency,
      address,
      contractAddress,
      decimals,
      balance,
      isBalanceEmpty,
    } = this.state

    txHistory = txHistory
      .filter(tx => tx.type.toLowerCase() === currency.toLowerCase())

    swapHistory = Object.keys(swapHistory)
      .map(key => swapHistory[key])
      .filter(swap => swap.sellCurrency === currency || swap.buyCurrency === currency)

    const seoPage = getSeoPage(location.pathname)
    const eosAccountActivated = localStorage.getItem(constants.localStorage.eosAccountActivated) === 'true'

    const titleSwapOnline = defineMessages({
      metaTitle: {
        id: 'CurrencyWalletTitle',
        defaultMessage: ' AtomicSwapWallet.io - {fullName} ({currency}) Web Wallet with Atomic Swap.',
      },
    })
    const titleWidgetBuild = defineMessages({
      metaTitle: {
        id: 'CurrencyWalletWidgetBuildTitle',
        defaultMessage: '{fullName} ({currency}) Web Wallet with Atomic Swap.',
      },
    })
    const title = (isWidgetBuild) ? titleWidgetBuild : titleSwapOnline

    const description = defineMessages({
      metaDescription: {
        id: 'CurrencyWallet154',
        defaultMessage: 'Atomic Swap Wallet allows you to manage and securely exchange ${fullName} (${currency}) with 0% fees. Based on Multi-Sig and Atomic Swap technologies.',
      },
    })

    if (hiddenCoinsList.includes(currency)) {
      actions.core.markCoinAsVisible(currency)
    }

    const isBlockedCoin = config.noExchangeCoins
      .map(item => item.toLowerCase())
      .includes(currency.toLowerCase())

    return (
      <div className="root">
        <PageSeo
          location={location}
          defaultTitle={intl.formatMessage(title.metaTitle, { fullName, currency })}
          defaultDescription={intl.formatMessage(description.metaDescription, { fullName, currency })} />
        <PageHeadline
          styleName="title"
          subTitle={!!seoPage
            ? seoPage.h1
            : intl.formatMessage(title.metaTitle, { fullName, currency })
          }
        />
        <h3 styleName="subtitle">
          <FormattedMessage
            id="CurrencyWallet168"
            defaultMessage={`Your address: {address}{br}Your {fullName} balance: {balance} {currency}`}
            values={{
              address: <span>{address}</span>,
              br: <br />,
              fullName: `${fullName}`,
              balance: `${balance}`,
              currency: `${currency}`,
            }}
          />
        </h3>
        {currency === 'EOS' && !eosAccountActivated && (<Button onClick={this.handleEosBuyAccount} gray>
          <FormattedMessage id="CurrencyWallet105" defaultMessage="Activate account" />
        </Button>)}
        <div styleName="inRow">
          <CurrencyButton
            onClick={this.handleReceive}
            dataTooltip={{
              id: `deposit${currency}`,
              deposit: 'true',
            }}
          >
            <FormattedMessage id="Row313" defaultMessage="Deposit" />
          </CurrencyButton>
          <CurrencyButton
            onClick={this.handleWithdraw}
            disable={isBalanceEmpty}
            dataTooltip={{
              id: `send${currency}`,
              isActive: isBalanceEmpty,
            }}
          >
            <FormattedMessage id="CurrencyWallet100" defaultMessage="Send" />
          </CurrencyButton>
          {
            !isBlockedCoin && (
              <Button gray onClick={() => this.handleGoTrade(currency)}>
                <FormattedMessage id="CurrencyWallet104" defaultMessage="Exchange" />
              </Button>
            )
          }
        </div>
        {swapHistory.length > 0 && <SwapsHistory orders={swapHistory.filter(item => item.step >= 4)} />}
        <h1 style={{ marginTop: '20px' }} >
          <FormattedMessage id="CurrencyWallet110" defaultMessage="History your transactions" />
        </h1>
        {txHistory && (<Table rows={txHistory} styleName="table history" rowRender={this.rowRender} />)}
        {
          seoPage && seoPage.footer && <div>{seoPage.footer}</div>
        }
      </div>
    )
  }
}
