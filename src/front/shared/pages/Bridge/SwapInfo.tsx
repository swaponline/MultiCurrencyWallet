import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'

function SwapInfo() {
  return (
    <section className="swapInfo">
      <b>Price: 0</b>
      <b>fee: 0</b>
    </section>
  )
}

export default CSSModules(SwapInfo, styles, { allowMultiple: true })
