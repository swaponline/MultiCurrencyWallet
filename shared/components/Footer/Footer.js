import React, { Component } from 'react'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './Footer.scss'

import Info from './Info/Info'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


@connect(({ ipfs: { server, isOnline, onlineUsers } }) => ({
  server,
  isOnline,
  onlineUsers,
}))
@CSSModules(styles)
export default class Footer extends Component {

  render() {
    const { onlineUsers, isOnline, server } = this.props

    return (
      <div styleName="footer">
        <WidthContainer styleName="container">
          <Info serverAddress={server} onlineUsers={onlineUsers} isOnline={isOnline} />
          <span styleName="text" >Need help? Join Telegram chat <a href="https://t.me/swaponline" target="_blank" rel="noreferrer noopener">@swaponline</a></span>
        </WidthContainer>
      </div>
    )
  }
}
