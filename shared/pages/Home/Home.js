import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { connect } from 'redaction'

import { localStorage, constants } from 'helpers'
import moment from 'moment/moment'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Title from 'components/PageHeadline/Title/Title'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import SearchSwap from 'components/SearchSwap/SearchSwap'
import Button from 'components/controls/Button/Button'
import ButtonsInRow from 'components/controls/ButtonsInRow/ButtonsInRow'

import Orders from './Orders/Orders'
import Field from './Field/Field'


@connect({
  ethData: 'user.ethData',
  btcData: 'user.btcData',
})
export default class Home extends Component {

  static propTypes = {
    ethData: PropTypes.object.isRequired,
    btcData: PropTypes.object.isRequired,
  }

  constructor({ initialData }) {
    super()

    const { buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      buyCurrency: buyCurrency || 'eth',
      sellCurrency: sellCurrency || 'btc',
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

    localStorage.setItem(constants.localStorage.privateKeysSaved, true)

    actions.notifications.show(constants.notifications.Message, {
      message,
    })
  }

  handleConfirm = () => {
    this.changeView('checkKeys')
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
      <section>
        <PageHeadline>
          <Title>Swap.Online</Title>
          <SubTitle>
            In the alpha mode, please trade <br />
            on small amount and contact admin for any issues.<br />
            Subscribe to <a href="https://t.me/swaponlineint" onClick={this.handleClickTelegram} target="_blank">telegram</a> and <a href="/" target="_blank"  onClick={this.handleClickMailing}>mailing list</a>
          </SubTitle>
        </PageHeadline>
        <SearchSwap
          updateFilter={this.handleSellCurrencySelect}
          buyCurrency={buyCurrency}
          sellCurrency={sellCurrency}
          flipCurrency={this.flipCurrency}
        />
        <Orders filter={filterOrders} />
      </section>
    )
  }
}

// view === 'saveKeys' ? (
//   <Fragment>
//     <SubTitle>
//       Your private keys.<br />
//       Download the keys by clicking on the this button <br />
//       or take a screenshot of this page, then confirm it
//     </SubTitle>
//     <Field
//       label={ethData.currency}
//       privateKey={ethData.privateKey}
//     />
//     <Field
//       label={btcData.currency}
//       privateKey={btcData.privateKey}
//     />
//     <br />
//     <Button brand onClick={this.handleDownload}>Download</Button>
//   </Fragment>
// ) : (
//   <Fragment>