import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { connect } from 'redaction'
import SwapApp from 'swap.app'

import { localStorage, constants, links } from 'helpers'
import moment from 'moment/moment'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Title from 'components/PageHeadline/Title/Title'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'

import Orders from './Orders/Orders'
import Confirm from 'components/Confirm/Confirm'
import SaveKeys from 'components/SaveKeys/SaveKeys'


@connect({
  ethData: 'user.ethData',
  btcData: 'user.btcData',
})
export default class Home extends Component {

  static propTypes = {
    ethData: PropTypes.object.isRequired,
    btcData: PropTypes.object.isRequired,
  }

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

  getText = () => {
    const { ethData, btcData } = this.props


    const text = `
${window.location.hostname} emergency instruction
\r\n
\r\n
#ETHEREUM
\r\n
\r\n
Ethereum address: ${ethData.address}  \r\n
Private key: ${ethData.privateKey}\r\n
\r\n
\r\n
How to access tokens and ethers: \r\n
1. Go here https://www.myetherwallet.com/#send-transaction \r\n
2. Select 'Private key'\r\n
3. paste private key to input and click "unlock"\r\n
\r\n
\r\n
\r\n
# BITCOIN\r\n
\r\n
\r\n
Bitcoin address: ${btcData.address}\r\n
Private key: ${btcData.privateKey}\r\n
\r\n
\r\n
1. Go to blockchain.info\r\n
2. login\r\n
3. Go to settings > addresses > import\r\n
4. paste private key and click "Ok"\r\n
\r\n
\r\n
* We don\`t store your private keys and will not be able to restore them!  
    `

    return text
  }

  handleDownload = () => {
    const element = document.createElement('a')
    const text = this.getText()
    const message = 'Check your browser downloads'

    element.setAttribute('href', `data:text/plaincharset=utf-8,${encodeURIComponent(text)}`)
    element.setAttribute('download', `${window.location.hostname}_keys_${moment().format('DD.MM.YYYY')}.txt`)

    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    this.changeView('confirm')

    actions.notifications.show(constants.notifications.Message, {
      message,
    })
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
    const { ethData, btcData } = this.props
    const filterOrders = `${buyCurrency}${sellCurrency}`

    return (
      <section style={{ position: 'relative' }}>
        <PageHeadline >
          {
            view !== 'checkKeys' ? (
              <SaveKeys
                isChange={() => this.changeView('confirm')}
                isDownload={this.handleDownload}
                ethData={ethData}
                btcData={btcData}
              />
            ) : (
              <Fragment>
                <Title>Swap.Online</Title>
                <SubTitle>
                  In the alpha mode, please trade <br />
                  on small amount and contact admin for any issues.<br />
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
