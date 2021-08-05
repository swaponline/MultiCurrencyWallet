import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { constants, transactions } from 'helpers'
import actions from 'redux/actions'
import { Button } from 'components/controls'
import Table from 'components/tables/Table/Table'
import tableStyles from 'components/tables/Table/Table.scss'
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

  //const makerWallet = actions.core.getWallet({currency: })

  const toggleOrdersViability = () => {
    setShowOrders(!showOrders)
  }

  const cancelOrder = async (orderData) => {
    const receipt = await actions.oneinch.cancelLimitOrder({
      baseCurrency: 'matic',
      orderData,
    })

    /* actions.notifications.show(constants.notifications.Transaction, {
      link: transactions.getLink(fromWallet.standard, receipt.transactionHash),
    }) */
  }

  const hasChainOrders = orders[displayedChainId]?.length

  return (
    <section styleName="">
      <Button id="orderbookBtn" onClick={toggleOrdersViability} link>
        <FormattedMessage id="limitOrders" defaultMessage="Limit orders" />
      </Button>

      {hasChainOrders ? (
        <>
          <Table
            id="limitOrdersTable"
            className={tableStyles.exchange}
            styleName="orderBookTable"
            titles={tableTitles}
            rows={orders[displayedChainId]}
            rowRender={(order) => (
              <Row
                order={order}
                cancelOrder={cancelOrder}
                chainId={displayedChainId}
                baseCurrency={blockchains[displayedChainId].baseCurrency}
              />
            )}
          />
        </>
      ) : (
        <FormattedMessage id="noActiveOrders" defaultMessage="No active orders" />
      )}
    </section>
  )
}

export default connect(({ oneinch }) => ({
  orders: oneinch.orders,
  blockchains: oneinch.blockchains,
}))(CSSModules(LimitOrders, styles, { allowMultiple: true }))
