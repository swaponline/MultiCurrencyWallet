import React, { Component } from 'react'
import CSSModules from 'react-css-modules'

import { connect } from 'redaction'
import actions from 'redux/actions'

import Row from './Row/Row'
import SwapsHistory from './SwapsHistory/SwapsHistory'
import ReactTooltip from 'react-tooltip'

import styles from 'components/tables/Table/Table.scss'
import stylesHere from './History.scss'
import Filter from './Filter/Filter'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import InfiniteScrollTable from 'components/tables/InfiniteScrollTable/InfiniteScrollTable'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import ContentLoader from '../../components/loaders/ContentLoader/ContentLoader'


const filterHistory = (items, filter) => {
  if (filter === 'sent') {
    return items.filter(({ direction }) => direction === 'out')
  }

  if (filter === 'received') {
    return items.filter(({ direction }) => direction === 'in')
  }

  return items
}

const subTitle = defineMessages({
  subTitleHistory: {
    id: 'Amount68',
    defaultMessage: 'Transactions',
  },
})

@injectIntl
@connect(({
    history: {
      transactions,
      filter,
      swapHistory,
    },
  }) => ({
    items: filterHistory(transactions, filter),
    swapHistory,
}))
@CSSModules(stylesHere, { allowMultiple: true })
export default class History extends Component {

  constructor(props) {
    super()

    const commentsList = actions.comments.getComment()
    this.state = {
      renderedItems: 10,
      commentsList: commentsList || null
    }
  }


  componentDidMount() {
    // actions.analytics.dataEvent('open-page-history')
    if(this.props.match &&
      this.props.match.params &&
      this.props.match.params.address
    ) {
      let { match: { params: { address = null } } } = this.props
      actions.history.setTransactions(address)
    } else {
      actions.user.setTransactions()
      actions.core.getSwapHistory()
    }  
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

  onSubmit = (obj) => {
   
    this.setState(() => ({ commentsList: obj }))
    actions.comments.setComment(obj)
  }

  rowRender = (row, rowIndex) => {
    const { commentsList } = this.state
    return (
      <Row key={rowIndex} hiddenList={commentsList} onSubmit={this.onSubmit} {...row} />
    )
  }

  render() {
    const { items, 
      swapHistory, 
      intl, 
      match: { params: { address = null } = null }= null } = this.props
    
    const titles = [];

    const pageTitle = address ? `Address: ${address}` :'Activity'


    return (
      items ? (
        <section styleName="history">
          <h3 styleName="historyHeading">{pageTitle}</h3>
          {
            items.length > 0 ? (
              <InfiniteScrollTable
                className={styles.history}
                titles={titles}
                bottomOffset={400}
                getMore={this.loadMore}
                itemsCount={items.length}
                items={items.slice(0, this.state.renderedItems)}
                rowRender={this.rowRender}
              /> 
            ) : (
              <div styleName="historyContent">
                <ContentLoader rideSideContent empty />
              </div>
            )
          }
        </section>
      ) : (
        <div styleName="historyContent">
          <ContentLoader rideSideContent />
        </div>
      )
    )
  }
}
