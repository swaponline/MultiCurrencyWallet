import React, { Component } from 'react'
import { connect } from 'redaction'
import { constants } from 'helpers'
import actions from 'redux/actions'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import SaveKeys from 'components/SaveKeys/SaveKeys'
import Table from 'components/Table/Table'
import Confirm from 'components/Confirm/Confirm'

import Row from './Row/Row'


@connect(({ user: { ethData, btcData, tokensData, eosData, nimData } }) => ({
  tokens: Object.keys(tokensData).map(k => (tokensData[k])),
  items: [ ethData, btcData, eosData /* eosData  nimData */ ],
}))
export default class Wallet extends Component {

  state = {
    view: 'off',
  }

  componentWillMount() {
    if (localStorage.getItem(constants.localStorage.privateKeysSaved)) {
      this.changeView('checkKeys')
    }
  }

  componentDidMount() {
    actions.user.getBalances()
    actions.analytics.dataEvent('open-page-balances')
    // if (!localStorage.getItem(constants.localStorage.privateKeysSaved)) {
    //   actions.modals.open(constants.modals.PrivateKeys, {})
    // }
  }

  handleClear = process.env.MAINNET ? () => {} : (event) => {
    event.preventDefault()
    window.localStorage.clear()
    window.location.reload()
  }

  handleDownload = () => {
    actions.user.downloadPrivateKeys()
    this.changeView('checkKeys')
  }

  handleConfirm = () => {
    this.changeView('checkKeys')
    localStorage.setItem(constants.localStorage.privateKeysSaved, true)
  }

  changeView = (view) => {
    this.setState({
      view,
    })
  }

  render() {
    const { view } = this.state
    const { items, tokens } = this.props
    const titles = [ 'Coin', 'Name', 'Balance', 'Address', '' ]

    return (
      <section>
        <PageHeadline>
          <SubTitle>Wallet</SubTitle>
          { view === 'off' && <SaveKeys isDownload={this.handleDownload} isChange={() => this.changeView('on')} /> }
        </PageHeadline>
        <Confirm
          title="Are you sure ?"
          isConfirm={() => this.handleConfirm()}
          isReject={() => this.changeView('off')}
          animation={view === 'on'}
        />
        <Table
          titles={titles}
          rows={[].concat(items, tokens)}
          rowRender={(row, index) => (
            <Row key={index} {...row} />
          )}
        />
        { process.env.TESTNET && <a href="" onClick={this.handleClear} >Exit (clear localstorage)</a> }
      </section>
    )
  }
}
