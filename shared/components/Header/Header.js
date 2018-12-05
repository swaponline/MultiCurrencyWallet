import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import links from 'helpers/links'
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

  toggleShowMore = () => {
    this.setState(prevState => ({
      isShowingMore: !prevState.isShowingMore,
    }))
  }

  closeTour = () => {
    this.setState({ isTourOpen: false })
  }

  openTour = () => {
    this.setState({ isTourOpen: true })
  }

  render() {
    const { sticky, menuItems, isTourOpen, isShowingMore } = this.state
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
          <User openTour={this.openTour} />
          <Tour
            onRequestClose={this.closeTour}
            steps={tourConfig}
            isOpen={isTourOpen}
            maskClassName="mask"
            className="helper"
            rounded={5}
            accentColor={accentColor}
          />
        </WidthContainer>
      </div>
    )
  }
}

const tourConfig = [
  {
    selector: '[data-tut="reactour__address"]',
    content: `This is your personal bitcoin address.
      We do not store your private keys. Everything is being kept in your browser.
      No server, no back-end, completely decentralized. `,
  },
  {
    selector: '[data-tut="reactour__save"]',
    content: `We dont store your keys, please save it in the safe place`,
  },
  {
    selector: '[data-tut="reactour__balance"]',
    content: `This is your bitcoin balance. You can close your browser, reboot your computer, but your funds will be safe`,
  },
  {
    selector: '[data-tut="reactour__store"]',
    content: `You can store crypto of different blockcahins including Bitcoin, Ethereum, EOS, Bitcoin Cash, Litecoin and various tokens`,
  },
  {
    selector: '[data-tut="reactour__exchange"]',
    content: `Our killer feature is peer-to-peer exchange available in our wallet. You can perfrom Atomic Swaps with any crypto listed in our wallet. Click here!`,
  },
  {
    selector: '[data-tut="reactour__subscribe"]',
    content: `Join to our white list discounts, gifts, better exchange rates, etc.`,
  },
  {
    selector: '[data-tut="reactour__goTo"]',
    content: ({ goTo }) => (
      <div>
        <strong><FormattedMessage id="Header194" defaultMessage="Do not foget to save your keys" /></strong>
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
