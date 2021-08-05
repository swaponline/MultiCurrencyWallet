import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import exchangeStyles from '../index.scss'
import actions from 'redux/actions'
import { Button } from 'components/controls'

function LimitOrders() {
  const [showOrders, setShowOrders] = useState(false)

  const toggleOrdersViability = () => {
    setShowOrders(!showOrders)
  }

  return (
    <section styleName="">
      <Button id="orderbookBtn" onClick={toggleOrdersViability} styleName="button orderbook" link>
        <FormattedMessage id="limitOrders" defaultMessage="Limit orders" />
      </Button>

      {showOrders && (
        <div>
          <h3>
            <FormattedMessage id="yourOrders" defaultMessage="Your orders" />
          </h3>
        </div>
      )}
    </section>
  )
}

export default CSSModules(LimitOrders, { ...styles, ...exchangeStyles }, { allowMultiple: true })
