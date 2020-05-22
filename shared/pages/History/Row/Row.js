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
import getCurrencyKey from 'helpers/getCurrencyKey'
import ethToken from 'helpers/ethToken'
import { links } from 'helpers'
import { getFullOrigin } from 'helpers/links'

class Row extends React.PureComponent {

  constructor(props) {
    super()
    const { hash, type, hiddenList, invoiceData, viewType } = props
    const dataInd = invoiceData && invoiceData.id
    const ind = `${dataInd || hash}-${type}`


    this.state = {
      ind,
      viewType: (viewType || 'transaction'),
      exCurrencyRate: 0,
      comment: actions.comments.returnDefaultComment(hiddenList, ind),
      cancelled: false,
      payed: false,
    }
  }

  componentDidMount() {
    const { type } = this.props

    this.getFiatBalance(type)
  }

  getFiatBalance = async (type) => {
    const { activeFiat } = this.props

    if (activeFiat) {
      actions.user.getExchangeRate(type, activeFiat.toLowerCase()).then((exCurrencyRate) => {
        this.setState(() => ({
          exCurrencyRate,
        }))
      })
    }
  }

  handlePayInvoice = async () => {
    const { invoiceData } = this.props

    let withdrawModalType = null
    let data = null
    const btcData = actions.btc.getDataByAddress(invoiceData.toAddress)

    if (btcData) {
      data = btcData
      withdrawModalType = constants.modals.Withdraw
      const { currency } = btcData

      if (currency === 'BTC (SMS-Protected)') withdrawModalType = constants.modals.WithdrawMultisigSMS
      if (currency === 'BTC (Multisig)') withdrawModalType = constants.modals.WithdrawMultisigUser
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
        hiddenCoinsList: [],
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

  handleSendConfirmLink = () => {
    const {
      history,
      confirmTx: {
        uniqhash,
      },
    } = this.props

    const link = `${getFullOrigin()}${links.multisign}/btc/confirm/${uniqhash}`

    //history.push(shareLink)
    actions.modals.open(constants.modals.Share, {
      link,
      title: `Confirm multisignature transaction`,
    })
  }

  handleConfirmTx = () => {
    const {
      history,
      confirmTx: {
        uniqhash,
      },
    } = this.props

    const shareLink = `${links.multisign}/btc/confirm/${uniqhash}`

    history.push(shareLink)
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
      activeFiat,
      address,
      type,
      direction,
      value,
      hash: propsHash,
      confirmations,
      txType,
      invoiceData,
      confirmTx,
      onSubmit,
    } = this.props

    const substrAddress = address ? `${address.slice(0, 2)}...${address.slice(-2)}` : ''

    const hash = (invoiceData && invoiceData.txInfo) ? invoiceData.txInfo : propsHash

    const { ind } = this.state

    const { exCurrencyRate, isOpen, comment, cancelled, payed } = this.state

    const getFiat = value * exCurrencyRate

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

    let txLink = `/${getCurrencyKey(type)}/tx/${hash}`
    if (ethToken.isEthToken({ name: type })) {
      txLink = `/token/${type}/tx/${hash}`
    }

    if (txType === 'INVOICE' && invoiceData.uniqhash) {
      txLink = `${links.invoice}/${invoiceData.uniqhash}`
    }

    if (txType === 'CONFIRM' && confirmTx.uniqhash) {
      txLink = `${links.multisign}/btc/confirm/${confirmTx.uniqhash}`
    }

    return (
      <>
        <tr styleName='historyRow'>
          <td>
            <div styleName={`${statusStyleAmount} circleIcon`}>
              <div styleName='arrowWrap'>
                <Link to={txLink}>
                  <svg width='12' height='15' viewBox='0 0 12 15' fill='none'>
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
                    <Link to={txLink}>
                      <FormattedMessage
                        id="RowHistoryInvoce"
                        defaultMessage="Инвойс #{number} ({contact})"
                        values={{
                          number: `${invoiceData.id}-${invoiceData.invoiceNumber}`,
                          contact: (invoiceData.contact) ? `(${invoiceData.contact})` : ''
                        }}
                      />
                    </Link>
                    <div styleName={`${invoiceStatusClass} cell`}>
                      {invoiceStatusText}
                    </div>
                  </> :
                  <>
                    <Link to={txLink}>
                      {(txType === 'CONFIRM') ? (
                        <FormattedMessage id="RowHistory_Confirm_Sending" defaultMessage="Отправление" />
                      ) : (
                          <>
                            {
                              direction === 'in'
                                ? <FormattedMessage id="RowHistory281" defaultMessage="Received {address}" values={{
                                  address: substrAddress ? <span><FormattedMessage id="fromRow" defaultMessage="from" /> {substrAddress}</span> : ""
                                }} />
                                : (
                                  direction !== 'self'
                                    ? <FormattedMessage id="RowHistory282" defaultMessage="Sent {address}" values={{
                                      address: substrAddress ? <span><FormattedMessage id="toRow" defaultMessage="to" /> {substrAddress}</span> : ""
                                    }} />
                                    : <FormattedMessage id="RowHistory283" defaultMessage="Self" />
                                )
                            }
                          </>
                        )}
                    </Link>
                    {(txType === 'CONFIRM') ? (
                      <>
                        {confirmTx.status === 'pending' && (
                          <div styleName="unconfirmed cell">
                            <FormattedMessage id="RowHistory_Confirm_InProgress" defaultMessage="В процессе" />
                          </div>
                        )}
                        {confirmTx.status === 'reject' && (
                          <div styleName="confirm red">
                            <FormattedMessage id="RowHistory_Confirm_Rejected" defaultMessage="Отклонён" />
                          </div>
                        )}
                        {confirmTx.status === 'cancel' && (
                          <div styleName="confirm red">
                            <FormattedMessage id="RowHistory_Confirm_Cancelled" defaultMessage="Отменено" />
                          </div>
                        )}
                      </>
                    ) : (
                        <div styleName={confirmations > 0 ? 'confirm cell' : 'unconfirmed cell'}>
                          {confirmations > 0 ? confirmations > 6 ?
                            <FormattedMessage id="RowHistory34" defaultMessage="Received" /> :
                            <a href><FormattedMessage id="RowHistory341" defaultMessage="Confirmed" /></a> :
                            <FormattedMessage id="RowHistory342" defaultMessage="Unconfirmed" />
                          }
                        </div>
                      )}
                  </>
                }
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
            {txType === 'CONFIRM' && confirmTx.status === 'pending' && (
              <div styleName="confirmWrapper">
                {(confirmTx.isHolder) ? (
                  <>
                    <span>
                      <FormattedMessage
                        id="RowHistory_ConfirmTX_NeedConfirm"
                        defaultMessage="Требуется подтверждение другого участника" />
                    </span>
                    <button onClick={this.handleSendConfirmLink}>
                      <FormattedMessage
                        id="RowHistory_ConfirmTX_SendLink"
                        defaultMessage="Отправить ссылку"
                      />
                    </button>
                  </>
                ) : (
                    <>
                      <span>
                        <FormattedMessage
                          id="RowHistory_ConfirmTX_NeedYourSign"
                          defaultMessage="Требуется ваша подпись"
                        />
                      </span>
                      <button onClick={this.handleConfirmTx}>
                        <FormattedMessage
                          id="RowHistory_ConfirmTX_Sign"
                          defaultMessage="Подтвердить"
                        />
                      </button>
                    </>
                  )}
              </div>
            )}
            <div styleName={statusStyleAmount}>
              {invoiceData ? this.parseFloat(direction, value, 'out', type) : this.parseFloat(direction, value, 'in', type)}
              <span styleName='amountUsd'>{`~${getFiat.toFixed(2)}`}{activeFiat}</span>

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
