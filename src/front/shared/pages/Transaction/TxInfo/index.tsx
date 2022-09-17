import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import helpers from 'helpers'
import { getFullOrigin } from 'helpers/links'

import cssModules from 'react-css-modules'
import ShareButton from 'components/controls/ShareButton/ShareButton'
import { regularIcons } from 'images'
import actions from 'redux/actions'
import { BigNumber } from 'bignumber.js'
import Skeleton from 'react-loading-skeleton'
import CommentRow from 'components/Comment/Comment'

import animateFetching from 'components/loaders/ContentLoader/ElementLoading.scss'
import styles from './styles.scss'
import 'react-loading-skeleton/dist/skeleton.css'

@cssModules({
  ...styles,
  ...animateFetching,
}, { allowMultiple: true })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class TxInfo extends Component<any, any> {
  constructor(props) {
    super(props)

    const {
      currency: sourceCurrency,
      txRaw,
      txHash,
      error,
    } = props

    let linkBlockChain = '#'
    let linkShare = '#'
    let tx = ''

    if (!error) {
      if (txRaw) {
        const txInfo = helpers.transactions.getInfo(sourceCurrency.toLowerCase(), txRaw)

        tx = txInfo.tx
        linkBlockChain = txInfo.link
      }

      if (txHash) {
        tx = txHash
        linkShare = helpers.transactions.getTxRouter(sourceCurrency.toLowerCase(), txHash)
        linkBlockChain = helpers.transactions.getLink(sourceCurrency.toLowerCase(), txHash)
      }
    }

    // delete tokens base currency prefix
    const currency = sourceCurrency.replace(/^\{[a-z1-2_]+\}/, '')

    this.state = {
      currency,
      linkBlockChain,
      linkShare,
      tx,
    }
  }

  updateComment = (value) => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ state: this.state })
  }

  getShortInfoHolder = (finalAmount) => {
    const {
      isFetching,
      userAddress,
      sender: fromAddress,
      error,
    } = this.props

    let {
      toAddress,
    } = this.props

    const {
      currency,
    } = this.state

    if (isFetching) return <Skeleton count={2} />
    if (error)      return <FormattedMessage id="InfoPay_2_Error" defaultMessage="Error loading data" />

    // eslint-disable-next-line prefer-destructuring
    if (Array.isArray(toAddress)) toAddress = toAddress[0]

    const amountText = (
      <strong id="txAmout">
        {' '}
        {finalAmount}
        {'  '}
        {currency.toUpperCase()}
        {' '}
      </strong>
    )
    const toAddressText = <strong id="txToAddress">{toAddress}</strong>
    const fromAddressText = <strong id="txfromAddress">{fromAddress}</strong>

    if (fromAddress === toAddress) {
      return (
        <FormattedMessage
          id="InfoPay_2_Self"
          defaultMessage="{amount} successfully self transfer with {br}{address}"
          values={{
            amount: amountText,
            br: <br />,
            address: toAddressText,
          }}
        />
      )
    }

    if (userAddress?.toLowerCase() === fromAddress?.toLowerCase()) {
      return (
        <FormattedMessage
          id="InfoPay_2_To"
          defaultMessage="{amount} successfully transferred to {br}{toAddress}"
          values={{
            amount: amountText,
            br: <br />,
            toAddress: toAddressText,
          }}
        />
      )
    }

    if (userAddress?.toLowerCase() === toAddress?.toLowerCase()) {
      return (
        <FormattedMessage
          id="InfoPay_2_From"
          defaultMessage="{amount} successfully received from {br}{fromAddress}"
          values={{
            amount: amountText,
            br: <br />,
            fromAddress: fromAddressText,
          }}
        />
      )
    }

    return (
      <FormattedMessage
        id="InfoPay_2_External"
        defaultMessage="{amount} successfully transferred from {br}{fromAddress} to {toAddress}"
        values={{
          amount: amountText,
          br: <br />,
          fromAddress: fromAddressText,
          toAddress: toAddressText,
        }}
      />
    )
  }

  render() {
    const {
      txId,
      isFetching,
      amount,
      toAddress,
      oldBalance,
      confirmed,
      minerFee,
      minerFeeCurrency,
      adminFee,
      error,
      finalBalances,
    } = this.props

    const {
      currency,
      linkBlockChain,
      linkShare,
      tx,
    } = this.state

    let finalAmount = amount
    let finalAdminFee = adminFee

    let fromFinal = 0
    let toFinal = 0

    let fromIsOur = false
    let toIsOur = false
    if (finalBalances) {
      finalAmount = finalBalances.amount
      finalAdminFee = finalBalances.adminFee
      fromFinal = new BigNumber(finalBalances.fromBalance).minus(finalAmount).minus(finalAdminFee).toNumber()
      toFinal = new BigNumber(finalBalances.toBalance).plus(finalAmount).toNumber()
      fromIsOur = actions.user.isOwner(finalBalances.from, finalBalances.currency)
      toIsOur = actions.user.isOwner(finalBalances.to, finalBalances.currency)
    }

    const comment = actions.comments.getComment(txId)

    return (
      <div>
        <div styleName="blockCenter">
          <div>
            <img styleName="finishImg" src={regularIcons.OK} alt="finish" />
          </div>

          <div className="p-3">
            <div styleName="shortInfoHolder">
              {this.getShortInfoHolder(finalAmount)}
            </div>
          </div>

          <table styleName="blockCenter__table" className="table table-borderless">
            <tbody>
              <tr>
                <td styleName="header">
                  <FormattedMessage id="InfoPay_3" defaultMessage="Transaction ID" />
                </td>
                <td>
                  <a href={linkBlockChain} target="_blank" styleName="txLink" rel="noreferrer">
                    {`${tx.slice(0, 6)}...${tx.slice(-6)}`}
                  </a>
                </td>
              </tr>
              {isFetching ? (
                <>
                  <tr>
                    <td colSpan={2}>
                      <Skeleton />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <Skeleton />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <Skeleton />
                    </td>
                  </tr>
                </>
              ) : error
                ? null
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
                          <FormattedMessage id="InfoPay_4" defaultMessage="Est. time to confirmation" />
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
                            {minerFee}
                            {' '}
                            {minerFeeCurrency}
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
                            {finalAdminFee}
                            {' '}
                            {currency.toUpperCase()}
                          </strong>
                        </td>
                      </tr>
                    )}
                    {(finalBalances) ? (
                      <>
                        <tr>
                          <td styleName="header" colSpan={2}>
                            <FormattedMessage id="InfoPay_FinalBalances" defaultMessage="Final balances" />
                          </td>
                        </tr>
                        <tr>
                          <td styleName="header" colSpan={2}>
                            {finalBalances.from}
                            {(fromIsOur) && (
                              <>
                                {` `}
                                <FormattedMessage id="InfoPay_IsOurAddress" defaultMessage="(Your)" />
                              </>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td />
                          <td>
                            <strong>
                              {fromFinal}
                              {' '}
                              {currency.toUpperCase()}
                            </strong>
                          </td>
                        </tr>
                        <tr>
                          <td styleName="header" colSpan={2}>
                            {finalBalances.to}
                            {(toIsOur) && (
                              <>
                                {` `}
                                <FormattedMessage id="InfoPay_IsOurAddress" defaultMessage="(Your)" />
                              </>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td />
                          <td>
                            <strong>
                              {toFinal}
                              {' '}
                              {currency.toUpperCase()}
                            </strong>
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
                                {oldBalance}
                                {' '}
                                {currency.toUpperCase()}
                              </strong>
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </>
                )}
              {comment && (
                <tr>
                  <td styleName="header">
                    <FormattedMessage id="InfoPay_Comment" defaultMessage="Comment" />
                  </td>
                  <td>
                    <strong>
                      {comment}
                    </strong>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div styleName="blockCenter buttonHolder">
          <ShareButton
            halfWidth
            minWidth="200px"
            link={`${getFullOrigin()}${linkShare}`}
            title={`${amount.toString()} ${currency.toString()} ${<FormattedMessage id="InfoPay_2" defaultMessage="transferred to" />} ${toAddress}`}
          />
          <CommentRow
            label=""
            canEdit
            updateComment={(v) => this.updateComment(v)}
            commentKey={txId}
          />
        </div>
      </div>
    )
  }
}

export default TxInfo
