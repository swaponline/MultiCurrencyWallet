import React from 'react'
import Table from 'components/tables/Table/Table'
import { withInfiniteScroll } from 'decorators/withInfiniteScroll'

@withInfiniteScroll()
export default class InfiniteScrollTable extends React.Component<any, any> {
  render() {
    const { items, ...rest } = this.props
    const { rowRender } = rest

    return (
      <Table {...rest} rowRender={rowRender} rows={items} />
    )
  }
}
