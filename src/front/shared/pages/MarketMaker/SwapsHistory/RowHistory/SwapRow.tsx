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

import SwapApp from 'swap.app'


@CSSModules(styles, { allowMultiple: true })
class SwapRow extends Component<any, any> {
  static propTypes = {
    row: PropTypes.object,
    swapState: PropTypes.object,
  }

  _mounted = true

  constructor(props) {
    super(props)

    const {
      row: swapState,
    } = props
    
    this.state = {
      swapState,
    }
  }

  extractSwapStatus(swap) {
    const {
      id,
      isMy,
      isTurbo,
      buyCurrency,
      sellCurrency,
      buyAmount,
      sellAmount,
      createUnixTimeStamp,
      flow: {
        state,
      },
    } = swap
    return {
      id,
      isMy,
      buyCurrency,
      sellCurrency,
      buyAmount,
      sellAmount,
      createUnixTimeStamp,
      ...state,
    }
  }

  tryRefund = (timeLeft) => {
    /*
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
        console.error(`Refund of swap ${id} is not available`)
        return
      }

      flow.tryRefund().then((result) => {
        console.log('refunded', result)
      })
    } catch (err) {
      console.error(`RefundError`, err)
    }
    */
  }

  closeIncompleted = () => {
    actions.modals.close('IncompletedSwaps')
  }

  onSwapEnterStep(data) {
    if (!this._mounted) return

    const {
      swap,
      swap: {
        id: swapId,
      }
    } = data
    const {
      swapState: {
        id: mySwapId,
      }
    } = this.state
    if (mySwapId === swapId) {
      console.log('>>> ON ENTER MY SWAP STEP')
      this.setState({
        swapState: this.extractSwapStatus(swap),
      })
    }
  }

  componentDidMount() {
    /*
    const {
      utxoScriptValues: values,
    } = this.props.row

    if (!values) return

    const lockTime = values.lockTime * 1000

    const timeLeft = lockTime - Date.now()

    this.tryRefund(timeLeft)
    */
    SwapApp.shared().on('swap enter step', this.onSwapEnterStep.bind(this))
  }

  componentWillUnmount() {
    console.log('History unmounted')
    this._mounted = false
    SwapApp.shared().off('swap enter step', this.onSwapEnterStep)
  }

  render() {
    const {
      row: swapId,
      intl: { locale },
    } = this.props

    const {
      swapState,
    } = this.state
/*
    if (row === 'undefined') {
      return null
    }*/

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
      step,
    } = swapState

    const canBeRefunded = values && scriptBalance > 0
    const isDeletedSwap = isFinished || isRefunded || isStoppedSwap

    const date = Date.now() / 1000

    let lockDateAndTime = null
    if (values) {
      lockDateAndTime = moment.unix(values.lockTime || date).format('HH:mm:ss DD/MM/YYYY')
    }

    const swapUri = isTurbo ?
      `${links.turboSwap}/${id}`
      :
      `${links.atomicSwap}/${id}`

    buyAmount = new BigNumber(buyAmount)
    sellAmount = new BigNumber(sellAmount)

    return (
      <tr key={id}>
        <td>
          {isMy
            ? `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`
            : `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`}
        </td>
        <td>
          <p>
            {step}
          </p>
        </td>
        <td>
          {isMy
            ? `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`
            : `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`}
        </td>
        <td>
          {(lockDateAndTime !== null) && (
            <Fragment>
              {lockDateAndTime.split(' ').map((item, key) => (
                <Fragment key={key}> {item}</Fragment>
              ))}
            </Fragment>
          )}
        </td>
        <td>
          <p
            className={cx({
              [styles.statusFinished]: isFinished,
              [styles.statusRefunded]: isRefunded,
              [styles.statusStopped]: !isFinished && isStoppedSwap,
            })}
          >
            {isFinished && <FormattedMessage id="RowHistory94" defaultMessage="Finished" />}
            {isRefunded && <FormattedMessage id="RowHistory77" defaultMessage="Refunded" />}
            {!isFinished && isStoppedSwap && <FormattedMessage id="RowHistory139" defaultMessage="Stopped" />}
            {!isDeletedSwap &&
              (canBeRefunded ? (
                <Timer lockTime={values.lockTime * 1000} enabledButton={this.tryRefund} />
              ) : (
                <FormattedMessage id="RowHistory76" defaultMessage="Refund not available" />
              ))}
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

export default injectIntl(SwapRow)
