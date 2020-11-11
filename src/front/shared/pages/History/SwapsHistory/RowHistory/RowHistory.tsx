import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment/moment'
import cx from 'classnames'

import { links, localStorage } from 'helpers'
import actions from 'redux/actions'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './RowHistory.scss'

import Timer from 'pages/Swap/Timer/Timer'
import Avatar from 'components/Avatar/Avatar'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import BigNumber from 'bignumber.js'


@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class RowHistory extends Component<any, any> {

  static propTypes = {
    row: PropTypes.object,
  }

  tryRefund = (timeLeft) => {
    const { row: { id } } = this.props

    if (timeLeft > 0) {
      return
    }

    try {
      const { flow } = actions.core.getSwapById(id)

      const {
        state: { isFinished, isRefunded, step, scriptBalance, isEthContractFunded },
        swap: { sellCurrency },
      } = flow
      let isPayed = 5, isEmptyBalance = false;
      if(sellCurrency === 'BTC'){
        isPayed = sellCurrency === 'BTC' ? 4 : 5
        isEmptyBalance = sellCurrency === 'BTC' ? scriptBalance === 0 : !isEthContractFunded
      }

      if(sellCurrency === 'GHOST'){
        isPayed = sellCurrency === 'GHOST' ? 4 : 5
        isEmptyBalance = sellCurrency === 'GHOST' ? scriptBalance === 0 : !isEthContractFunded
      }

      if(sellCurrency === 'NEXT'){
        isPayed = sellCurrency === 'NEXT' ? 4 : 5
        isEmptyBalance = sellCurrency === 'NEXT' ? scriptBalance === 0 : !isEthContractFunded
      }

      if (isFinished || isRefunded || (step === isPayed && isEmptyBalance)) {
        console.error(`Refund of swap ${id} is not available`)
        return
      }

      flow.tryRefund()
        .then((result) => {
          console.log('refunded', result)
        })
    } catch (err) {
      console.error(`RefundError`, err)
    }
  }

  closeIncompleted = () => {
    actions.modals.close('IncompletedSwaps')
  }
  componentDidMount() {
    const {
      btcScriptValues, ltcScriptValues,
      usdtScriptValues, scriptValues, ghostScriptValues, nextScriptValues
    } = this.props.row

    const values  = btcScriptValues
      || ltcScriptValues
      || usdtScriptValues
      || ghostScriptValues
      || nextScriptValues
      || scriptValues

    if (!values) return

    const lockTime = values.lockTime * 1000

    const timeLeft = lockTime - Date.now()

    this.tryRefund(timeLeft)
  }

  render() {

    const { row, intl: { locale } } = this.props

    if (row === 'undefined') {
      return null
    }

    let {
      buyAmount, buyCurrency, sellAmount, btcScriptValues, scriptBalance, ghostScriptValues, nextScriptValues,
      isRefunded, isMy, sellCurrency,
      isFinished, id, scriptValues, isStoppedSwap,
    } = row

    const values = btcScriptValues || scriptValues || ghostScriptValues || nextScriptValues

    const canBeRefunded = values && scriptBalance > 0
    const isDeletedSwap = isFinished || isRefunded || isStoppedSwap

    const date = Date.now() / 1000

    if (!values) {
      return
    }

    const lockDateAndTime = moment.unix(values.lockTime || date).format('HH:mm:ss DD/MM/YYYY')

    const linkToTheSwap = `${localisedUrl(locale, links.swap)}/${sellCurrency}-${buyCurrency}/${id}`

    buyAmount = BigNumber(buyAmount)
    sellAmount = BigNumber(sellAmount)

    return (
      <tr key={id}>
        <td>
          <span>You buy</span>
          {
            isMy ? (
              `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`
            ) : (
              `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`
            )
          }
        </td>
        <td>
          <span>You sell</span>
          {
            isMy ? (
              `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`
            ) : (
              `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`
            )
          }
        </td>
        <td>
          <span>Lock time</span>
          {lockDateAndTime.split(' ').map((item, key) => <Fragment key={key}>{' '}{item}</Fragment>)}
        </td>
        <td>
          <span>Status</span>
          <p
            className={cx({
              [styles.statusFinished]: isFinished,
              [styles.statusRefunded]: isRefunded,
              [styles.statusStopped]: isStoppedSwap,
            })}
          >
            {isFinished && (<FormattedMessage id="RowHistory94" defaultMessage="Finished" />)}
            {isRefunded && (<FormattedMessage id="RowHistory77" defaultMessage="Refunded" />)}
            {isStoppedSwap && (<FormattedMessage id="RowHistory139" defaultMessage="Stopped" />)}
            {!isDeletedSwap && (canBeRefunded
              ? (
                <Timer
                  lockTime={values.lockTime * 1000}
                  enabledButton={this.tryRefund}
                />
              )
              : (
                <FormattedMessage id="RowHistory76" defaultMessage="Refund not available" />
              )
            )
            }
          </p>
        </td>
        <td>
          <span>Link</span>
          <Link to={`${linkToTheSwap}`} onClick={this.closeIncompleted}>
            <FormattedMessage id="RowHistory91" defaultMessage="Link" />
          </Link>
        </td>
      </tr>
    )
  }
}
