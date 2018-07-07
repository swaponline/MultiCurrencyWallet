import React, { Component } from 'react'
import { connect } from 'redaction'
import { constants } from 'helpers'
import actions from 'redux/actions'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import SaveKeys from 'components/SaveKeys/SaveKeys'
import Table from 'components/Table/Table'

import Row from './Row/Row'


@connect(({ user: { ethData, btcData, tokensData, eosData, nimData } }) => ({
  items: [ ethData, btcData /* eosData  nimData */ ],
  tokensData,
}))
export default class Balances extends Component {

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

  render() {
    const { items, tokensData } = this.props
    const titles = [ 'Coin', 'Name', 'Balance', 'Address', '' ]

    Object.keys(tokensData).map(k => items.push(tokensData[k]))

    return (
      <section>
        <PageHeadline>
          <SubTitle>Balances</SubTitle>
          <SaveKeys isDownload={() => actions.user.downloadPrivateKeys()} />
        </PageHeadline>
        <Table
          titles={titles}
          rows={items}
          rowRender={(row, index) => (
            <Row key={index} {...row} />
          )}
        />
        { process.env.TESTNET && <a href="" onClick={this.handleClear} >Exit (clear localstorage)</a> }
      </section>
    )
  }
}
