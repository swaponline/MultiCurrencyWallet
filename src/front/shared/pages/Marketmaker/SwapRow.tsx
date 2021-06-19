import React, { Fragment, Component } from 'react'
import moment from 'moment/moment'
import cx from 'classnames'

import { links, localStorage } from 'helpers'
import actions from 'redux/actions'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './SwapRow.scss'

import Timer from 'pages/Swap/Timer/Timer'
import { FormattedMessage, injectIntl } from 'react-intl'
import BigNumber from 'bignumber.js'

import SwapApp from 'swap.app'


interface SwapRowProps {
  row: any
  swapState: any
  extractSwapStatus: Function
  intl: any
}

@CSSModules(styles, { allowMultiple: true })
class SwapRow extends Component<any, any> {
  _mounted = true
  _handleSwapEnterStep = null

  constructor(props: SwapRowProps) {
    super(props)

    const {
      row: swapState,
    } = props

    this._handleSwapEnterStep = this.onSwapEnterStep.bind(this)
    this.state = {
      swapState,
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
        swapState: this.props.extractSwapStatus(swap),
      })
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
    
    const {
      row: {
        isFinished,
        isRefunded,
        isStoppedSwap,
        isSwapTimeout,
        id,
      },
    } = this.props

    if (!isFinished && !isRefunded && !isStoppedSwap && !isSwapTimeout) {
      //@ts-ignore: strictNullChecks
      SwapApp.shared().on('swap enter step', this._handleSwapEnterStep)
    }
  }

  componentWillUnmount() {
    console.log('History unmounted')
    this._mounted = false
    //@ts-ignore: strictNullChecks
    SwapApp.shared().off('swap enter step', this._handleSwapEnterStep)
  }

  render() {
    const {
      row: swapId,
      intl: { locale },
    } = this.props

    const {
      swapState,
    } = this.state

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
      isSwapTimeout,
      id,
      scriptValues,
      isStoppedSwap,
      step,
    } = swapState

    if (step <=1 && isSwapTimeout) return null

    const canBeRefunded = values && scriptBalance > 0
    const isDeletedSwap = isFinished || isRefunded

    const date = Date.now() / 1000

    let lockDateAndTime = null
    if (values) {
      //@ts-ignore: strictNullChecks
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
        {step <= 1 && (
          <Fragment>
            <td colSpan={6}>
              prepare swap
            </td>
          </Fragment>
        )}
        {step > 1 && (
          <Fragment>
            <td>
              {isMy
                ? `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`
                : `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`}
            </td>
            <td>
              {step}
            </td>
            <td>
              {isMy
                ? `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`
                : `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`}
            </td>
            <td>
              {(lockDateAndTime !== null) && (
                <Fragment>
                  {/* @ts-ignore: strictNullChecks */}
                  {lockDateAndTime.split(' ').map((item, key) => (
                    <Fragment key={key}> {item}</Fragment>
                  ))}
                </Fragment>
              )}
            </td>
            <td>
              <div
                className={cx({
                  [styles.statusFinished]: isFinished,
                  [styles.statusRefunded]: isRefunded,
                  [styles.statusStopped]: !isFinished && !isRefunded && isStoppedSwap,
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
              </div>
            </td>
            <td>
              <Link to={swapUri}>
                <FormattedMessage id="RowHistory91" defaultMessage="Link" />
              </Link>
            </td>
          </Fragment>
        )}
      </tr>
    )
  }
}

export default injectIntl(SwapRow)
