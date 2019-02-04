import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Swap.scss'


@CSSModules(styles)
class SwapController extends React.PureComponent {

  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      online: true,
    }

    this.swap.events.subscribe('check status', this.checkStatusUser)
    this.dispatchEvent('check status')
  }

  componentDidMount() {
    setInterval(() => {
      this.checkStatusUser()
    }, 5000)
  }

  componentWillUnmount() {
    this.dispatchEvent('check status')
    this.swap.events.unsubscribe('check status', this.checkStatusUser)
  }

  dispatchEvent = (event) => {
    this.swap.events.dispatch(event)
  }

  checkStatusUser = () => {
    const status = this.swap.room.getOnlineParticipant()

    this.setState(() => ({
      online: status,
    }))
  }

  render() {
    const { online } = this.state

    return (
      <div styleName="onlineIndicator">
        {
          online ? (
            <p styleName="online"> {`Online`}</p>
          ) : (
            <p styleName="offline"> {`Offline`}</p>
          )
        }
      </div>
    )
  }
}

export default SwapController
