import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Timer.scss'


@CSSModules(styles)
export default class Timer extends React.Component {

  static propTypes = {
    lockTime: PropTypes.number,
  }

  timer = null

  constructor(props) {
    super(props)
    const { lockTime } = props
    console.log(lockTime)

    const dateNow = new Date().getTime()
    const timeLeft = lockTime - dateNow
    this.state = {
      lockTime,
      timeLeft,
    }  
  }
  
  componentDidMount() {
    this.tick()
  }

  tick = () => {
    const { timeLeft } = this.state
    const newTimeLeft = timeLeft - 1000

    if (newTimeLeft <= 0) {
      this.props.enabledButton()
    }
    else {
      this.timer = setTimeout(this.tick, 1000)
      this.setState({
        timeLeft: newTimeLeft,
      })
    }
  }

  render() {
    const { timeLeft } = this.state
    const min = Math.ceil(timeLeft / 1000 / 60)

    return (
      <div styleName="timer">
        {
          min > 0 ? (
            `${min} minute left for refund`
          ) : (
            'refund ready'
          )
        }
      </div>
    )
  }

}
