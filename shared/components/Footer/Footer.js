import React, { Component } from 'react'
import { connect } from 'redaction'

import actions from 'redux/actions'
import SwapApp from 'swap.app'
import config from 'app-config'

import CSSModules from 'react-css-modules'
import styles from './Footer.scss'

import Info from './Info/Info'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'

@connect({
  ipfs: 'ipfs',
})
@CSSModules(styles)
export default class Footer extends Component {
  componentWillMount() {
    setTimeout(() => {
      const isOnline = SwapApp.services.room.connection._ipfs.isOnline()
      SwapApp.services.room.connection.on('peer joined', actions.ipfs.userJoined)
      setTimeout(() => {
        actions.ipfs.set({
          isOnline,
          server: config.ipfs.server
        })
      }, 1000)
    }, 8000)
  }

  componentWillUnmount() {
    SwapApp.services.room.connection.off('peer joined', actions.ipfs.userLeft)
  }

  render() {
    const { ipfs: { onlineUsers, isOnline, server } } = this.props

    return (
      <div styleName="footer">
        <WidthContainer styleName="container">
          <span style={{ fontSize: '14px' }} >Need help? Join Telegram chat <a href="https://t.me/swaponline" target="_blank" rel="noreferrer noopener">@swaponline</a></span>
          <Info serverAddress={server} onlineUsers={onlineUsers} isOnline={isOnline} />
        </WidthContainer>
      </div>
    )
  }
}
