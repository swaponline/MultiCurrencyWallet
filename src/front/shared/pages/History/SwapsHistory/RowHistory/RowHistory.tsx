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


@CSSModules(styles, { allowMultiple: true })
class RowHistory extends Component<any, any> {
  static propTypes = {
    row: PropTypes.object,
  }

  tryRefund = (timeLeft) => {
    const {
      row: { id },
    } = this.props

    if (timeLeft > 0) {
      return
    }

    try {
      const { flow } = actions.core.getSwapById(id)

      const {
        state: { isFinished, isRefunded, step, scriptBalance, isEthContractFunded },
        swap: { sellCurrency },
      } = flow
      let isPayed = 5,
        isEmptyBalance = false
      if (sellCurrency === 'BTC') {
        isPayed = sellCurrency === 'BTC' ? 4 : 5
        isEmptyBalance = sellCurrency === 'BTC' ? scriptBalance === 0 : !isEthContractFunded
      }

      if (sellCurrency === 'GHOST') {
        isPayed = sellCurrency === 'GHOST' ? 4 : 5
        isEmptyBalance = sellCurrency === 'GHOST' ? scriptBalance === 0 : !isEthContractFunded
      }

      if (sellCurrency === 'NEXT') {
        isPayed = sellCurrency === 'NEXT' ? 4 : 5
        isEmptyBalance = sellCurrency === 'NEXT' ? scriptBalance === 0 : !isEthContractFunded
      }

      if (isFinished || isRefunded || (step === isPayed && isEmptyBalance)) {
        console.group('HISTORY ROW > %c Refund of swap', 'color: red;')
        console.error(`Refund of swap ${id} is not available`)
        console.groupEnd()
        return
      }

      flow.tryRefund().then((result) => {
        console.log('refunded', result)
      })
    } catch (err) {
      console.error(`RefundError`, err)
    }
  }

  getSwapStatusText = (isFinished: boolean, isRefunded: boolean, isStoppedSwap: boolean) => {
    if (isFinished) {
      return <FormattedMessage id="RowHistory94" defaultMessage="Finished" />
    }
    if (isRefunded) {
      return <FormattedMessage id="RowHistory77" defaultMessage="Refunded" />
    }
    if (isStoppedSwap) {
      return <FormattedMessage id="RowHistory139" defaultMessage="Stopped" />
    }

    return ''
  }

  closeIncompleted = () => {
    actions.modals.close('IncompletedSwaps')
  }
  componentDidMount() {
    const {
      utxoScriptValues: values,
    } = this.props.row

    if (!values) return

    const lockTime = values.lockTime * 1000

    const timeLeft = lockTime - Date.now()

    this.tryRefund(timeLeft)
  }

  render() {
    const {
      row,
      intl: { locale },
    } = this.props

    if (row === 'undefined') {
      return null
    }

    let {
      buyAmount,
      buyCurrency,
      sellAmount,
      utxoScriptValues: values,
      scriptBalance,
      isRefunded,
      isMy,
      isTurbo,
      sellCurrency,
      isFinished,
      id,
      scriptValues,
      isStoppedSwap,
    } = row

    const canBeRefunded = values && scriptBalance > 0
    const isDeletedSwap = isFinished || isRefunded

    const date = Date.now() / 1000

    if (!values) {
      return
    }

    const lockDateAndTime = moment.unix(values.lockTime || date).format('HH:mm:ss DD/MM/YYYY')

    const swapUri = isTurbo ?
      `${links.turboSwap}/${id}`
      :
      `${links.atomicSwap}/${id}`

    buyAmount = new BigNumber(buyAmount)
    sellAmount = new BigNumber(sellAmount)

    return (
      <tr key={id}>
        <td>
          <span>You buy</span>
          {isMy
            ? `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`
            : `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`}
        </td>
        <td>
          <span>You sell</span>
          {isMy
            ? `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`
            : `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`}
        </td>
        <td>
          <span>Lock time</span>
          {lockDateAndTime.split(' ').map((item, key) => (
            <Fragment key={key}> {item}</Fragment>
          ))}
        </td>
        <td>
          <span>Status</span>
          <p
            className={cx({
              [styles.statusFinished]: isFinished,
              [styles.statusRefunded]: isRefunded,
              [styles.statusStopped]: isStoppedSwap && (isFinished || isRefunded) ? false : true,
            })}
          >
            {this.getSwapStatusText(isFinished, isRefunded, isStoppedSwap)}

            {!isDeletedSwap && (
              <div styleName="refundStatus">
                {canBeRefunded ? (
                  <Timer lockTime={values.lockTime * 1000} enabledButton={this.tryRefund} />
                ) : (
                  <FormattedMessage id="RowHistory76" defaultMessage="Refund not available" />
                )}
              </div>
            )}
          </p>
        </td>
        <td>
          <Link to={swapUri} onClick={this.closeIncompleted}>
            <FormattedMessage id="RowHistory91" defaultMessage="Link" />
          </Link>
        </td>
      </tr>
    )
  }
}

export default injectIntl(RowHistory)
