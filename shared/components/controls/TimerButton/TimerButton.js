import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Button from 'components/controls/Button/Button'
import Timer from 'components/Timer/Timer'


export default class TimerButton extends Component {

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    timeLeft: PropTypes.number.isRequired,
    className: PropTypes.string,
  }

  handleClick = () => {
    const { onClick } = this.props

    clearTimeout(this.timer)
    onClick()
  }

  render() {
    const { children, timeLeft, className, ...rest } = this.props

    return (
      <Button onClick={this.handleClick} className={className} {...rest} >
        {children}
        <Timer timeLeft={timeLeft} handleClick={this.handleClick} />
      </Button>
    )

  }
}
