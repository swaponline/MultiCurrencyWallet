import React, { Component } from 'react'
import { Modal } from 'components/modal'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import helpers from "helpers";

import cssModules from 'react-css-modules'
import styles from './InfoPay.scss'
import ShareButton from 'components/controls/ShareButton/ShareButton'
import finishSvg from './images/finish.svg'
import actions from 'redux/actions'
import Button from 'components/controls/Button/Button'
import ShortTextView from 'pages/Wallet/components/ShortTextView/ShortTextView.js'
import { isMobile } from "react-device-detect";
import { BigNumber } from 'bignumber.js'

const labels = defineMessages({
  Title: {
    id: 'InfoPay_1',
    defaultMessage: 'Transaction is completed',
  },
  Text: {
    id: 'InfoPay_2',
    defaultMessage: 'successfully transferred to'
  }
})
@injectIntl
@cssModules(styles, { allowMultiple: true })

export default class InfoPay extends React.Component {

  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (typeof data.onClose === 'function') {
      data.onClose()
    }

    actions.modals.close(name)
  }


  render() {
    const {
      intl,
      data: {
        amount,
        currency,
        toAddress,
        txRaw,
        txId,
        balance,
        oldBalance,
      },
      name,
    } = this.props

    let link = '#';
    let tx = '';
  
    if(txRaw) {
      const txInfo = helpers.transactions.getInfo(currency.toLowerCase(), txRaw)
      tx = txInfo.tx
      link = txInfo.link
    }
    if (txId) {
      tx = txId
      link = helpers.transactions.getLink(currency.toLowerCase(), txId)
    }

    // @ToDo need to find out oldbalance
    const rowBalances = <div styleName="balanceRow" className="pt-3">
      <span styleName="textThrough"> {oldBalance} {currency} (~$993.62) </span> → {balance} {currency} (~$992,63)
                        </div>

    return (
      <Modal name={name} title={intl.formatMessage(labels.Title)} showCloseButton={false}>
        <div styleName="blockCenter">
          <div>
            <img styleName="finishImg" src={finishSvg} alt="finish" />
          </div>

          <div className="p-3">
            <span ><strong> {amount}  {currency} </strong></span>
            <span> <FormattedMessage id="InfoPay_2" defaultMessage="были успешно переданы" />
              <br />
              <strong>{toAddress}</strong>
            </span>
          </div>

          <table styleName="blockCenter__table" className="table table-borderless">
            <tbody>
              <tr>
                <td styleName="header">
                  <FormattedMessage id="InfoPay_3" defaultMessage="Transaction ID" />
                </td>
                <td>
                  <a href={link} target="_blank"><ShortTextView text={tx} /></a>
                </td>
              </tr>
              <tr>
                <td styleName="header">
                  <FormattedMessage id="InfoPay_4" defaultMessage="Est. time to confitmation" />
                </td>
                <td>~10 mins</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div styleName="blockCenter">
          <Button blue onClick={this.handleClose} type="button" title="Back to app">
            <FormattedMessage id="InfoPay_5" defaultMessage="Back to app" />
          </Button>
          {isMobile && <ShareButton link={link} title={amount.toString() + ' ' + currency.toString() + ' ' + intl.formatMessage(labels.Text) + ' ' + toAddress} />
          }
        </div>
      </Modal>
    )
  }
}