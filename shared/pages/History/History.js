import React, { Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'

import Row from './Row/Row'
import SwapsHistory from './SwapsHistory/SwapsHistory'

import Table from 'components/Table/Table'
import Filter from 'components/Filter/Filter'
import PageHeadline from 'components/PageHeadline/PageHeadline'


const filterHistory = (items, filter) => {
  if (filter === 'sent') {
    return items.filter(({ direction }) => direction === 'out')
  }

  if (filter === 'received') {
    return items.filter(({ direction }) => direction === 'in')
  }

  return items
}

@connect(({ history: { transactions, filter, swapHistory } }) => ({
  items: filterHistory(transactions, filter),
  swapHistory,
}))
export default class History extends Component {

  componentDidMount() {
    actions.analytics.dataEvent('open-page-history')
    actions.user.setTransactions()
  }

  render() {
    const { items, swapHistory } = this.props
    const titles = [ 'Coin', 'Status', 'Statement', 'Amount' ]

    return (
      <section>
        <PageHeadline subTitle="History" />
        <SwapsHistory orders={Object.values(swapHistory).filter(item => item.step >= 4)} />
        <h3 >All transactions</h3>
        <Filter />
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
