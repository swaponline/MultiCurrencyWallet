import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import typeforce from 'swap.app/util/typeforce'

function AllOrdersHeader(props) {
  const { allOrders, fetchMakerOrders, baseCurrency } = props

  const [makerAddress, setMakerAddress] = useState('')

  const onChange = (event) => {
    if (typeforce.isCoinAddress[baseCurrency](event.target.value)) {
      setMakerAddress(event.target.value)
    }
  }

  const fetchOrders = () => {
    if (makerAddress) {
      fetchMakerOrders(makerAddress)
    }
  }

  return (
    <div styleName="header allOrders">
      <h3>
        <FormattedMessage id="allOrders" defaultMessage="All orders" />{' '}
        <span>{`(${allOrders.length || 0})`}</span>
      </h3>

      <div styleName="makerAddressWrapper">
        <input type="text" placeholder="Maker address" onChange={onChange} />
        <button onClick={fetchOrders}>Show</button>
      </div>
    </div>
  )
}

export default CSSModules(AllOrdersHeader, styles, { allowMultiple: true })
