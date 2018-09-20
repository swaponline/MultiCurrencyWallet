import React from 'react'
import { Line } from 'rc-progress'

import cssModules from 'react-css-modules'
import styles from './Info.scss'


class Info extends React.Component {
  constructor() {
    super()
    this.state = {
      progressValue: 0,
      isVisibleProgressBar: true,
    }
  }

  componentDidMount() {
    this.launchProgressBar()
  }
  hideProgressBar() {
    this.setState({ isVisibleProgressBar: false })
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
        this.hideProgressBar()
      }
      else {
        this.setState({ progressValue: progressValue + progressUnit })
      }
    }, howOftenToProgres)
  }

  render() {
    const { isOnline, serverAddress, onlineUsers } = this.props
    const { progressValue, isVisibleProgressBar } = this.state

    return (
      <div styleName="title">
        <span>
          <span styleName={isOnline ? 'connect' : 'disconnect'}>
            {isOnline ? 'Connected ' : 'Loading or not available '}
          </span>
          to IPFS signal {serverAddress} / peers online: {onlineUsers}
        </span>
        { isVisibleProgressBar && <Line strokeColor="#2181F7" percent={progressValue} strokeWidth="1" /> }
        {/* <span styleName="copyright-text">© 2018 Swap Online, Crypto-Fiat License: FVR000275. <a href="mailto:team@swap.online">team@swap.online</a></span> */}
      </div>
    )
  }
}

export default cssModules(Info, styles, { allowMultiple: true })
