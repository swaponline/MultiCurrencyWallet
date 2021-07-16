import { Component } from 'react'

type ComponentProps = {
  timeLeft?: number // seconds
  handleClick: () => void
}

type ComponentState = {
  timeLeft: number
}

export default class TimerButton extends Component<ComponentProps, ComponentState> {
  timer = null

  constructor(props) {
    super(props)

    const { timeLeft = 10 } = props

    this.state = {
      timeLeft,
    }
  }

  componentDidMount() {
    this.tick()
  }

  componentWillUnmount() {
    //@ts-ignore: strictNullChecks
    clearTimeout(this.timer)
  }

  tick = () => {
    const { timeLeft } = this.state
    const newTimeLeft = timeLeft - 1

    if (newTimeLeft <= 0) {
      this.props.handleClick()
    }
    else {
      //@ts-ignore: strictNullChecks
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
