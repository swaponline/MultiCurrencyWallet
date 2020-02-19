import React, { Component } from 'react'
import { Modal } from 'components/modal'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import cssModules from 'react-css-modules'
import styles from './InfoPay.scss'
import ShareButton from 'components/controls/ShareButton/ShareButton'
import finishSvg from './images/finish.svg'
import actions from 'redux/actions'
import Button from 'components/controls/Button/Button'
import ShortTextView from 'pages/Wallet/components/ShortTextView/ShortTextView.js'
import { isMobile } from "react-device-detect";

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

    const { intl, data: { amount, currency, address, txRaw } } = this.props
    const name = 'InfoPay'

    let link = '3E1WAXCrnAhHykTh9J7eBRLgA9bWCABHcC';
    switch (currency) {
      case 'BTC':
        link = `https://www.blockchain.com/ru/btc/tx/${txRaw.getId()}`

        break;

      case 'ETH':
        link = `https://etherscan.io/tx/${txRaw.transactionHash}`
        break;
    }

    return (
      <Modal name={name} title={intl.formatMessage(labels.Title)} >
        <div styleName="blockCenter">
          <div>
            <img styleName="finishImg" src={finishSvg} alt="finish" />
          </div>

          <div styleName="balanceRow" className="pt-3">
            0.1 BTC (~$993.62)  →  0.0999 BTC (~$992,63)
          </div>
          <div className="p-3">
            <span ><strong> {amount}  {currency} </strong></span>
            <span> <FormattedMessage id="InfoPay_2" defaultMessage="были успешно переданы" />
              <br />
              <strong>{address}</strong>
            </span>
          </div>

          <table styleName="blockCenter__table" className="table table-borderless">
            <tbody>
              <tr>
                <td styleName="header">
                  <FormattedMessage id="InfoPay_3" defaultMessage="Transaction ID" />
                </td>
                <td>
                  <a href={link} target="_blank"><ShortTextView text={link}/></a>
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
          { isMobile && <ShareButton link={link} title={amount.toString() + ' ' + currency.toString() + ' ' + intl.formatMessage(labels.Text) + ' ' + address} />
          }
        </div>
      </Modal>
    )
  }
}