import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import { localStorage, constants, links } from 'helpers'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Title from 'components/PageHeadline/Title/Title'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'

import Orders from './Orders/Orders'


export default class Home extends Component {

  constructor({ initialData, match: { params: { buy, sell } } }) {
    super()

    const { buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      buyCurrency: buy || buyCurrency || 'eth',
      sellCurrency: sell || sellCurrency || 'btc',
      view: 'saveKeys',
    }
  }

  handleSellCurrencySelect = ({ value }) => {
    let { buyCurrency, sellCurrency } = this.state

    if (value === sellCurrency) {
      sellCurrency = buyCurrency
    }

    buyCurrency = value

    this.setState({
      buyCurrency,
      sellCurrency,
    })
  }

  flipCurrency = () => {
    let { buyCurrency, sellCurrency } = this.state

    this.setState({
      buyCurrency: sellCurrency,
      sellCurrency: buyCurrency,
    })
  }

  handleClickTelegram = () => {
    actions.analytics.dataEvent('orders-click-telegram-group')
    actions.analytics.dataEvent('orders-click-start-swap')
  }

  handleClickMailing = () => {
    actions.analytics.dataEvent('orders-click-start-swap')
    actions.analytics.dataEvent('orders-click-start-swap')
  }

  render() {
    const { buyCurrency, sellCurrency, view } = this.state
    const filterOrders = `${buyCurrency}${sellCurrency}`

    return (
      <section style={{ position: 'relative' }}>
        <PageHeadline >
          <Fragment>
            <Title>Swap.Online - CRYPTO-CURRENCY <abbr title="Over-The-Counter Market">OTC MARKET</abbr></Title>
            <SubTitle>
              We ♥️ IPFS, JavaScript and ⚡️Lightning Network. <br /> Check out our <a href="https://wiki.swap.online/en.pdf" target="_balnk" rel="noreferrer noopener">project brief</a> and participate in <a href="http://swap.wpmix.net/#airdrop" traget="landframe">smart airdrop.</a>
              {/* Subscribe to <a href="https://t.me/swaponlineint" onClick={this.handleClickTelegram} target="_blank">telegram</a> and <a href="/" target="_blank"  onClick={this.handleClickMailing}>mailing list</a> */}
            </SubTitle>
          </Fragment>
          <Orders
            filter={filterOrders}
            handleSellCurrencySelect={this.handleSellCurrencySelect}
            buyCurrency={buyCurrency}
            sellCurrency={sellCurrency}
            flipCurrency={this.flipCurrency}
          />
        </PageHeadline>
      </section>
    )
  }
}
