import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import links from 'helpers/links'
import { defineMessages, injectIntl } from 'react-intl'
import SwitchLang from 'shared/components/SwitchLang/SwitchLang'


import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import Nav from './Nav/Nav'
import User from './User/User'
import AddOfferButton from './User/AddOfferButton/AddOfferButton'
import NavMobile from './NavMobile/NavMobile'

import LogoTooltip from 'components/Logo/LogoTooltip'
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
  aboutus: {
    id: 'menu.aboutus',
    description: 'Menu item "About Us"',
    defaultMessage: 'About Us',
  },
})


@injectIntl
@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class Header extends Component {

  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      lang: true,
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
          title: props.intl.formatMessage(messages.aboutus),
          link: links.aboutus,
          isMobile: false,
        },
      ],
    }
    this.lastScrollTop = 0
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
    this.checkLang()
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = () =>  {
    if (this.props.history.location.pathname === '/') {
      this.setState(() => ({ sticky: false }))
      return
    }
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop
    if (scrollTop > this.lastScrollTop) {
      this.setState(() => ({ sticky: false }))
    }
    else {
      this.setState(() => ({ sticky: true }))
    }
    this.lastScrollTop = scrollTop
  }

checkLang = () => {
  const { intl: { locale, defaultLocale } } = this.props
  if (locale === 'ru') {
    this.setState({
      lang: false,
    })
  }
  else {
    this.setState({
      lang: true,
    })
  }
}

  render() {
  const { sticky, menuItems, lang } = this.state
  const { intl: { locale }, pathname } = this.props

    if (isMobile) {
      return (
        <div>
          <NavMobile menu={menuItems} />
          <AddOfferButton mobile />
        </div>
      )
    }

    return (
      <div styleName={sticky ? 'header header-fixed' : 'header'}>
        <WidthContainer styleName="container">
          <LogoTooltip withLink />
          <Nav menu={menuItems} />
          <SwitchLang styleName="buttonLan" onClick={this.checkLang} href={lang ? '/ru' : '/en'} >
            {lang ? 'RU' : 'EN'}
          </SwitchLang>
          <User />
        </WidthContainer>
      </div>
    )
  }
}
