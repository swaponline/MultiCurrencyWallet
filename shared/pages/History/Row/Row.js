import React from 'react'
import cx from 'classnames'
import moment from 'moment'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'
import LinkTransaction from '../LinkTransaction/LinkTransaction'



const dateToLocal = (d) => {
  let opts = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }
  return d.toLocaleString(navigator.language,opts)
}



const Row = ({ type, date, direction, hash, value, confirmations }) => {
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
        <div styleName={statusStyleName}>{direction === 'in' ? 'Received ' : 'Sent '}</div>
        <div styleName="date">{dateToLocal(new Date(date))}</div>
        <LinkTransaction type={type} styleName="address" hash={hash} >{hash}</LinkTransaction>
      </td>
      <td>
        <div styleName={confirmations === 'Confirmed' ? 'confirm cell' : 'unconfirmed cell'}>{confirmations}</div>
      </td>
      <td>
        <div styleName="amount">{value} {type.toUpperCase()}</div>
      </td>
    </tr>
  )
}

export default cssModules(Row, styles, { allowMultiple: true })
