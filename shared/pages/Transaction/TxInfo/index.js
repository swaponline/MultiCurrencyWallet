import React, { Component } from 'react'
import { Modal } from 'components/modal'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import helpers from "helpers";
import { getFullOrigin } from 'helpers/links'

import cssModules from 'react-css-modules'
import styles from './styles.scss'
import ShareButton from 'components/controls/ShareButton/ShareButton'
import finishSvg from './images/finish.svg'
import actions from 'redux/actions'
import Button from 'components/controls/Button/Button'
import ShortTextView from 'pages/Wallet/components/ShortTextView/ShortTextView.js'
import { isMobile } from "react-device-detect";
import { BigNumber } from 'bignumber.js'

import animateFetching from 'components/loaders/ContentLoader/ElementLoading.scss'



const labels = defineMessages({
  Title: {
    id: 'InfoPay_1',
    defaultMessage: 'Transaction is completed',
  },
  Text: {
    id: 'InfoPay_2',
    defaultMessage: 'successfully transferred to'
  },
  
})
@injectIntl
@cssModules({
  ...styles,
  ...animateFetching,
}, { allowMultiple: true })

export default class TxInfo extends React.Component {

  constructor(props) {
    super(props)

    const {
      amount,
      currency,
      toAddress,
      txRaw,
      txId,
      balance,
      oldBalance,
      confirmed,
      isFetching,
      onFetching,
    } = props

  }

  render() {
    const {
      intl,
      currency,
      txRaw,
      txId,
      isFetching,
      amount,
      toAddress,
      balance,
      oldBalance,
      confirmed,
    } = this.props

    let linkBlockChain = '#'
    let linkShare = '#'
    let tx = ''

    if(txRaw) {
      const txInfo = helpers.transactions.getInfo(currency.toLowerCase(), txRaw)
      tx = txInfo.tx
      linkBlockChain = txInfo.link
    }

    if (txId) {
      tx = txId
      linkShare = helpers.transactions.getTxRouter(currency.toLowerCase(), txId)
      linkBlockChain = helpers.transactions.getLink(currency.toLowerCase(), txId)
    }

    return (
      <div>
        <div styleName="blockCenter">
          <div>
            <img styleName="finishImg" src={finishSvg} alt="finish" />
          </div>

          <div className="p-3" styleName={isFetching ? `animate-fetching` : ``}>
            <div styleName="shortInfoHolder">
              <span><strong> {amount}  {currency.toUpperCase()} </strong></span>
              {!isFetching && (
                <span> <FormattedMessage id="InfoPay_2" defaultMessage="были успешно переданы" />
                  <br />
                  <strong>{toAddress}</strong>
                </span>
              )}
            </div>
          </div>

          <table styleName="blockCenter__table" className="table table-borderless">
            <tbody>
              <tr>
                <td styleName="header">
                  <FormattedMessage id="InfoPay_3" defaultMessage="Transaction ID" />
                </td>
                <td>
                  <a href={window.location.href} target="_blank" styleName="txLink">
                    {`${tx.slice(0, 6)}...${tx.slice(-6)}`}
                  </a>
                </td>
              </tr>
              {isFetching ? (
                <>
                  <tr>
                    <td styleName="animate-fetching" colSpan="2"></td>
                  </tr>
                </>
              ) : (
                <>
                  {/* <tr>
                      <td styleName="header">
                        <FormattedMessage id="InfoPay_4" defaultMessage="Est. time to confitmation" />
                      </td>
                      <td>
                        {confirmed && (
                          <strong>
                            <FormattedMessage id="InfoPay_Confirmed" defaultMessage="Confirmed" />
                          </strong>
                        )}
                        {!confirmed && (
                          <FormattedMessage id="InfoPay_NotConfirmed" defaultMessage="~10 mins" />
                        )}
                      </td>
                    </tr> */}
                  {(oldBalance > 0) && (
                    <tr>
                      <td styleName="header">
                        <FormattedMessage id="InfoPay_FinalBalance" defaultMessage="Final balance" />
                      </td>
                      <td>
                        <strong>
                          {oldBalance} {currency}
                        </strong>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
        <div styleName="blockCenter buttonHolder">
          <ShareButton
            halfWidth={true}
            minWidth="200px"
            link={`${getFullOrigin()}${linkShare}`}
            title={amount.toString() + ' ' + currency.toString() + ' ' + intl.formatMessage(labels.Text) + ' ' + toAddress} />
        </div>
      </div>
    )
  }
}