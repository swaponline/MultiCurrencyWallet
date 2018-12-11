import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'

import links from 'helpers/links'
import { constants } from 'helpers'
import config from 'app-config'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Tour from 'reactour'

import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import Nav from './Nav/Nav'
import User from './User/User'
import AddOfferButton from './User/AddOfferButton/AddOfferButton'
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
      isTourOpen: false,
      isShowingMore: false,
      sticky: false,
      path: false,
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
          tour: 'reactour__exchange',
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

    this.checkPath()

    if (this.props.history.location.pathname === '/') {
      if (!localStorage.getItem(constants.localStorage.openTour)) {
        this.openTour()
      }
    }
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)

  }

  componentWillReceiveProps(nextProps) {
    this.checkPath()
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

  toggleShowMore = () => {
    this.setState(prevState => ({
      isShowingMore: !prevState.isShowingMore,
    }))
  }

  closeTour = () => {
    this.setState({ isTourOpen: false })
    localStorage.setItem(constants.localStorage.openTour, true)
  }

  openTour = () => {
    this.setState({ isTourOpen: true })
  }

  checkPath = () => {
    const { history: { location: { pathname } } } = this.props
    const { path } = this.state
    if  (pathname === '/ru' || pathname === '/') {
      this.setState({
        path: true,
      })
    } else {
      this.setState({
        path: false,
      })
    }
  }

  render() {
    const { sticky, menuItems, isTourOpen, isShowingMore, path } = this.state
    const { intl: { locale }, history: { location: { pathname } } } = this.props

    const accentColor = '#510ed8'

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
          <Logo withLink />
          <Nav menu={menuItems} />
          <Logo withLink mobile />
          <User openTour={path && this.openTour} />
          <Tour
            steps={tourSteps}
            onRequestClose={this.closeTour}
            isOpen={isTourOpen}
            maskClassName="mask"
            className="helper"
            accentColor={accentColor}
          />
        </WidthContainer>
      </div>
    )
  }
}
/* eslint-disable */
const tourSteps = [
  {
    selector: '[data-tut="reactour__address"]',
    content: <FormattedMessage
      id="Header184"
      defaultMessage="This is your personal bitcoin address. We do not store your private keys. Everything is kept in your browser. No server, no back-end, completely decentralized. " />,
  },
  {
    selector: '[data-tut="reactour__save"]',
    content: <FormattedMessage id="Header188" defaultMessage="Swap Online does NOT store your private keys, please download and keep them in a secured place" />,
  },
  {
    selector: '[data-tut="reactour__balance"]',
    content: <FormattedMessage id="Header192" defaultMessage="This is your bitcoin balance. You can close your browser, reboot your computer. Your funds will remain safe, just don't forget to save your private keys" />,
  },
  {
    selector: '[data-tut="reactour__store"]',
    content: <FormattedMessage id="Header196" defaultMessage="You can store crypto of different blockchains including Bitcoin, Ethereum, EOS, Bitcoin Cash, Litecoin and various token" />,
  },
  {
    selector: '[data-tut="reactour__exchange"]',
    content: <FormattedMessage id="Header200" defaultMessage="Our killer feature is the peer-to-peer exchange available in our wallet powered by atomic swap technology. You can perfrom swaps with any crypto listed in our wallet." />,
  },
  {
    selector: '[data-tut="reactour__subscribe"]',
    content: <FormattedMessage id="Header205" defaultMessage="Join to our white list discounts, gifts, better exchange rates, etc." />,
  },
  {
    selector: '[data-tut="reactour__goTo"]',
    content: ({ goTo }) => (
      <div>
        <strong><FormattedMessage id="Header194" defaultMessage="Do not forget to save your keys" /></strong>
        <button
          style={{
            border: '1px solid #f7f7f7',
            background: 'none',
            padding: '.3em .7em',
            fontSize: 'inherit',
            display: 'block',
            cursor: 'pointer',
            margin: '1em auto',
          }}
          onClick={() => goTo(1)}
        >
          <FormattedMessage id="Header207" defaultMessage="show how to save" />
        </button>
      </div>),
  },
]
/* eslint-disable */
