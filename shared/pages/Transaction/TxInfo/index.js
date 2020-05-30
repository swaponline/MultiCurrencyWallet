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
import Skeleton from 'react-loading-skeleton'

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
      confirmations,
      minerFee,
      minerFeeCurrency,
      adminFee,
      error,
      finalBalances,
    } = this.props

    let linkBlockChain = '#'
    let linkShare = '#'
    let tx = ''

    if (!error) {
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
    }

    let finalAmount = amount
    let finalAdminFee = adminFee

    let fromFinal = 0
    let toFinal = 0
    if (finalBalances) {
      finalAmount = finalBalances.amount
      finalAdminFee = finalBalances.adminFee
      fromFinal = BigNumber(finalBalances.fromBalance).minus(finalAmount).minus(finalAdminFee).toNumber()
      toFinal = BigNumber(finalBalances.toBalance).plus(finalAmount).toNumber()
    }

    return (
      <div>
        <div styleName="blockCenter">
          <div>
            <img styleName="finishImg" src={finishSvg} alt="finish" />
          </div>

          <div className="p-3">
            <div styleName="shortInfoHolder">
              {
                isFetching
                  ? (
                    <span>
                      <Skeleton count={2} />
                    </span>
                  )
                  : error
                    ? (
                      <span>
                        <span><FormattedMessage id="InfoPay_2_Error" defaultMessage="Error loading data" /></span>
                      </span>
                      )
                    : (
                      <span>
                        <span><strong> {finalAmount}  {currency.toUpperCase()} </strong></span>
                        <FormattedMessage id="InfoPay_2_Ready" defaultMessage="были успешно переданы" />
                        <br />
                        <strong>{toAddress}</strong>
                      </span>
                    )
              }
            </div>
          </div>

          <table styleName="blockCenter__table" className="table table-borderless">
            <tbody>
              <tr>
                <td styleName="header">
                  <FormattedMessage id="InfoPay_3" defaultMessage="Transaction ID" />
                </td>
                <td>
                  <a href={linkBlockChain} target="_blank" styleName="txLink">
                    {`${tx.slice(0, 6)}...${tx.slice(-6)}`}
                  </a>
                </td>
              </tr>
              {isFetching ? (
                <>
                  <tr>
                    <td colSpan="2">
                      <Skeleton />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <Skeleton />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <Skeleton />
                    </td>
                  </tr>
                </>
              ) : error
                ? ''
                : (
                  <>
                    {(confirmed) ? (
                      <tr>
                        <td styleName="header">
                          <FormattedMessage id="InfoPay_StatusReadyHeader" defaultMessage="Status" />
                        </td>
                        <td>
                          <strong>
                            <FormattedMessage id="InfoPay_Confirmed" defaultMessage="Confirmed" />
                          </strong>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td styleName="header">
                          <FormattedMessage id="InfoPay_4" defaultMessage="Est. time to confitmation" />
                        </td>
                        <td>
                          <FormattedMessage id="InfoPay_NotConfirmed" defaultMessage="~10 mins" />
                        </td>
                      </tr>
                    )}
                    {(minerFee > 0) && (
                      <tr>
                        <td styleName="header">
                          <FormattedMessage id="InfoPay_MinerFee" defaultMessage="Miner fee" />
                        </td>
                        <td>
                          <strong>
                            {minerFee} {minerFeeCurrency}
                          </strong>
                        </td>
                      </tr>
                    )}
                    {(finalAdminFee > 0) && (
                      <tr>
                        <td styleName="header">
                          <FormattedMessage id="InfoPay_AdminFee" defaultMessage="Service fee" />
                        </td>
                        <td>
                          <strong>
                            {finalAdminFee} {currency.toUpperCase()}
                          </strong>
                        </td>
                      </tr>
                    )}
                    {(finalBalances) ? (
                      <>
                        <tr>
                          <td styleName="header" colspan="2">
                            <FormattedMessage id="InfoPay_FinalBalances" defaultMessage="Final balances" />
                          </td>
                        </tr>
                        <tr>
                          <td styleName="header" colspan="2">
                            {finalBalances.from}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>
                            <strong>{fromFinal} {currency.toUpperCase()}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td styleName="header" colspan="2">
                            {finalBalances.to}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>
                            <strong>{toFinal} {currency.toUpperCase()}</strong>
                          </td>
                        </tr>
                      </>
                    ) : (
                      <>
                        {(oldBalance > 0) && (
                          <tr>
                            <td styleName="header">
                              <FormattedMessage id="InfoPay_FinalBalance" defaultMessage="Final balance" />
                            </td>
                            <td>
                              <strong>
                                {oldBalance} {currency.toUpperCase()}
                              </strong>
                            </td>
                          </tr>
                        )}
                      </>
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