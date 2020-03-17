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
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { Link } from 'react-router-dom'


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
    this.getUsdBalance( type )
  }

  getUsdBalance = async (type) => {
    actions.user.getExchangeRate(type, 'usd').then((exCurrencyRate) => {
      this.setState(() => ({
        exCurrencyRate
      }))
    })
  }

  handlePayInvoice = async () => {
    const { invoiceData } = this.props

    let withdrawModalType = null
    let data = null
    const btcData = actions.btcmultisig.isBTCAddress(invoiceData.toAddress)

    if (btcData) {
      data = btcData
      withdrawModalType = constants.modals.Withdraw
      const { currency } = btcData

      if (currency === 'BTC (SMS-Protected)') withdrawModalType = constants.modals.WithdrawMultisigSMS
      if (currency === 'BTC (Multisig)') withdrawModalType = constants.modals.WithdrawMultisigUser
      if (currency === 'USDT (Multisig)') withdrawModalType = constants.modals.WithdrawMultisigUserToken
    }

    const ethData = actions.eth.isETHAddress(invoiceData.toAddress)
    if (ethData) {
      withdrawModalType = constants.modals.Withdraw
      data = ethData
    }

    if (withdrawModalType) {
      actions.modals.open(withdrawModalType, {
        currency: data.currency,
        address: invoiceData.toAddress,
        balance: data.balance,
        unconfirmedBalance: data.unconfirmedBalance,
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
    
    this.toggleComment(false)
  }

  parseFloat = (direction, value, directionType, type) => {
    const { txType } = this.props
    switch (type) {
      case 'btc (sms-protected)': type = 'BTC'
        break;
      case 'btc (multisig)': type = 'BTC'
        break;
      case 'usdt (multisig)': type = 'USDT'
        break;
    }

    return (
      <Fragment>
      {direction === directionType ?
        <div styleName="amount">{`+ ${parseFloat(Number(value).toFixed(5))}`} {type.toUpperCase()}
         {txType === 'INVOICE' ? <span styleName="smallTooltip"><Tooltip>Invoice</Tooltip></span> : ''}
        </div> :
        <div styleName="amount">{`- ${parseFloat(Number(value).toFixed(5))}`} {type.toUpperCase()}</div>
      }
    </Fragment> 
    )
  }

  render() {
    const {
      type,
      direction,
      value,
      hash,
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

    const hasInvoiceButtons = (invoiceData && !invoiceData.txid && direction === 'in' && invoiceData.status === 'new' && !cancelled && !payed)
    let invoiceStatusClass = 'confirm green'
    let invoiceStatusText = <FormattedMessage id="HistoryRowInvoiceStatusNew" defaultMessage="Пока не оплачен" />
    if (invoiceData && ((invoiceData.status === 'ready') || payed)) {
      invoiceStatusClass = 'confirm'
      invoiceStatusText = <FormattedMessage id="RowHistoryInvoicePayed" defaultMessage="Оплачен" />
    }
    if (invoiceData && ((invoiceData.status === 'cancelled') || cancelled)) {
      invoiceStatusClass = 'confirm red'
      invoiceStatusText = <FormattedMessage id="RowHistoryInvoiceCancelled" defaultMessage="Отклонен" />
    }
    /* eslint-disable */
    return (
      <>
        <tr styleName='historyRow'>
          <td>
        
          <div styleName={`${statusStyleAmount} circleIcon`}>
              <div styleName='arrowWrap'>
                <Link to={`/${type}/tx/${hash}`}>
                  <svg width='12' height='15' viewBox='0 0 12 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M6 15V3' stroke='#8E9AA3' strokeWidth='2' />
                    <path d='M11 7L6 2L1 7' stroke='#8E9AA3' strokeWidth='2' />
                  </svg>
                </Link>
              </div>
            </div>
            <div styleName="historyInfo">
              <div>
                {txType === 'INVOICE' ?
                  <>
                    <FormattedMessage 
                      id="RowHistoryInvoce" 
                      defaultMessage="Инвойс #{number} ({contact})" 
                      values={{
                        number: `${invoiceData.id}-${invoiceData.invoiceNumber}`, 
                        contact: (invoiceData.contact) ? `(${invoiceData.contact})` : ''
                      }}
                    />
                    <div styleName={`${invoiceStatusClass} cell`}>
                      {invoiceStatusText}
                    </div>
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
                label={invoiceData && invoiceData.label}
                commentCancel={this.commentCancel}
                ind={ind}
                submit={onSubmit}
                changeComment={({ target }) => this.changeComment(target.value, ind)}
                toggleComment={this.toggleComment}
                {...this.props}
              />
              {txType === 'INVOICE' && direction === 'in' &&
                <div styleName={(hasInvoiceButtons) ? 'info' : 'info noButtons'}>
                  {/* {
                    invoiceData && invoiceData.label && <div styleName='comment'>{invoiceData.label}</div>
                  } */}
                  <FormattedMessage
                    styleName="address"
                    id="RowHistoryInvoiceAddress"
                    defaultMessage='Адрес для оплаты: {address} ({number})'
                    values={{
                      address: `${(invoiceData.destAddress) ? invoiceData.destAddress : invoiceData.fromAddress}`,
                      number: invoiceData.totalCount,
                    }} 
                  />
                </div>
              }
            </div>
            {hasInvoiceButtons &&
                <div styleName="btnWrapper">
                  <button onClick={this.handlePayInvoice}>
                    <FormattedMessage id='RowHistoryPayInvoice' defaultMessage='Оплатить' />
                  </button>
                  <button onClick={this.handleCancelInvoice}>
                    <FormattedMessage id='RowHistoryCancelInvoice' defaultMessage='Отклонить' />
                  </button>
                </div>
            }
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
