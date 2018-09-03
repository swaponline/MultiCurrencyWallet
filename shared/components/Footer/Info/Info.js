import React from 'react'
import { Line } from 'rc-progress'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './Info.scss'


class Info extends React.Component {
  static propTypes = {
    hideWidget: PropTypes.func,
  }
  static defaultProps = {
    hideWidget: () => {},
  }
  constructor() {
    super()
    this.state = { progressValue: 0 }
  }

  componentDidMount() {
    this.launchProgressBar()
  }

  launchProgressBar() {
    const maxValue = 100
    const timeToReachMaxValue = 60000
    const howOftenToProgres = 1000
    const progressUnit = maxValue / (timeToReachMaxValue / howOftenToProgres)

    const interval = setInterval(() => {
      const { progressValue } = this.state

      if (progressValue >= maxValue) {
        clearInterval(interval)
        this.props.hideWidget()
      }
      else {
        this.setState({ progressValue: progressValue + progressUnit })
      }
    }, howOftenToProgres)
  }

  render() {
    const { isOnline, serverAddress, onlineUsers } = this.props
    const { progressValue } = this.state

    return (
      <div styleName="title">
        <span styleName={isOnline ? 'connect' : 'disconnect'}>
          {isOnline ? 'Connected ' : 'Loading or not available '}
        </span>
        to IPFS signal {serverAddress} / peers online: {onlineUsers}

        <Line strokeColor="#2181F7" percent={progressValue} strokeWidth="1" />
      </div>
    )
  }
}

export default cssModules(Info, styles, { allowMultiple: true })
