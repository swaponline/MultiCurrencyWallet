import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Button from 'components/controls/Button/Button'
import Timer from 'components/Timer/Timer'


export default class TimerButton extends Component<any, any> {

  props: any

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    timeLeft: PropTypes.number.isRequired,
    className: PropTypes.string,
    disabledTimer: PropTypes.bool,
  }

  static defaultProps = {
    disabledTimer: false,
  }

  render() {
    const { children, disabledTimer, timeLeft, className, onClick, ...rest } = this.props

    return (
      <Button className={className} onClick={onClick} {...rest} >
        {children}
        {!disabledTimer && <Timer timeLeft={timeLeft} handleClick={onClick} />}
      </Button>
    )

  }
}
