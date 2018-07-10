import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import { localStorage, constants, links } from 'helpers'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Title from 'components/PageHeadline/Title/Title'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'

import Orders from './Orders/Orders'
import Confirm from 'components/Confirm/Confirm'
import SaveKeys from 'components/SaveKeys/SaveKeys'


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

  componentWillMount() {
    if (localStorage.getItem(constants.localStorage.privateKeysSaved)) {
      this.changeView('checkKeys')
    }
  }

  changeView = (view) => {
    this.setState({
      view,
    })
  }


  handleDownload = () => {
    actions.user.downloadPrivateKeys()
    this.changeView('checkKeys')
  }

  handleConfirm = () => {
    this.changeView('checkKeys')
    localStorage.setItem(constants.localStorage.privateKeysSaved, true)
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
          {
            view !== 'checkKeys' ? (
              <SaveKeys
                isChange={() => this.changeView('confirm')}
                isDownload={this.handleDownload}
              />
            ) : (
              <Fragment>
                <Title>Swap.Online</Title>
                <SubTitle>
                  Crypto-currency market (we working directly with bitcoin!). We <font color="red">♥</font> IPFS, JavaScript and ⚡Lightning Network. Check our <a href="https://wiki.swap.online/en.pdf" onClick={this.handleClickSummary}>summary.pdf</a>. Contact team@swap.online for any issues
                  {/* Subscribe to <a href="https://t.me/swaponlineint" onClick={this.handleClickTelegram} target="_blank">telegram</a> and <a href="/" target="_blank"  onClick={this.handleClickMailing}>mailing list</a> */}
                </SubTitle>
              </Fragment>
            )
          }
          <Orders
            filter={filterOrders}
            handleSellCurrencySelect={this.handleSellCurrencySelect}
            buyCurrency={buyCurrency}
            sellCurrency={sellCurrency}
            flipCurrency={this.flipCurrency}
          />
          <Confirm
            title="Are you sure ?"
            isConfirm={() => this.handleConfirm()}
            isReject={() => this.changeView('saveKeys')}
            animation={view === 'confirm'}
          />
        </PageHeadline>
      </section>
    )
  }
}
