import React from 'react'
import cx from 'classnames'
import moment from 'moment-with-locales-es6'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'
import LinkTransaction from '../LinkTransaction/LinkTransaction'


class Row extends React.PureComponent {
  render() {
    const { type, date, direction, hash, value, confirmations } = this.props

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
          <div styleName="date">{moment(date).format('LLLL')}</div>
          <LinkTransaction type={type} styleName="address" hash={hash} >{hash}</LinkTransaction>
        </td>
        <td>
          <div styleName={confirmations > 0 ? 'confirm cell' : 'unconfirmed cell'}>
            {confirmations > 0 ? confirmations > 6 ? 'Confirm' : `Confirm ${confirmations}` : 'Unconfirmed' }
          </div>
        </td>
        <td>
          <div styleName="amount">{value} {type.toUpperCase()}</div>
        </td>
      </tr>
    )
  }
}

export default cssModules(Row, styles, { allowMultiple: true })
