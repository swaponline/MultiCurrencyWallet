import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import links from 'helpers/links'
import { defineMessages, injectIntl } from 'react-intl'


import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import Nav from './Nav/Nav'
import User from './User/User'
import NavMobile from './NavMobile/NavMobile'

import Logo from 'components/Logo/Logo'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


let lastScrollTop = 0

const messages = defineMessages({
  wallet: {
    id: 'menu.wallet',
    description: 'Menu item "Wallet"',
    defaultMessage: 'Wallet',
  },
  exchange: {
    id: 'menu.exchange',
    description: 'Menu item "Exchange"',
    defaultMessage: 'Exchange',
  },
  history: {
    id: 'menu.history',
    description: 'Menu item "History"',
    defaultMessage: 'History',
  },
  affiliate: {
    id: 'menu.affiliate',
    description: 'Menu item "Affiliate"',
    defaultMessage: 'Affiliate',
  },
})

@injectIntl
@withRouter
@connect(({ menu: { isDisplayingTable } }) => ({
  isDisplayingTable,
}))
@CSSModules(styles, { allowMultiple: true })


export default class Header extends Component {

  static propTypes = {
    isDisplayingTable: PropTypes.bool.isRequired,
  }

  static defaulProps = {
    isDisplayingTable: false,
  }

  constructor(props) {
    super(props)
    this.state = {
      sticky: false,
      menuItems: [
        {
          title: props.intl.formatMessage(messages.wallet),
          link: links.home,
          exact: true,
          icon: 'wallet',
        },
        {
          title: props.intl.formatMessage(messages.exchange),
          link: links.exchange,
          icon: 'exchange-alt',
        },
        {
          title: props.intl.formatMessage(messages.history),
          link: links.history,
          icon: 'history',
        },
        {
          title: props.intl.formatMessage(messages.affiliate),
          link: links.affiliate,
          isMobile: false,
        },
      ],
    }
    this.lastScrollTop = 0
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = () =>  {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop
    if (scrollTop > this.lastScrollTop) {
      this.setState(() => ({ sticky: false }))
    }
    else {
      this.setState(() => ({ sticky: true }))
    }
    this.lastScrollTop = scrollTop
  }

  render() {
    const { isDisplayingTable } = this.props
    const { sticky, menuItems } = this.state

    if (isMobile) {
      return <NavMobile menu={menuItems} />
    }

    return (
      <div styleName={sticky && !isDisplayingTable ? 'header header-fixed' : 'header'}>
        <WidthContainer styleName="container">
          <Logo withLink />
          <Nav menu={menuItems} />
          <Logo withLink mobile />
          <User />
        </WidthContainer>
      </div>
    )
  }
}
