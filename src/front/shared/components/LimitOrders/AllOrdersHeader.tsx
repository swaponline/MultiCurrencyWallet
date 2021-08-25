import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'

function AllOrdersHeader(props) {
  const { allOrders, chainId } = props

  return (
    <h3>
      <FormattedMessage id="allOrders" defaultMessage="All orders" />{' '}
      <span>{`(${allOrders[chainId] ? allOrders[chainId].length : 0})`}</span>
    </h3>
  )
}

export default CSSModules(AllOrdersHeader, styles, { allowMultiple: true })
