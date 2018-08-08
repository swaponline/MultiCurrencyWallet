import React, { Component } from 'react'

import { connect } from 'redaction'
import { constants } from 'helpers'
import actions from 'redux/actions'

import Table from 'components/Table/Table'
import Confirm from 'components/Confirm/Confirm'
import SaveKeys from 'components/SaveKeys/SaveKeys'
import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import { WithdrawButton } from 'components/controls'

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

  handleImportKeys = () => {
    actions.modals.open(constants.modals.ImportKeys, {})
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
          <Title>SWAP.ONLINE - CRYPTOCURRENCY WALLET WITH ATOMIC SWAP EXCHANGE</Title>
          <SubTitle>
            Check out our <a href="https://wiki.swap.online/en.pdf" target="_balnk" rel="noreferrer noopener">project brief</a> and participate in smart airdrop.
          </SubTitle>
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
        { view === 'off' && <SaveKeys isDownload={this.handleDownload} isChange={() => this.changeView('on')} /> }
        { process.env.TESTNET && <WithdrawButton onClick={this.handleClear} >Exit</WithdrawButton> }
        <WithdrawButton onClick={this.handleDownload}>Download keys</WithdrawButton>
        <WithdrawButton onClick={this.handleImportKeys}>Import keys</WithdrawButton>
      </section>
    )
  }
}
