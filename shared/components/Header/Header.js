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

let lastScrollTop = 0;

@withRouter
@connect(({ menu: { items: menu } }) => ({
  menu,
}))
@CSSModules(styles, { allowMultiple: true })


export default class Header extends Component {

  constructor() {
    super()

    this.state = {
      sticky: false
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  };

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  };

  handleScroll = () =>  {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if ( scrollTop > lastScrollTop || scrollTop < 88) {
        this.setState(() => ({sticky: false}))
      }
      else {
        this.setState(() => ({sticky: true}))
      }
      lastScrollTop = scrollTop;
  }

  render() {
    const { menu } = this.props
    const { sticky } = this.state

    if (isMobile) {
      return <NavMobile menu={menu} />
    }

    return (
      <div styleName={sticky ? 'header header-fixed': 'header'}>
        <WidthContainer styleName="container">
          <Logo withLink />
          <Nav menu={menu} />
          <Logo withLink mobile />
          <User />
        </WidthContainer>
      </div>
    )
  }
}
