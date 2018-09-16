import React, { Component } from 'react'

import PropTypes from 'prop-types'


export default class TimerButton extends Component {

  static propTypes = {
    timeLeft: PropTypes.number, // seconds
    handleClick: PropTypes.func,
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
      this.props.handleClick()
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

    return timeLeft
  }
}
