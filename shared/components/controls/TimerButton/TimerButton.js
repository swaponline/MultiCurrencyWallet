import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Button from 'components/controls/Button/Button'


export default class TimerButton extends Component {

  static propTypes = {
    timeLeft: PropTypes.number, // seconds
    onClick: PropTypes.func.isRequired,
  }

  static defaultProps = {
    timeLeft: 10,
  }

  timer = null

  constructor({ timeLeft }) {
    super()

    this.state = {
      timeLeft,
    }
  }

  componentDidMount() {
    this.tick()
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  tick = () => {
    const { timeLeft } = this.state
    const newTimeLeft = timeLeft - 1

    if (newTimeLeft <= 0) {
      this.handleClick()
    }
    else {
      this.timer = setTimeout(this.tick, 1000)
    }
  }

  handleClick = () => {
    const { onClick } = this.props

    clearTimeout(this.timer)
    onClick()
  }

  render() {
    const { timeLeft } = this.state
    const { children } = this.props

    return (
      <Button onClick={this.handleClick}>{children}. Auto click in {timeLeft}s</Button>
    )
  }
}
