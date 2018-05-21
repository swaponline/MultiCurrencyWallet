import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './History.scss'


function Wallet({ direction, type, value, address, date }) {
  return (
    <tr >
      <td>
        <div className="table__coin">
          <div styleName={type === 'btc'
            ? 'table__coin-img table__coin-btc'
            : 'table__coin-img table__coin-eth'} />
          <div styleName="table__coin-abbr">{type === 'btc' ? 'Btc' : 'Eth' }</div>
          <div styleName="table__coin-name">{type === 'btc' ? 'Bitcoin' : 'Ethereum'}</div>
        </div>
      </td>
      <td>
        <div className="table__status">
          <div styleName={direction === 'in'
            ? 'table__status-stat table__status-stat_received'
            : 'table__status-stat table__status-stat_sent'} >Sent
          </div>
          <div styleName="table__status-date">{date}</div>
          <div styleName="table__status-address">Address: <span styleName="table__status-address-hash">{address}</span></div>
        </div>
      </td>
      <td>
        <span
          href="#"
          styleName={direction === 'in'
            ? 'table__amount table__amount_received'
            : 'table__amount table__amount_sent'}>{ value}
        </span>
      </td>
    </tr>
  )
}

Wallet.propTypes = {
  address: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  date: PropTypes.string.isRequired,
  direction: PropTypes.string.isRequired,
}

export default CSSModules(Wallet, styles, { allowMultiple: true })
