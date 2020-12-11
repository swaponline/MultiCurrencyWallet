import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'

import constants from 'helpers/constants'
import { localisedUrl } from 'helpers/locale'

import cssModules from 'react-css-modules'
import styles from './OrderBook.scss'

import { Button } from 'components/controls'
import Panel from 'components/ui/Panel/Panel'
import Table from 'components/tables/Table/Table'
import tableStyles from 'components/tables/Table/Table.scss'
import Toggle from 'components/controls/Toggle/Toggle'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import PageSeo from 'components/Seo/PageSeo'
import { getSeoPage } from 'helpers/seo'

import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import Pair from './../Pair'
import Row from './Row/Row'
import MyOrders from './../MyOrders/MyOrders'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import config from 'app-config'
import feedback from 'shared/helpers/feedback'
import { links, getPairFees } from 'helpers'


type OrderBookProps = {
  sellCurrency: string
  buyCurrency: string

  isOnline: boolean
  invalidPair: boolean
  isAllPeersLoaded: boolean

  decline: any[]
  history: { [key: string]: any }
  intl: { [key: string]: any }
  location: { [key: string]: any }
  myOrders: { [key: string]: any }[]
  currencies: { [key: string]: any }[]

  pairFees: { [key: string]: any } | boolean
  balances: { [key: string]: number } | boolean
  
  linkedOrderId: number
  orderId: string

  checkSwapAllow: ({}) => boolean
}

type OrderBookState = {
  buyOrders: { [key: string]: any }[]
  sellOrders: { [key: string]: any }[]
  isShowAllMyOrders: boolean
}

const filterMyOrders = (orders, peer) => orders
  .filter(order => order.owner.peer === peer)

const filterOrders = (orders, filter) => orders
  .filter(order => order.isProcessing !== true)
  .filter(order => order.isHidden !== true)
  .filter(order => Pair.check(order, filter))
  .sort((a, b) => Pair.compareOrders(b, a))

@connect(({
  rememberedOrders,
  core: { orders, filter },
  pubsubRoom: { isOnline, isAllPeersLoaded, peer },
  currencies: { items: currencies },
}) => ({
  orders: filterOrders(orders, filter),
  myOrders: filterMyOrders(orders, peer),
  isOnline,
  isAllPeersLoaded,
  currencies,
  decline: rememberedOrders.savedOrders,
}))
//@ts-ignore
@withRouter
@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class OrderBook extends Component {

  props: OrderBookProps
  state: OrderBookState

  static getDerivedStateFromProps({ orders, sellCurrency, buyCurrency }) {
    if (orders.length === 0) {
      return null
    }

    const sellOrders = orders.filter(order =>
      order.buyCurrency.toLowerCase() === buyCurrency &&
      order.sellCurrency.toLowerCase() === sellCurrency
    ).sort((a, b) => Pair.compareOrders(b, a))

    const buyOrders = orders.filter(order =>
      order.buyCurrency.toLowerCase() === sellCurrency &&
      order.sellCurrency.toLowerCase() === buyCurrency
    ).sort((a, b) => Pair.compareOrders(a, b))
      
    return {
      buyOrders,
      sellOrders,
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      buyOrders: [],
      sellOrders: [],
      isShowAllMyOrders: true,
    }
  }

  handleShowAllMyOrders = (value) => {
    this.setState(() => ({ isShowAllMyOrders: value }))
  }

  removeOrder = (orderId) => {
    actions.modals.open(constants.modals.Confirm, {
      onAccept: () => {
        feedback.offers.deleted()
        actions.core.deletedPartialCurrency(orderId)
        actions.core.removeOrder(orderId)
        actions.core.updateCore()
      },
      message: (
        <FormattedMessage id="orders94s" defaultMessage="Are you sure you want to delete the order?" />
      ),
    })
  }

  acceptRequest = (orderId, peer) => {
    actions.core.acceptRequest(orderId, peer)
    actions.core.updateCore()
  }

  declineRequest = (orderId, peer) => {
    actions.core.declineRequest(orderId, peer)
    actions.core.updateCore()
  }

  render() {
    const {
      buyOrders,
      sellOrders,
      isShowAllMyOrders,
    } = this.state

    const { 
      intl,
      decline,
      linkedOrderId,
      pairFees,
      balances, 
      history, 
      isOnline, 
      isAllPeersLoaded, 
      myOrders, 
      orderId, 
      location, 
      currencies,
      checkSwapAllow,
      buyCurrency: propsBuyCurrency,
      sellCurrency: propsSellCurrency,
      invalidPair,
    } = this.props

    const buyCurrency = propsBuyCurrency.toUpperCase()
    const sellCurrency = propsSellCurrency.toUpperCase()

    const titles = [
      ' ',
      <FormattedMessage id="orders102" defaultMessage="SELLS" />,
      <FormattedMessage id="orders104" defaultMessage="FOR" />,
      <FormattedMessage id="orders105" defaultMessage="AT PRICE" />,
      ' ',
    ]

    const seoPage = getSeoPage(location.pathname)

    const isWidget = (config && config.isWidget)

    const buyCurrencyFullName = (currencies.find(c => c.name === buyCurrency) || {}).fullTitle
    const sellCurrencyFullName = (currencies.find(c => c.name === sellCurrency) || {}).fullTitle

    const title = defineMessages({
      metaTitle: {
        id: 'Orders121',
        defaultMessage: 'Atomic Swap {buyCurrencyFullName} ({buyCurrency}) to {sellCurrencyFullName} ({sellCurrency}) Instant Exchange',
      },
    })
    const description = defineMessages({
      metaDescription: {
        id: 'Orders127',
        defaultMessage: `Best exchange rate for {buyCurrencyFullName} ({buyCurrency}) to {sellCurrencyFullName} ({sellCurrency}).
         Swap.Online wallet provides instant exchange using Atomic Swap Protocol.`,
      },
    })

    const myOrdersThisMarket = myOrders.filter(order =>
      order.buyCurrency === buyCurrency && order.sellCurrency === sellCurrency
      ||
      order.buyCurrency === sellCurrency && order.sellCurrency === buyCurrency
    )

    const offersNoticeLoadingText = (
      <div styleName='offersLoadingNotice'>
        <FormattedMessage
          id="OrderBookOffersNoteOverLoader"
          defaultMessage="Requesting offers from peers online"
        />
        <div styleName='loader'>
          <InlineLoader />
        </div>
        <FormattedMessage
          id="OrderBookOffersNoteUnderLoader"
          defaultMessage="it may take a minute"
        />
      </div>
    )

    const offersNoticeOfflineText = (
      <p styleName="offersOfflineNotice">
        <FormattedMessage
          id="OrderBookOffersOfflineNote"
          defaultMessage="If no offers are found, this means that there are no users who posted the offer, not online."
        />
      </p>
    )

    return (
      <Fragment>
        <PageSeo
          location={location}
          defaultTitle={intl.formatMessage(title.metaTitle, { buyCurrency, sellCurrency, buyCurrencyFullName, sellCurrencyFullName })}
          defaultDescription={intl.formatMessage(description.metaDescription, { buyCurrency, sellCurrency, buyCurrencyFullName, sellCurrencyFullName })}
        />

        {!!myOrders.length &&
          <Panel
            header={
              <Fragment>
                <h3>
                  <FormattedMessage id="MyOrders23" defaultMessage="Your offers" />
                  {' '}
                  <span>{ isShowAllMyOrders ? `(${myOrders.length})` : `(${myOrdersThisMarket.length}/${myOrders.length})` }</span>
                </h3>
                <div styleName="subtitle showAllSwitch">
                  <FormattedMessage
                    id="orders1381"
                    defaultMessage="{buyCurrency} 🔁 {sellCurrency}"
                    values={{ buyCurrency, sellCurrency }}
                  />
                  {/*
                  //@ts-ignore */}
                  <Toggle checked={isShowAllMyOrders} onChange={this.handleShowAllMyOrders} />
                  <FormattedMessage id="orders1382" defaultMessage="All" />
                </div>
              </Fragment>
            }
          >
            <MyOrders
              myOrders={isShowAllMyOrders ? myOrders : myOrdersThisMarket}
              declineRequest={this.declineRequest}
              removeOrder={this.removeOrder}
              acceptRequest={this.acceptRequest}
            />
          </Panel>
        }
        <Panel header={
          <Fragment>
            <h3 styleName="ordersHeading">
              <FormattedMessage
                id="orders159"
                defaultMessage="{currency} offers"
                values={{ currency: `${buyCurrency}` }} />
            </h3>
            <div styleName="subtitle">
              <FormattedMessage
                id="orders156"
                defaultMessage="Buy {currency} here"
                values={{ currency: `${buyCurrency}` }}
              />
            </div>
          </Fragment>
        }>
          {isOnline
            ? (
              buyOrders.length > 0
                ? (
                  <Table
                    id="table_exchange"
                    className={tableStyles.exchange}
                    styleName="orderBookTable"
                    titles={titles}
                    rows={buyOrders}
                    rowRender={(row) => (
                      <Row
                        key={row.id}
                        orderId={orderId}
                        row={row}
                        decline={decline}
                        history={history}
                        removeOrder={this.removeOrder}
                        linkedOrderId={linkedOrderId}
                        pairFees={pairFees}
                        balances={balances}
                        checkSwapAllow={checkSwapAllow}
                      />
                    )}
                  />
                )
                : offersNoticeLoadingText
            )
            : offersNoticeOfflineText
          }
        </Panel>

        <Panel header={
          <Fragment>
            <h3 styleName="ordersHeading">
              <FormattedMessage
                id="orders159"
                defaultMessage="{currency} offers"
                values={{ currency: `${sellCurrency}` }} />
            </h3>
            <div styleName="subtitle">
              <FormattedMessage
                id="orders156"
                defaultMessage="Buy {currency} here"
                values={{ currency: `${sellCurrency}` }}
              />
            </div>
          </Fragment>
        }
        >
          {isOnline
            ? (
              sellOrders.length > 0
                ? (
                  <Table
                    id="table_exchange"
                    className={tableStyles.exchange}
                    styleName="orderBookTable"
                    titles={titles}
                    rows={sellOrders}
                    rowRender={(row) => (
                      <Row
                        key={row.id}
                        orderId={orderId}
                        row={row}
                        decline={decline}
                        history={history}
                        removeOrder={this.removeOrder}
                        linkedOrderId={linkedOrderId}
                        pairFees={pairFees}
                        balances={balances}
                        checkSwapAllow={checkSwapAllow}
                      />
                    )}
                  />
                )
                : offersNoticeLoadingText
            )
            : offersNoticeOfflineText
          }
        </Panel>
        {seoPage && seoPage.footer && <div>{seoPage.footer}</div>}
      </Fragment>
    )
  }
}
