import React, { Component } from 'react'
import { connect } from 'redaction'
import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'

import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import Nav from './Nav/Nav'
import User from './User/User'
import NavMobile from './NavMobile/NavMobile'
import Logo from 'components/Logo/Logo'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


let lastScrollTop = 0

@withRouter
@connect(({ menu: { items: menuItems, isDisplayingTable } }) => ({
  menuItems,
  isDisplayingTable,
}))
@CSSModules(styles, { allowMultiple: true })


export default class Header extends Component {

  constructor() {
    super()

    this.state = {
      sticky: false,
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = () =>  {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop
    if (scrollTop > lastScrollTop || scrollTop < 88) {
      this.setState(() => ({ sticky: false }))
    }
    else {
      this.setState(() => ({ sticky: true }))
    }
    lastScrollTop = scrollTop
  }

  render() {
    const { menuItems, isDisplayingTable } = this.props
    const { sticky } = this.state

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
