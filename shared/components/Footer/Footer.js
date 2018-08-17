import React, { Component } from 'react'
import cx from 'classnames'
import { connect } from 'redaction'
import { withRouter } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './Footer.scss'

import Info from './Info/Info'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import SocialMenu from './SocialMenu/SocialMenu'

import logo from './images/logo.svg'

@withRouter
@connect(({ ipfs: { server, isOnline, onlineUsers } }) => ({
  server,
  isOnline,
  onlineUsers,
}))
@CSSModules(styles, { allowMultiple: true })
export default class Footer extends Component {
  state = { fixed: false, fullFixed: false }

  __footerFullHeight = 0

  calculateFooterHeight = () => {
    const pageHeight = document.body.scrollHeight
    const viewportHeight = document.documentElement.clientHeight
    const scrolledHeight = document.documentElement.scrollTop

    const pageWithoutFooter = pageHeight - (this.__footerFullHeight - this.infoFooterRef.clientHeight)

    const viewportBiggerThanPage = viewportHeight > pageHeight

    if (viewportBiggerThanPage) {
      return this.setFullFixed(true)
    }
    this.setFullFixed(false)


    if (pageWithoutFooter <= viewportHeight + scrolledHeight) {
      this.setFixed(false)
    } else {
      this.setFixed(true)
    }
  }

  setFullFixed = (value) => {
    if (this.state.fullFixed !== value) {
      this.setState({ fullFixed: value })
    }
  }

  setFixed = (value) => {
    if (this.state.fixed !== value) {
      this.setState({ fixed: value })
    }
  }

  componentDidMount() {
    document.addEventListener('scroll', this.calculateFooterHeight)
    window.addEventListener('resize', this.calculateFooterHeight)
    this.__footerFullHeight = this.footerRef.clientHeight
    this.calculateFooterHeight()
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.calculateFooterHeight)
    window.removeEventListener('resize', this.calculateFooterHeight)
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.calculateFooterHeight()
    }
  }

  render() {
    const { onlineUsers, isOnline, server } = this.props
    const { fixed, fullFixed } = this.state

    const informationFooterStyles = cx('information-footer', {
      'fixed': fixed && !fullFixed,
    })

    const defaultFooterStyles = cx('default-footer', {
      'margin': fixed && !fullFixed,
    })

    const footerStyles = cx('footer', {
      'fixed': fullFixed,
    })

    return (
      <div ref={(node) => this.footerRef = node} styleName={footerStyles}>
        <div ref={(node) => this.infoFooterRef = node} styleName={informationFooterStyles}>
          <WidthContainer styleName="container">
            <Info serverAddress={server} onlineUsers={onlineUsers} isOnline={isOnline} />
            <span styleName="text">
              Need help? Join Telegram chat <a href="https://t.me/swaponline" target="_blank" rel="noreferrer noopener">@swaponline</a>
            </span>
          </WidthContainer>
        </div>
        <div styleName={defaultFooterStyles}>
          <WidthContainer styleName="container">
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
