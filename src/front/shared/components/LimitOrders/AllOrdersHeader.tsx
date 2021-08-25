import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'

function AllOrdersHeader(props) {
  const { allOrders, fetchMakerOrders } = props

  const [makerAddress, setMakerAddress] = useState('')

  const onChange = (event) => {
    // TODO: validate input value

    setMakerAddress(event.target.value)
  }

  const fetchOrders = () => fetchMakerOrders(makerAddress)

  return (
    <>
      <h3>
        <FormattedMessage id="allOrders" defaultMessage="All orders" />{' '}
        <span>{`(${allOrders.length || 0})`}</span>
      </h3>

      <div styleName="makerAddressWrapper">
        <input type="text" placeholder="Maker address" onChange={onChange} />
        <button onClick={fetchOrders}>Show</button>
      </div>
    </>
  )
}

export default CSSModules(AllOrdersHeader, styles, { allowMultiple: true })
