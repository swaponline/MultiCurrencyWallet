import React, { Component, Fragment } from 'react'
import CSSModules from 'react-css-modules'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { constants } from 'helpers'

import Row from './Row/Row'

import config from 'helpers/externalConfig'

import styles from 'components/tables/Table/Table.scss'
import stylesHere from './History.scss'

import InfiniteScrollTable from 'components/tables/InfiniteScrollTable/InfiniteScrollTable'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import links from 'helpers/links'
import ContentLoader from '../../components/loaders/ContentLoader/ContentLoader'
import { isMobile } from 'react-device-detect'
import FilterForm from 'components/FilterForm/FilterForm'

import InvoicesList from 'pages/Invoices/InvoicesList'
import SwapsHistory from 'pages/History/SwapsHistory/SwapsHistory'



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
const isDark = localStorage.getItem(constants.localStorage.isDark)

@injectIntl
@connect(({
  user: { activeFiat },
  history: {
    transactions,
    filter,
    swapHistory,
  },
}) => ({
  activeFiat,
  items: filterHistory(transactions, filter),
  swapHistory,
}))
@CSSModules(stylesHere, { allowMultiple: true })
export default class History extends Component {

  constructor(props) {
    super(props)

    const {
      items,
      match: {
        params: {
          page = null,
        }
      }
    } = props

    const commentsList = actions.comments.getComment()
    this.state = {
      page,
      items,
      filterValue: "",
      isLoading: false,
      renderedItems: 10,
      commentsList: commentsList || null
    }
  }


  componentDidMount() {
    console.log('History mounted')
    // actions.analytics.dataEvent('open-page-history')
    if (this.props.match
      && this.props.match.params
      && this.props.match.params.page === 'invoices'
    ) {
    } else {
      if (this.props.match &&
        this.props.match.params &&
        this.props.match.params.address
      ) {
        // @ToDo - этот роутер не работает - возможно артефакт после перевода ссылок на /(btc|eth)/walletAddress

        let { match: { params: { address = null } } } = this.props
        actions.history.setTransactions(address)
      } else {
        actions.user.setTransactions()
        actions.core.getSwapHistory()
      }
    }
  }

  componentWillUnmount() {
    console.log('History unmounted')
  }

  componentDidUpdate({ items: prevItems }) {
    const { items } = this.props

    if (items !== prevItems) {
      this.createItemsState(items)
    }
  }

  createItemsState = (items) => {
    this.setState(() => ({ items }))
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
    const { activeFiat } = this.props
    const { commentsList } = this.state

    return (
      <Row activeFiat={activeFiat}
           isDark={isDark} key={rowIndex} hiddenList={commentsList} onSubmit={this.onSubmit} {...row} />
    )
  }

  handleFilterChange = ({ target }) => {
    const { value } = target

    this.setState(() => ({ filterValue: value }))
  }

  handleFilter = () => {
    const { filterValue, items } = this.state

    if (filterValue && filterValue.length) {
      const newRows = items.filter(({ address }) => address && address.includes(filterValue.toLowerCase()))
      this.setState(() => ({ items: newRows }))

    } else {
      this.resetFilter()
    }
  }

  loading = () => {
    this.setState(() => ({ isLoading: true }))
    setTimeout(() => this.setState(() => ({ isLoading: false })), 1000)
  }

  resetFilter = () => {

    this.loading()
    const { items } = this.props
    this.setState(() => ({ filterValue: "" }))

    this.createItemsState(items)
  }

  render() {
    const { filterValue, items, isLoading } = this.state
    const { swapHistory } = this.props

    const titles = []
    const activeTab = 0

    return (
      <Fragment>
      <section styleName={`history ${isDark ? 'dark' : ''}`}>
        <h3 styleName="historyHeading">
          <FormattedMessage id="History_Activity_Title" defaultMessage="Activity" />
        </h3>
        {items ? (
          <div>
            <FilterForm filterValue={filterValue} onSubmit={this.handleFilter} onChange={this.handleFilterChange} resetFilter={this.resetFilter} />
            <div>
              {
                items.length > 0 && !isLoading ? (
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
                  <ContentLoader rideSideContent empty={!isLoading} nonHeader />
                )
              }
            </div>
          </div>
          ) : (
            <div styleName="historyLoader">
              <ContentLoader rideSideContent />
            </div>
          )
        }
      </section>

      <InvoicesList onlyTable />

      { swapHistory.length > 0 &&
        <SwapsHistory orders={swapHistory.filter((item) => item.step >= 1)} />
      }

      </Fragment>
    )
  }
}
