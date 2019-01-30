import React from 'react'
import cx from 'classnames'
import moment from 'moment-with-locales-es6'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'
import LinkTransaction from '../LinkTransaction/LinkTransaction'
import { FormattedMessage } from 'react-intl'


class Row extends React.PureComponent {
  render() {
    const { type, date, direction, hash, value, confirmations } = this.props

    const statusStyleName = cx('status', {
      'in': direction === 'in',
      'out': direction !== 'in',
      'self': direction === 'self',
    })

    return (
      <tr>
        <td>
          <Coin name={type} size={40} />
        </td>
        <td>
          <div styleName={statusStyleName}>
            {
              direction === 'in'
                ? <FormattedMessage id="RowHistory281" defaultMessage="Received" />
                : (
                  direction !== 'self'
                    ? <FormattedMessage id="RowHistory282" defaultMessage="Sent" />
                    : <FormattedMessage id="RowHistory283" defaultMessage="Self" />
                )
            }
          </div>
          <div styleName="date">{moment(date).format('LLLL')}</div>
          <LinkTransaction type={type} styleName="address" hash={hash} >{hash}</LinkTransaction>
        </td>
        <td>
          <div styleName={confirmations > 0 ? 'confirm cell' : 'unconfirmed cell'}>
            {confirmations > 0 ? confirmations > 6 ?
              <FormattedMessage id="RowHistory34" defaultMessage="Received" /> :
              <a><FormattedMessage id="RowHistory341" defaultMessage="Confirm" /> {confirmations} </a> :
              <FormattedMessage id="RowHistory342" defaultMessage="Unconfirmed" />
            }
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
