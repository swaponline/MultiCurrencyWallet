import React, { Component } from 'react'

import SwapApp from 'swap.app'
import config from 'app-config'

import CSSModules from 'react-css-modules'
import styles from './Footer.scss'

import Info from './Info/Info'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


@CSSModules(styles)
export default class Footer extends Component {

  state = {
    userOnline: 0,
    connected: false,
    server: config.ipfs.server,
  }

  componentWillMount() {
    setTimeout(() => {
      const connected = SwapApp.services.room.connection._ipfs.isOnline()

      SwapApp.services.room.connection.on('peer joined', this.userJoin)
      this.setState({
        connected,
      })
    }, 8000)
  }

  componentWillUnmount() {
    SwapApp.services.room.connection.off('peer joined', this.userLeft)
  }

  userJoin = () => {
    this.setState(userOnline => userOnline--)
  }

  userLeft = () => {
    this.setState(userOnline => userOnline++)
  }

  render() {
    const { userOnline, connected, server } = this.state

    return (
      <div styleName="footer">
        <WidthContainer styleName="container">
          <a href="https://t.me/swaponline" target="_blank" rel="noopener noreferrer">
            Need help? Join Telegram chat @swaponline
          </a>
          <Info serverAddress={server} userOnline={userOnline} connected={connected} />
        </WidthContainer>
      </div>
    )
  }
}
