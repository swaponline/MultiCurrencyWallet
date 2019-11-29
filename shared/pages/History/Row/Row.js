import React, { Fragment } from 'react'
import cx from 'classnames'
import moment from 'moment-with-locales-es6'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'
import LinkTransaction from '../LinkTransaction/LinkTransaction'
import { FormattedMessage } from 'react-intl'


class Row extends React.PureComponent {

  state = {
    exCurrencyRate: 0,
  }

  componentDidMount() {
    this.getUsdBalance()
  }

  getUsdBalance = async () => {
    const { type } = this.props
    const exCurrencyRate = await actions.user.getExchangeRate(type, 'usd')

    this.setState(() => ({
      exCurrencyRate
    }))
  }


  render() {
    const {
      type,
      date,
      direction,
      hash,
      value,
      confirmations,
      txType,
      invoiceData,
    } = this.props

    const { exCurrencyRate } = this.state;

    const getUsd = value * exCurrencyRate;

    const statusStyleName = cx('status', {
      'in': direction === 'in',
      'out': direction !== 'in',
      'self': direction === 'self',
    })

    return (
      <tr styleName="historyRow">
        <td>
          <div styleName={statusStyleName}>
            <div styleName="arrowWrap">
              <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 15V3" stroke="#8E9AA3" strokeWidth="2" />
                <path d="M11 7L6 2L1 7" stroke="#8E9AA3" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div styleName={statusStyleName}>
            <div styleName="directionHeading">
              {
                txType === 'INVOICE' ?
                <Fragment>
                  <FormattedMessage id="RowHistoryInvoce" defaultMessage="Инвойс" />
                </Fragment>
                :
                <Fragment>
                  {
                    direction === 'in'
                      ? <FormattedMessage id="RowHistory281" defaultMessage="Received" />
                      : (
                        direction !== 'self'
                          ? <FormattedMessage id="RowHistory282" defaultMessage="Sent" />
                          : <FormattedMessage id="RowHistory283" defaultMessage="Self" />
                      )
                  }
                  <div styleName={confirmations > 0 ? 'confirm cell' : 'unconfirmed cell'}>
                    {confirmations > 0 ? confirmations > 6 ?
                      <FormattedMessage id="RowHistory34" defaultMessage="Received" /> :
                      <a href><FormattedMessage id="RowHistory341" defaultMessage="Confirm" /> {confirmations} </a> :
                      <FormattedMessage id="RowHistory342" defaultMessage="Unconfirmed" />
                    }
                  </div>
                </Fragment>
              }
            </div>
            <div styleName="date">{moment(date).format('LLLL')}</div>
            { txType === 'INVOICE' &&
              <div className="historyInvoiceInfo">
              { direction === 'in' &&
                <div>Адрес для оплаты: {invoiceData.fromAddress}</div>
              }
              { direction === 'out' &&
                <div>Инвойс выставлен на адрес: {invoiceData.toAddress}</div>
              }
              { invoiceData.label &&
                <div>Комментарий: {invoiceData.label}</div>
              }
              </div>
            }
          </div>
          <div styleName={statusStyleName}>
            {direction === 'in' ? <div styleName="amount">{`+ ${parseFloat(Number(value).toFixed(5))}`} {type.toUpperCase()}</div> : <div styleName="amount">{`- ${parseFloat(Number(value).toFixed(5))}`} {type.toUpperCase()}</div>}
            <span styleName="amountUsd">{`~ $${getUsd.toFixed(2)}`}</span>
          </div>
          {/* <LinkTransaction type={type} styleName="address" hash={hash} >{hash}</LinkTransaction> */}
        </td>
      </tr>
    )
  }
}

export default cssModules(Row, styles, { allowMultiple: true })
