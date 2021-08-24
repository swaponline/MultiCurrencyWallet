import { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { constants, transactions, feedback, apiLooper } from 'helpers'
import actions from 'redux/actions'
import Panel from 'components/ui/Panel/Panel'
import Table from 'components/tables/Table/Table'
import tableStyles from 'components/tables/Table/Table.scss'
import PanelHeader from './PanelHeader'
import Row from './Row'

/* 

maker 0xDA873Ff72bd4eA9c122C51a837DA3f88307D1DB5
maker token WMATIC 0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270

taker 0x57d49704F453CdD2b995280d9D7F557E42847d82
taker token WBTC 0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6

*/

const tableTitles = [
  ' ',
  <FormattedMessage id="youPay" defaultMessage="You Pay" />,
  <FormattedMessage id="partial255" defaultMessage="You Get" />,
  <FormattedMessage id="rate" defaultMessage="Rate" />,
  ' ',
]

function LimitOrders(props) {
  const { orders, blockchains } = props
  const chainsArr: IUniversalObj[] = Object.values(blockchains)

  const [displayedChainId, setDisplayedChainId] = useState(chainsArr[0]?.networkVersion)
  const baseCurrency = blockchains[displayedChainId].currency

  const cancelOrder = async (params) => {
    const { orderIndex, order, makerWallet, makerAsset, takerAsset } = params

    actions.modals.open(constants.modals.Confirm, {
      onAccept: async () => {
        const receipt = await actions.oneinch.cancelLimitOrder({
          baseCurrency: baseCurrency.toLowerCase(),
          chainId: displayedChainId,
          orderIndex,
          orderData: order.data,
        })

        feedback.oneinch.cancelOrder(
          `${makerAsset.tokenKey.toUpperCase()} -> ${takerAsset.tokenKey.toUpperCase()}`
        )
        actions.notifications.show(constants.notifications.Transaction, {
          link: transactions.getLink(makerWallet.standard, receipt.transactionHash),
        })
      },
      message: (
        <FormattedMessage
          id="orders94s"
          defaultMessage="Are you sure you want to delete the order?"
        />
      ),
    })
  }

  const hasChainOrders = orders[displayedChainId]?.length

  const [makerOrders, setMakerOrders] = useState<any>([])

  //@ts-ignore
  useEffect(async () => {
    const orders = await apiLooper.get(
      'limitOrders',
      '/137/limit-order/address/0xDA873Ff72bd4eA9c122C51a837DA3f88307D1DB5?page=1&limit=100&statuses=%5B1%5D&sortBy=createDateTime'
    )

    setMakerOrders(orders)
  }, [])

  return (
    <Panel
      header={
        <PanelHeader orders={orders} chainId={displayedChainId} changeChain={setDisplayedChainId} />
      }
    >
      {hasChainOrders ? (
        <Table
          id="limitOrdersTable"
          className={tableStyles.exchange}
          styleName="orderBookTable"
          titles={tableTitles}
          rows={orders[displayedChainId]}
          rowRender={(order, index) => (
            <Row
              order={order}
              orderIndex={index}
              cancelOrder={cancelOrder}
              chainId={displayedChainId}
              baseCurrency={baseCurrency}
              isMy
            />
          )}
        />
      ) : (
        <p styleName="noOrdersMessage">
          <FormattedMessage id="noActiveOrders" defaultMessage="No active orders" />
        </p>
      )}

      <h3>All other orders</h3>

      {makerOrders ? (
        <Table
          id="limitOrdersTable"
          className={tableStyles.exchange}
          styleName="orderBookTable"
          titles={tableTitles}
          rows={makerOrders}
          rowRender={(order, index) => (
            <Row
              order={order}
              orderIndex={index}
              cancelOrder={cancelOrder}
              chainId={displayedChainId}
              baseCurrency={baseCurrency}
            />
          )}
        />
      ) : (
        <p styleName="noOrdersMessage">
          <FormattedMessage id="noActiveOrders" defaultMessage="No active orders" />
        </p>
      )}
    </Panel>
  )
}

export default connect(({ oneinch }) => ({
  orders: oneinch.orders,
  blockchains: oneinch.blockchains,
}))(CSSModules(LimitOrders, styles, { allowMultiple: true }))
