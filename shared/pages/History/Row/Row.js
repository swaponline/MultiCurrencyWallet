import React, { Fragment } from 'react'
import cx from 'classnames'
import moment from 'moment-with-locales-es6'
import { connect } from 'redaction'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'
import LinkTransaction from '../LinkTransaction/LinkTransaction'
import { FormattedMessage } from 'react-intl'
import actions from 'redux/actions'
import { constants } from 'helpers'
import CommentRow from './Comment'
import ReactTooltip from 'react-tooltip'


class Row extends React.PureComponent {

  constructor(props) {
    super()
    const { hash } = props

    this.state = {
      exCurrencyRate: 0,
      comment: this.returnDefaultComment(hash),
    }
  }

  componentDidMount() {
    this.getUsdBalance()
  }

  getUsdBalance = async () => {
    const { type } = this.props
    const exCurrencyRate = await actions.user.getExchangeRate(type, 'usd')

    this.setState(() => ({ exCurrencyRate }))
  }

  handlePayInvoice = async () => {
    const { invoiceData } = this.props

    let withdrawModalType = constants.modals.Withdraw
    const btcData = actions.btcmultisig.isBTCAddress(invoiceData.toAddress)

    if (btcData) {
      const { currency } = btcData

      if (currency === 'BTC (SMS-Protected)') withdrawModalType = constants.modals.WithdrawMultisigSMS
      if (currency === 'BTC (Multisig)') withdrawModalType = constants.modals.WithdrawMultisigUser

      actions.modals.open(withdrawModalType, {
        currency,
        address: invoiceData.toAddress,
        balance: btcData.balance,
        unconfirmedBalance: btcData.unconfirmedBalance,
        toAddress: invoiceData.fromAddress,
        amount: invoiceData.amount,
      })
    }
  }

  toggleComment = (val) => {
    this.setState(() => ({ isOpen: val }))
  }

  changeComment = (e) => {
    const { value } = e.target

    this.setState(() => ({ comment: value }))
  }

  returnDefaultComment = (hash) => {
    const comment = localStorage.getItem('historyComments')
    console.log(JSON.parse(comment)[hash])
    return comment ? JSON.parse(comment)[hash] || '' : ''
  }

  commentCancel = () => {
    const { hash } = this.props

    this.setState(() => ({ comment: this.returnDefaultComment(hash) }))
    this.toggleComment(false)
  }

  parseFloat = (direction, value, directionType, type) => (
    <Fragment>
      {direction === directionType ?
        <div styleName="amount">{`+ ${parseFloat(Number(value).toFixed(5))}`} {type.toUpperCase()}</div> :
        <div styleName="amount">{`- ${parseFloat(Number(value).toFixed(5))}`} {type.toUpperCase()}</div>
      }
    </Fragment>
  )

  render() {
    const {
      type,
      date,
      direction,
      value,
      confirmations,
      txType,
      invoiceData,
      hash
    } = this.props

    const { exCurrencyRate, isOpen, comment } = this.state

    const getUsd = value * exCurrencyRate

    const statusStyleName = cx('status', {
      'in': direction === 'in',
      'out': direction !== 'in',
      'self': direction === 'self',
    })
    let statusStyleAmount = statusStyleName

    if (invoiceData) {
      statusStyleAmount = cx('status', {
        'in': direction !== 'in',
        'out': direction === 'in',
        'self': direction === 'self',
      })
    }
    /* eslint-disable */
    return (
      <>
        <tr styleName='historyRow'>
          <td>
            <div styleName={statusStyleName}>
              <div styleName='arrowWrap'>
                <svg width='12' height='15' viewBox='0 0 12 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M6 15V3' stroke='#8E9AA3' strokeWidth='2' />
                  <path d='M11 7L6 2L1 7' stroke='#8E9AA3' strokeWidth='2' />
                </svg>
              </div>
            </div>
            <div styleName={statusStyleName}>
              <div styleName='directionHeading'>
                {txType === 'INVOICE' ?
                  <>
                    <FormattedMessage id="RowHistoryInvoce" defaultMessage="Инвойс" />
                  </> :
                  <>
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
                  </>}
                {!comment ? <span role="presentation" onClick={() => this.toggleComment(!isOpen)}>
                  &#x270E;
                </span> :
                  <>
                    <span data-tip data-for={hash} onClick={() => this.toggleComment(!isOpen)}>
                      <img src="https://img.icons8.com/cotton/64/000000/secured-letter--v3.png" />
                    </span>
                    <ReactTooltip id={hash} type="light" effect="solid">
                      {comment}
                    </ReactTooltip>
                  </>
                }
              </div>
              <div styleName='date'>{moment(date).format('LLLL')}</div>
              {invoiceData && invoiceData.label &&
                <div styleName='date'>{invoiceData.label}</div>
              }
              {txType === 'INVOICE' && direction === 'in' &&
                <div styleName='date'>Адрес для оплаты: {invoiceData.fromAddress}</div>
              }
              {invoiceData && !invoiceData.txid && direction === 'in' && invoiceData.status === 'new' &&
                <button onClick={this.handlePayInvoice}>
                  <FormattedMessage id='RowHistoryPayInvoice' defaultMessage='Оплатить' />
                </button>
              }
            </div>
            <div styleName={statusStyleAmount}>
              {invoiceData ? this.parseFloat(direction, value, 'out', type) : this.parseFloat(direction, value, 'in', type)}
              <span styleName='amountUsd'>{`~ $${getUsd.toFixed(2)}`}</span>
            </div>
            {/* <LinkTransaction type={type} styleName='address' hash={hash} >{hash}</LinkTransaction> */}
          </td>
        </tr>
        {isOpen && <CommentRow
          comment={comment}
          commentCancel={this.commentCancel}
          changeComment={this.changeComment}
          toggleComment={this.toggleComment}
          {...this.props}
        />}
      </>
    )
  }
}

/* eslint-enable */


export default cssModules(Row, styles, { allowMultiple: true })
