import React, { Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'

import Row from './Row/Row'
import SwapsHistory from './SwapsHistory/SwapsHistory'


import styles from 'components/tables/Table/Table.scss'
import Filter from './Filter/Filter'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import InfiniteScrollTable from 'components/tables/InfiniteScrollTable/InfiniteScrollTable'


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
  state = {
    renderedItems: 10,
  }

  componentDidMount() {
    actions.analytics.dataEvent('open-page-history')
    actions.user.setTransactions()
  }

  loadMore = () => {
    const { items } = this.props
    const { renderedItems } = this.state

    if (renderedItems < items.length) {
      this.setState(state => ({
        renderedItems: state.renderedItems + Math.min(10, items.length - state.renderedItems),
      }))
    }
  }

  rowRender = (row) => (
    <Row key={row.hash} {...row} />
  )

  render() {
    const { items, swapHistory } = this.props
    const titles = [ 'Coin', 'Status', 'Statement', 'Amount' ]

    console.log('swapHistory', swapHistory)

    return (
      <section>
        <PageHeadline subTitle="History" />
        { swapHistory.length > 0 && <SwapsHistory orders={swapHistory.filter(item => item.step >= 4)} /> }
        <h3>All transactions</h3>
        <Filter />
        <InfiniteScrollTable
          classTitle={styles.history}
          titles={titles}
          bottomOffset={400}
          getMore={this.loadMore}
          itemsCount={items.length}
          items={items.slice(0, this.state.renderedItems)}
          rowRender={this.rowRender}
        />
      </section>
    )
  }
}
