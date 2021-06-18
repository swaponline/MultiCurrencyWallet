import React, { Fragment } from 'react'

import CSSModules from 'react-css-modules'
import styles from './Timer.scss'
import { FormattedMessage } from 'react-intl'

interface TimerProps {
  lockTime: number
  cancelTime?: number
  enabledButton?: any
  isRefund?: boolean
  defaultMessage?: boolean
}

interface TimerState {
  lockTime: number
  cancelTime: number
  timeLeft: null | number
  cancelTimeLeft: null | number
}

@CSSModules(styles)
export default class Timer extends React.Component<TimerProps, TimerState> {
  timer = null

  constructor(props: TimerProps) {
    super(props)
    const { lockTime, cancelTime } = props

    this.state = {
      lockTime,
      //@ts-ignore: strictNullChecks
      cancelTime,
      timeLeft: null,
      cancelTimeLeft: null,
    }
  }

  componentDidMount() {
    this.tick()
  }

  componentWillMount() {
    const { lockTime, cancelTime } = this.state

    const dateNow = new Date().getTime()
    const timeLeft = lockTime - dateNow
    const cancelTimeLeft = cancelTime - dateNow

    this.setState({
      timeLeft,
      cancelTimeLeft,
    })
  }

  tick = () => {
    const { timeLeft, cancelTimeLeft } = this.state
    const { enabledButton } = this.props
    //@ts-ignore: strictNullChecks
    const newTimeLeft = timeLeft - 1000
    //@ts-ignore: strictNullChecks
    const newCancelTimeLeft = cancelTimeLeft - 1000

    if (newTimeLeft <= 0 && typeof enabledButton === 'function') {
      enabledButton()
    } else {
      //@ts-ignore: strictNullChecks
      this.timer = setTimeout(this.tick, 1000)
      this.setState({
        timeLeft: newTimeLeft,
        cancelTimeLeft: newCancelTimeLeft,
      })
    }
  }

  render() {
    const { timeLeft, cancelTimeLeft, cancelTime } = this.state
    const { isRefund, defaultMessage } = this.props
    //@ts-ignore: strictNullChecks
    const min = Math.ceil(timeLeft / 1000 / 60)
    //@ts-ignore: strictNullChecks
    const minToCancel = Math.ceil(cancelTimeLeft / 1000 / 60)

    return (
      <Fragment>
        {/* @ts-ignore: strictNullChecks */}
        {cancelTime && cancelTimeLeft > 0 && !isRefund ? (
          <div styleName="timer">
            <FormattedMessage
              id="timerTimeToCancel"
              defaultMessage="You have {min} min to make a payment"
              values={{ min: `${minToCancel}` }}
            />
          </div>
        ) : (
          <Fragment>
            {/* @ts-ignore: strictNullChecks */}
            {cancelTime && cancelTimeLeft <= 0 && (
              <div styleName="timer">
                <FormattedMessage
                  id="timerSwapIsCancelled"
                  defaultMessage="Swap canceled due to time out"
                />
              </div>
            )}
            <div styleName="timer">
              {defaultMessage === false ? (
                <span>{min}</span>
              ) : min > 0 ? (
                <span>
                  <FormattedMessage
                    id="timer671"
                    defaultMessage="{min} minute left for refund"
                    values={{ min: `${min}` }}
                  />
                </span>
              ) : (
                <FormattedMessage id="timer68" defaultMessage="refund ready" />
              )}
            </div>
          </Fragment>
        )}
      </Fragment>
    )
  }
}
