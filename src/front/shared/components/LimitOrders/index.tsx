import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { constants, transactions, feedback } from 'helpers'
import actions from 'redux/actions'
import Panel from 'components/ui/Panel/Panel'
import Table from 'components/tables/Table/Table'
import tableStyles from 'components/tables/Table/Table.scss'
import PanelHeader from './PanelHeader'
import Row from './Row'

const tableTitles = [
  ' ',
  <FormattedMessage id="youPay" defaultMessage="You Pay" />,
  <FormattedMessage id="youGet" defaultMessage="You Get" />,
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

        feedback.oneinch.cancelOrder(`${makerAsset.name} -> ${takerAsset.name}`)
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
