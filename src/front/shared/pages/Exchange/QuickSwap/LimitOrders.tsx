import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import exchangeStyles from '../index.scss'
import { Button } from 'components/controls'

function LimitOrders() {
  const [showOrders, setShowOrders] = useState(false)

  const toggleOrdersViability = () => {
    setShowOrders(!showOrders)
  }

  return (
    <section styleName="">
      <Button id="orderbookBtn" onClick={toggleOrdersViability} styleName="button orderbook" link>
        <FormattedMessage id="Orderbook" defaultMessage="Orderbook" />
      </Button>

      {showOrders && (
        <div>
          <h2>Limit orders here</h2>
          <button>All all</button>
          <button>Your order</button>
        </div>
      )}
    </section>
  )
}

export default CSSModules(LimitOrders, { ...styles, ...exchangeStyles }, { allowMultiple: true })
