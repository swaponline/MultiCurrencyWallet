import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { constants, transactions } from 'helpers'
import actions from 'redux/actions'
import { Button } from 'components/controls'
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
  const [showOrders, setShowOrders] = useState(false)
  const [displayedChainId, setDisplayedChainId] = useState(137)
  const baseCurrency = blockchains[displayedChainId].currency

  const toggleOrdersViability = () => {
    setShowOrders(!showOrders)
  }

  const cancelOrder = async (orderIndex, orderData, wallet) => {
    const receipt = await actions.oneinch.cancelLimitOrder({
      baseCurrency: baseCurrency.toLowerCase(),
      chainId: displayedChainId,
      orderIndex,
      orderData,
    })

    actions.notifications.show(constants.notifications.Transaction, {
      link: transactions.getLink(wallet.standard, receipt.transactionHash),
    })
  }

  const hasChainOrders = orders[displayedChainId]?.length

  return (
    <section>
      <Button id="orderbookBtn" onClick={toggleOrdersViability} link>
        <FormattedMessage id="limitOrders" defaultMessage="Limit orders" />
      </Button>

      <Panel
        header={
          <PanelHeader
            orders={orders}
            chainId={displayedChainId}
            changeChain={setDisplayedChainId}
          />
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
    </section>
  )
}

export default connect(({ oneinch }) => ({
  orders: oneinch.orders,
  blockchains: oneinch.blockchains,
}))(CSSModules(LimitOrders, styles, { allowMultiple: true }))
