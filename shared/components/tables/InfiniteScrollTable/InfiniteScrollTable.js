import React from 'react'
import Table from 'components/tables/Table/Table'
import { withInfiniteScroll } from 'decorators/withInfiniteScroll'

@withInfiniteScroll()
export default class InfiniteScrollTable extends React.Component {
  render() {
    const { items, ...rest } = this.props

    return (
      <Table {...rest} rows={items} />
    )
  }
}
