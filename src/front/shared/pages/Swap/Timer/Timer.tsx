import React, { Fragment }  from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Timer.scss'
import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class Timer extends React.Component<any, any> {

  props: any

  static propTypes = {
    lockTime: PropTypes.number,
    cancelTime: PropTypes.number,
  }

  timer = null

  constructor({ lockTime, cancelTime }) {
    //@ts-ignore
    super()

    this.state = {
      lockTime,
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
    const newTimeLeft = timeLeft - 1000
    const newCancelTimeLeft = cancelTimeLeft - 1000

    if (newTimeLeft <= 0 && typeof enabledButton === 'function') {
      enabledButton()
    }
    else {
      this.timer = setTimeout(this.tick, 1000)
      this.setState({
        timeLeft: newTimeLeft,
        cancelTimeLeft: newCancelTimeLeft,
      })
    }
  }

  render() {
    const { timeLeft, cancelTimeLeft, cancelTime } = this.state
    const { isRefund } = this.props
    const min = Math.ceil(timeLeft / 1000 / 60)
    const minToCancel = Math.ceil(cancelTimeLeft / 1000 / 60)

    return (
      <Fragment>
        {
          (cancelTime && (cancelTimeLeft > 0) && !isRefund) ? (
            <div styleName="timer">
              <FormattedMessage
                id="timerTimeToCancel"
                defaultMessage="You have {min} min to make a payment"
                values={{ min: `${minToCancel}` }}
              />
            </div>
          ) : (
            <Fragment>
              {
                (cancelTime && (cancelTimeLeft <= 0)) && (
                  <div styleName="timer">
                    <FormattedMessage id="timerSwapIsCancelled" defaultMessage="Swap canceled due to time out" />
                  </div>
                )
              }
              <br />
              <div styleName="timer">
                {
                  this.props.defaultMessage === false ? (
                    <span>{min}</span>
                  ) : (
                    min > 0 ? (
                      <span>
                        <FormattedMessage
                          id="timer671"
                          defaultMessage="minute left for refund"
                          values={{ min: `${min}` }}
                        />
                      </span>
                    ) : (
                      <FormattedMessage id="timer68" defaultMessage="refund ready" />
                    )
                  )
                }
              </div>
            </Fragment>
          )
        }
      </Fragment>
    )
  }

}
