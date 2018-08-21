import React, { Component } from 'react'

import { connect } from 'redaction'
import { withRouter } from 'react-router-dom'

import cx from 'classnames'
import styles from './Footer.scss'
import logo from './images/logo.svg'
import CSSModules from 'react-css-modules'

import Info from './Info/Info'
import SocialMenu from './SocialMenu/SocialMenu'
import Links from './Links/Links'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


@withRouter
@connect(({ ipfs: { server, isOnline, onlineUsers } }) => ({
  server,
  isOnline,
  onlineUsers,
}))
@CSSModules(styles, { allowMultiple: true })
export default class Footer extends Component {
  render() {
    const { onlineUsers, isOnline, server } = this.props

    return (
      <div styleName="footer">
        <div styleName="information-footer">
          <WidthContainer styleName="container">
            <Info serverAddress={server} onlineUsers={onlineUsers} isOnline={isOnline} />
          </WidthContainer>
        </div>
        <div styleName="default-footer">
          <WidthContainer>
            <Links />
          </WidthContainer>
          <WidthContainer styleName="container--copyright">
            <div styleName="copyright">
              <img src={logo} styleName="copyright-logo" alt="logotype" />
              <span styleName="copyright-text">© 2018 Swap Online Harju maakond, Tallinn, Kesklinna linnaosa</span>
            </div>
            <SocialMenu />
          </WidthContainer>
        </div>
      </div>
    )
  }
}
