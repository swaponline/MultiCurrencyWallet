import React, { Fragment } from 'react'


class SwapController extends React.PureComponent {

  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      online: true,
    }

    this.swap.events.subscribe('participant offline', this.checkStatusUser)
  }

  componentDidMount() {
    this.timer()
  }

  componentWillUnmount() {
    this.swap.events.dispatch('participant offline')
    this.swap.events.unsubscribe('participant offline', this.checkStatusUser)
  }

  timer() {
    setTimeout(() => {
      this.checkStatusUser()
    }, 5000)
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
      <Fragment>
        {
          online ? (
            <p> {`online`}</p>
          ) : (
            <p> {`Offline`}</p>
          )
        }
      </Fragment>
    )
  }
}

export default SwapController
