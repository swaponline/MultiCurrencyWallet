import React, { Component } from 'react'
import { connect } from 'redaction'
import { constants } from 'helpers'
import actions from 'redux/actions'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Table from 'components/Table/Table'

import Row from './Row/Row'


@connect(({ user: { ethData, btcData, tokensData, eosData, nimData } }) => ({
  items: [ ethData, btcData /* eosData  nimData */ ],
  tokensData,
  ethAddress: ethData.address,
  btcAddress: btcData.address,
}))
export default class Balances extends Component {

  componentWillMount() {
    if (!localStorage.getItem(constants.localStorage.demoMoneyReceived)) {
      actions.user.getDemoMoney()
    }
  }

  componentDidMount() {
    actions.user.getBalances()
    actions.analytics.dataEvent('open-page-balances')
    // if (!localStorage.getItem(constants.localStorage.privateKeysSaved)) {
    //   actions.modals.open(constants.modals.PrivateKeys, {})
    // }
  }

  render() {
    const { items, ethAddress, btcAddress, tokensData } = this.props
    const titles = [ 'Coin', 'Name', 'Balance', 'Address', '' ]
    const addresses = { ethAddress, btcAddress }

    Object.keys(tokensData).map(k => items.push(tokensData[k]))

    return (
      <section>
        <PageHeadline subTitle="Balances" />
        <Table
          titles={titles}
          rows={items}
          rowRender={(row, index) => (
            <Row key={index} addresses={addresses} {...row} />
          )}
        />
      </section>
    )
  }
}
