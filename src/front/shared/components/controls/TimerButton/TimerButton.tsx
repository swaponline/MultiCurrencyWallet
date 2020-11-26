import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Button from 'components/controls/Button/Button'
import Timer from 'components/Timer/Timer'


export default class TimerButton extends Component<any, any> {

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    timeLeft: PropTypes.number.isRequired,
    className: PropTypes.string,
    disabledTimer: PropTypes.bool,
    forceClick: PropTypes.bool,
  }

  static defaultProps = {
    disabledTimer: false,
  }

  componentDidMount() {
    const {
      forceClick,
      onClick,
    } = this.props

    if (forceClick) onClick()
  }

  render() {
    const { children, disabledTimer, timeLeft, className, onClick, ...rest } = this.props
    const { forceClick } = this.props

    if (forceClick) return null

    return (
      <Button className={className} onClick={onClick} {...rest} >
        {children}
        {` `}
        {!disabledTimer && <Timer timeLeft={timeLeft} handleClick={onClick} />}
      </Button>
    )

  }
}
