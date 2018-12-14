import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import { constants } from 'helpers'
import { isMobile } from 'react-device-detect'
import { withRouter } from 'react-router'


import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Table from 'components/tables/Table/Table'

import CSSModules from 'react-css-modules'
import styles from './Currency.scss'

import Row from './Row/Row'
import actions from 'redux/actions'

import { FormattedMessage } from 'react-intl'
import CurrencyButton from 'components/controls/CurrencyButton/CurrencyButton'


@withRouter
@connect(({
  core: { hiddenCoinsList },
  user: { ethData, btcData, ltcData, tokensData, telosData, eosData, nimData, usdtData } }) => ({
  items: [ ethData, btcData, eosData, usdtData, telosData, ltcData, ...Object.keys(tokensData).map(k => (tokensData[k])) /* nimData */ ],
  hiddenCoinsList,
}))
@CSSModules(styles, { allowMultiple: true })
export default class Currency extends Component {


  constructor({ match: { params: { currency } }, items, tokens, history }) {
    super()

    this.state = {
      isBalanceFetching: false,
      isBalanceEmpty: true,
      balance: 0,
    }

    const item = items.map(item => item.currency.toLowerCase())
    if (!item.includes(currency)) {
      return history.push('/NotFound')
    }
  }

  componentDidMount() {
    this.handleReloadBalance()
  }


  getRows = () => {
    let { match:{ params: { currency, address } }, items } = this.props
    currency = currency.toLowerCase()

    return constants.tradeTicker
      .filter(ticker => {
        ticker = ticker.split('-')
        return currency === ticker[0].toLowerCase()
          ? ticker[0].toLowerCase() === currency
          : ticker[1].toLowerCase() === currency
      })
      .map(pair => {
        pair = pair.split('-')
        return {
          from: pair[0],
          to: pair[1],
        }
      })
  }

  getCurrencyName = () => this.props.match.params.currency.toLowerCase()
  getCoin = () => [...this.props.items, ...this.props.tokens].find(coin => coin.currency.toLowerCase() === this.getCurrencyName())

  handleReloadBalance = async () => {
    let { match:{ params: { currency } } } = this.props
    currency = currency.toLowerCase()

    const balance = await actions[currency].getBalance(currency)

    if (balance > 0) {
      this.setState(() => ({
        isBalanceEmpty: false,
        balance,
      }))
    }

  }

  isInWallet = () => !this.props.hiddenCoinsList.includes(this.getCoin().currency)

  handleInWalletChange = (val) => val ? actions.core.markCoinAsVisible(this.getCoin().currency) :
    actions.core.markCoinAsHidden(this.getCoin().currency)

  handleReceive = () => {
    let { match:{ params: { currency } }, items } = this.props
    const itemCurrency = items.filter(item => item.currency.toLowerCase() === currency)[0]
    const { address } = itemCurrency

    currency = currency.toUpperCase()

    actions.modals.open(constants.modals.ReceiveModal, {
      currency,
      address,
    })
  }

  handleWithdraw = () => {
    let { match:{ params: { currency } }, items } = this.props
    const itemCurrency = items.filter(item => item.currency.toLowerCase() === currency)[0]

    actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    actions.modals.open(constants.modals.Withdraw, {
      ...itemCurrency,
    })
  }

  render() {
    const { match: { params: { currency } }, items } = this.props
    const { isBalanceEmpty, balance } = this.state
    return (
      <section styleName={isMobile ? 'currencyMobileSection' : 'currencyMediaSection'}>
        <PageHeadline>
          <Fragment>
            <SubTitle>{currency.toUpperCase()} Trade</SubTitle>
          </Fragment>
          <div styleName="currencyBalance">
            <FormattedMessage id="Currency101" defaultMessage="Balance: " />
            <span styleName="currencyBalanceValue">{(String(balance).length > 5 ? balance.toFixed(5) : balance) || 0} {currency}</span>
          </div>
          <div style={{ marginTop: '20px', height: '20px' }}>
            <CurrencyButton
              wallet="true"
              onClick={this.handleReceive}
              dataTooltip={{
                id: `currency${currency}`,
                deposit: true,
              }}
            >
              <FormattedMessage id="Row313" defaultMessage="Deposit" />
            </CurrencyButton>
            <CurrencyButton
              wallet="true"
              dataTooltip={{
                isActive: isBalanceEmpty,
                id: `send${currency}`,
              }}
              onClick={this.handleWithdraw}
              disable={isBalanceEmpty}
            >
              <FormattedMessage id="CurrencyWallet100" defaultMessage="Send" />
            </CurrencyButton>
          </div>
        </PageHeadline>
        <Table
          titles={['', '']}
          rows={this.getRows()}
          rowRender={(row, index) => (
            <Row key={index} {...row} />
          )}
        />
      </section>
    )
  }
}
