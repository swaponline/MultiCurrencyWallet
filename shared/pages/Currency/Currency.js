import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import { constants } from 'helpers'
import { isMobile } from 'react-device-detect'
import { withRouter } from 'react-router'
import actions from 'redux/actions'

import { Link, Redirect } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from '../../helpers/locale'

import CSSModules from 'react-css-modules'
import styles from './Currency.scss'


import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Table from 'components/tables/Table/Table'
import Toggle from 'components/controls/Toggle/Toggle'
import Row from './Row/Row'
import CurrencyButton from 'components/controls/CurrencyButton/CurrencyButton'



@injectIntl
@withRouter
@connect(({
  core: { hiddenCoinsList },
  user: { ethData, btcData, ltcData, tokensData, eosData, nimData, usdtData } }) => ({
  tokens: Object.keys(tokensData).map(k => (tokensData[k])),
  items: [ ethData, btcData, eosData, usdtData, ltcData /* nimData */ ],
  hiddenCoinsList,
}))
@CSSModules(styles, { allowMultiple: true })
export default class Currency extends Component {


  constructor(props) {
    super(props)

    this.state = {
      isBalanceFetching: false,
      isBalanceEmpty: true,
      balance: 0,
    }

    if (!this.getCoin()) {
      this.props.history.push('/')
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

  componentWillMount = () => {
    const { intl: { locale } } = this.props
    if (!this.getCoin()) {
      this.props.history.push(localisedUrl(locale, '/'))
      return false
    }

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
    const { match: { params: { currency } } } = this.props
    const { isBalanceEmpty, balance } = this.state

    return (
      <section styleName={isMobile ? 'currencyMobileSection' : 'currencyMediaSection'}>
        <PageHeadline>
          <Fragment>
            <div styleName="currencyTitle">
              <Title>{currency}</Title>
            </div>
            <SubTitle>
              {currency.toUpperCase()}
              <FormattedMessage id="Currency110" defaultMessage="Trade" />
            </SubTitle>
          </Fragment>
          <div styleName="currencyBalance">
            <FormattedMessage id="Currency101" defaultMessage="Balance: " />
            <span styleName="currencyBalanceValue">{(String(balance).length > 5 ? balance.toFixed(5) : balance) || 0} {currency}</span>
          </div>
          <div styleName="currencyToggle">
            <Toggle onChange={this.handleInWalletChange} checked={this.isInWallet()} />
            <FormattedMessage id="Currency119" defaultMessage="Added to Wallet " />
          <div style={{ marginTop: '20px', height: '20px' }}>
            <CurrencyButton
              wallet="true"
              onClick={this.handleReceive}
              dataTooltip={{
                id: `currency${currency}`,
                isActive: true,
                text: 'Deposit funds to this address of currency wallet',
              }}
            >
              <FormattedMessage id="Row313" defaultMessage="Deposit" />
            </CurrencyButton>
            <CurrencyButton
              wallet="true"
              dataTooltip={{
                isActive: isBalanceEmpty,
                id: `send${currency}`,
                text: 'You can not send this asset, because you have a zero balance.',
              }}
              onClick={this.handleWithdraw}
              disable={isBalanceEmpty}
            >
              <FormattedMessage id="CurrencyWallet100" defaultMessage="Send" />
            </CurrencyButton>
          </div>
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
