import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'

import constants from 'helpers/constants'
import { localisedUrl } from 'helpers/locale'

import cssModules from 'react-css-modules'
import styles from './Orders.scss'

import { Button } from 'components/controls'
import Table from 'components/tables/Table/Table'
import Title from 'components/PageHeadline/Title/Title'
import tableStyles from 'components/tables/Table/Table.scss'
import PageSeo from 'components/Seo/PageSeo'
import { getSeoPage } from 'helpers/seo'

import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import Pair from './Pair'
import Row from './Row/Row'
import MyOrders from './MyOrders/MyOrders'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import config from 'app-config'
import { links } from 'helpers'


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
  ipfs: { isOnline, isAllPeersLoaded, peer },
  currencies: { items: currencies },
}) => ({
  orders: filterOrders(orders, filter),
  myOrders: filterMyOrders(orders, peer),
  isOnline,
  isAllPeersLoaded,
  currencies,
  decline: rememberedOrders.savedOrders,
}))
@withRouter
@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class Orders extends Component {

  state = {
    buyOrders: [],
    sellOrders: [],
  }

  static getDerivedStateFromProps({ orders }) {
    if (!Array.isArray(orders)) { return }

    const sellOrders = orders
      .filter(order => Pair.fromOrder(order).isAsk())

    const buyOrders = orders
      .filter(order => Pair.fromOrder(order).isBid())

    return {
      buyOrders,
      sellOrders,
    }
  }

  removeOrder = (orderId) => {
    actions.modals.open(constants.modals.Confirm, {
      onAccept: () => {
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

  handleWalletPush = () => {
    this.props.history.push(links.currencyWallet)
  }

  render() {
    const { sellOrders, buyOrders } = this.state
    let { sellCurrency, buyCurrency, intl, decline } = this.props
    const { history } = this.props

    buyCurrency = buyCurrency.toUpperCase()
    sellCurrency = sellCurrency.toUpperCase()

    const titles = [
      <FormattedMessage id="orders101" defaultMessage="OWNER" />,
      <FormattedMessage id="orders102" defaultMessage="AMOUNT" />,
      <span>
        <FormattedMessage id="orders104" defaultMessage="PRICE FOR 1 {buyCurrency}" values={{ buyCurrency: `${buyCurrency}` }} />
      </span>,
      <FormattedMessage id="orders105" defaultMessage="TOTAL" />,
      <FormattedMessage id="orders106" defaultMessage="START EXCHANGE" />,
    ]


    const { isOnline, isAllPeersLoaded, myOrders, orderId, invalidPair, location, currencies } = this.props
    const isIpfsLoaded = isOnline && isAllPeersLoaded
    const seoPage = getSeoPage(location.pathname)

    const isWidget = (config && config.isWidget)

    const buttonsRowStyleName = isMobile ?
      (isWidget && !config.isFullBuild) ? 'buttonRow buttonRowMobile buttonRowWidget' : 'buttonRow buttonRowMobile'
      :
      (isWidget && !config.isFullBuild) ? 'buttonRow buttonRowWidget' : 'buttonRow'

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

    return (
      <Fragment>
        <PageSeo
          location={location}
          defaultTitle={intl.formatMessage(title.metaTitle, { buyCurrency, sellCurrency, buyCurrencyFullName, sellCurrencyFullName })}
          defaultDescription={intl.formatMessage(description.metaDescription, { buyCurrency, sellCurrency, buyCurrencyFullName, sellCurrencyFullName })} />
        <div styleName="headerContainer">
          <FormattedMessage
            id="orders1381"
            defaultMessage="Market {buyCurrency} 🔁 {sellCurrency}"
            values={{ buyCurrency, sellCurrency }}
          />
          <CloseIcon styleName="closeButton" onClick={() => this.props.history.push(localisedUrl(intl.locale, links.home))} data-testid="CloseIcon" />
        </div>
        {invalidPair &&
          <p>
            <FormattedMessage id="Orders141" defaultMessage="No such ticker. Redirecting to USDT-BTC exchange..." />
          </p>
        }
        <div styleName={buttonsRowStyleName}>
          {
            (isWidget && !config.isFullBuild) && (
              <Button green styleName="button" onClick={this.handleWalletPush} >
                <FormattedMessage id="OrdersWidgetModeShowWallet" defaultMessage="Wallet" />
              </Button>
            )
          }
        </div>
        <MyOrders
          myOrders={myOrders}
          declineRequest={this.declineRequest}
          removeOrder={this.removeOrder}
          acceptRequest={this.acceptRequest}
        />
        <h3 styleName="ordersHeading">
          <FormattedMessage id="orders156" defaultMessage="BUY {buyCurrency} HERE" values={{ buyCurrency: `${buyCurrency}` }} />
        </h3>
        <p styleName="subtitle">
          <FormattedMessage
            id="orders159"
            defaultMessage={`orders of those who {sell} {buyCurrency} to you`}
            values={{
              sell: <i><FormattedMessage id="orders150" defaultMessage="sell" /></i>,
              buyCurrency: `${buyCurrency}`,
            }} />
        </p>
        <Table
          id="table_exchange"
          className={tableStyles.exchange}
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
            />
          )}
          isLoading={sellOrders.length === 0 && !isIpfsLoaded}
        />
        <h3 styleName="ordersHeading">
          <FormattedMessage id="orders224" defaultMessage={`SELL {buyCurrency} HERE`} values={{ buyCurrency: `${buyCurrency}` }} />
        </h3>
        <p styleName="subtitle">
          <FormattedMessage
            id="orders186"
            defaultMessage={`orders of those who {buy} {buyCurrency} from you`}
            values={{
              buy: <i><FormattedMessage id="orders189" defaultMessage="buy" /></i>,
              buyCurrency: `${buyCurrency}`,
            }} />
        </p>
        <Table
          id="table_exchange"
          className={tableStyles.exchange}
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
            />
          )}
          isLoading={buyOrders.length === 0 && !isIpfsLoaded}
        />
        {seoPage && seoPage.footer && <div>{seoPage.footer}</div>}
      </Fragment>
    )
  }
}
