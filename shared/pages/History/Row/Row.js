import React from 'react'
import cx from 'classnames'
import moment from 'moment'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'


const Row = ({ type, date, direction, address, value }) => {
  const statusStyleName = cx('status', {
    'in': direction === 'in',
    'out': direction !== 'in',
  })

  return (
    <tr>
      <td>
        <Coin name={type} size={40} />
      </td>
      <td>
        <div styleName={statusStyleName}>{direction === 'in' ? 'Received' : 'Sent'}</div>
        <div styleName="date">{moment(date).format('MM/DD/YYYY hh:mm A')}</div>
        <div styleName="address">{address}</div>
      </td>
      <td>
        <div styleName="amount">{value}</div>
      </td>
    </tr>
  )
}

export default cssModules(Row, styles, { allowMultiple: true })
