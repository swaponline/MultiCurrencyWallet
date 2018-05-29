import React, { Component } from 'react'
import { connect } from 'redaction'
import { constants } from 'helpers'
import actions from 'redux/actions'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Table from 'components/Table/Table'

import Row from './Row/Row'


@connect(({ user: { ethData, btcData, tokenData, nimData } }) => ({
  items: [ ethData, btcData, tokenData/* , nimData */ ],
  ethAddress: ethData.address,
  btcAddress: btcData.address,
}))
export default class Balances extends Component {

  componentWillMount() {
    const { ethAddress, btcAddress } = this.props

    actions.user.getBalances(ethAddress, btcAddress)

    if (!localStorage.getItem(constants.localStorage.privateKeysSaved)) {
      // actions.modals.open(constants.modals.PrivateKeys)
    }
  }

  render() {
    const { items } = this.props

    const titles = [ 'Coin', 'Name', 'Balance', 'Address', '' ]

    return (
      <section>
        <PageHeadline subtitle="Balances" />
        <Table
          titles={titles}
          rows={items}
          rowRender={(row, index) => (
            <Row key={index} {...row} />
          )}
        />
      </section>
    )
  }
}
