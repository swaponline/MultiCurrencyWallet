import React, { Fragment } from 'react'
import cx from 'classnames'
import moment from 'moment-with-locales-es6'
import { connect } from 'redaction'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import { FormattedMessage } from 'react-intl'
import actions from 'redux/actions'
import { constants } from 'helpers'
import CommentRow from './Comment'



class Row extends React.PureComponent {

  constructor(props) {
    super()
    const { hash, type, hiddenList, invoiceData } = props
    const dataInd = invoiceData && invoiceData.id
    const ind = `${dataInd || hash}-${type}`
    this.state = {
      ind,
      exCurrencyRate: 0,
      comment: actions.comments.returnDefaultComment(hiddenList, ind),
      cancelled: false,
      payed: false,
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
console.log(btcData, invoiceData)
    if (btcData) {
      const { currency } = btcData

      if (currency === 'BTC (SMS-Protected)') withdrawModalType = constants.modals.WithdrawMultisigSMS
      if (currency === 'BTC (Multisig)') withdrawModalType = constants.modals.WithdrawMultisigUser

      actions.modals.open(withdrawModalType, {
        currency,
        address: invoiceData.toAddress,
        balance: btcData.balance,
        unconfirmedBalance: btcData.unconfirmedBalance,
        toAddress: (invoiceData.destAddress) ? invoiceData.destAddress : invoiceData.fromAddress,
        amount: invoiceData.amount,
        invoice: invoiceData,
        onReady: () => {
          this.setState({
            payed: true,
          })
        },
      })
    }
  }

  handleCancelInvoice = async () => {
    const { invoiceData } = this.props

    actions.modals.open(constants.modals.Confirm, {
      onAccept: async () => {
        await actions.invoices.cancelInvoice(invoiceData.id)
        this.setState({
          cancelled: true,
        })
      },
    })
  }

  toggleComment = (val) => {
    this.setState(() => ({ isOpen: val }))
  }

  changeComment = (val) => {
    this.setState(() => ({ comment: val }))
  }

  commentCancel = () => {
    const { date, hiddenList, onSubmit } = this.props
    const { ind } = this.state

    const commentDate = moment(date).format('LLLL')
    onSubmit({ ...hiddenList, [ind]: commentDate })
    this.changeComment(commentDate)
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
      direction,
      value,
      confirmations,
      txType,
      invoiceData,
      onSubmit,
    } = this.props

    const { ind } = this.state

    const { exCurrencyRate, isOpen, comment, cancelled, payed } = this.state

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
                    <FormattedMessage id="RowHistoryInvoce" defaultMessage="Инвойс #{number}" values={{number: `${invoiceData.id}-${invoiceData.invoiceNumber}`}}/>
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
              </div>
              <CommentRow
                isOpen={isOpen}
                comment={comment}
                commentCancel={this.commentCancel}
                ind={ind}
                submit={onSubmit}
                changeComment={({ target }) => this.changeComment(target.value, ind)}
                toggleComment={this.toggleComment}
                {...this.props}
              />
              {invoiceData && invoiceData.label &&
                <div styleName='date'>{invoiceData.label}</div>
              }
              {txType === 'INVOICE' && direction === 'in' &&
                <div styleName='date'>
                  <FormattedMessage
                    id="RowHistoryInvoiceAddress"
                    defaultMessage='Адрес для оплаты: {address}'
                    values={{address: `${(invoiceData.destAddress) ? invoiceData.destAddress : invoiceData.fromAddress}`}} />
                </div>
              }
              {invoiceData && !invoiceData.txid && direction === 'in' && invoiceData.status === 'new' && !cancelled && !payed &&
                <Fragment>
                  <button onClick={this.handlePayInvoice}>
                    <FormattedMessage id='RowHistoryPayInvoice' defaultMessage='Оплатить' />
                  </button>
                  <button onClick={this.handleCancelInvoice}>
                    <FormattedMessage id='RowHistoryCancelInvoice' defaultMessage='Отклонить' />
                  </button>
                </Fragment>
              }
              {((invoiceData && invoiceData.status === 'cancelled') || cancelled) &&
                <div styleName='date'>
                  <FormattedMessage id="RowHistoryInvoiceCancelled" defaultMessage="Отклонен" />
                </div>
              }
              {((invoiceData && invoiceData.status === 'ready') || payed) &&
                <div styleName='date'>
                  <FormattedMessage id='RowHistoryInvoicePayed' defaultMessage='Оплачен' />
                </div>
              }
            </div>
            <div styleName={statusStyleAmount}>
              {invoiceData ? this.parseFloat(direction, value, 'out', type) : this.parseFloat(direction, value, 'in', type)}
              <span styleName='amountUsd'>{`~ $${getUsd.toFixed(2)}`}</span>
            </div>
            {/* <LinkTransaction type={type} styleName='address' hash={hash} >{hash}</LinkTransaction> */}
          </td>
        </tr>
      </>
    )
  }
}

/* eslint-enable */


export default cssModules(Row, styles, { allowMultiple: true })
