/* eslint-disable max-len */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import { connect } from 'redaction'

import links from 'helpers/links'
import actions from 'redux/actions'
import { constants, firebase } from 'helpers'
import config from 'app-config'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Tour from 'reactour'

import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import Nav from './Nav/Nav'
import User from './User/User'
import SignUpButton from './User/SignUpButton/SignUpButton'
import NavMobile from './NavMobile/NavMobile'

import LogoTooltip from 'components/Logo/LogoTooltip'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import TourPartial from './TourPartial/TourPartial'

import Logo from 'components/Logo/Logo'
import Loader from 'components/loaders/Loader/Loader'
import { relocalisedUrl } from 'helpers/locale'
import { localisedUrl, unlocalisedUrl } from '../../helpers/locale'
import UserTooltip from 'components/Header/User/UserTooltip/UserTooltip'


let lastScrollTop = 0

const messages = defineMessages({
  products: {
    id: 'menu.products',
    description: 'Menu item "Wallet"',
    defaultMessage: 'Our products',
  },
  wallet: {
    id: 'menu.wallet',
    description: 'Menu item "Wallet"',
    defaultMessage: 'Wallet',
  },
  createWallet: {
    id: 'menu.CreateWallet',
    description: 'Menu item "Wallet"',
    defaultMessage: 'Create wallet',
  },
  exchange: {
    id: 'menu.exchange',
    description: 'Menu item "Exchange"',
    defaultMessage: 'Exchange',
  },
  history: {
    id: 'menu.history',
    description: 'Menu item "History"',
    defaultMessage: 'My history',
  },
  IEO: {
    id: 'menu.IEO',
    description: 'Menu item "IEO"',
    defaultMessage: 'Earn',
  },
  invest: {
    id: 'menu.invest',
    description: 'Menu item "My History"',
    defaultMessage: 'How to invest?',
  },
  investMobile: {
    id: 'menu.invest',
    description: 'Menu item "My History"',
    defaultMessage: 'Invest',
  },
})

@injectIntl
@withRouter
@connect({
  feeds: 'feeds.items',
  peer: 'ipfs.peer',
  isSigned: 'signUp.isSigned',
  isInputActive: 'inputActive.isInputActive',
  reputation: 'ipfs.reputation',
})
@CSSModules(styles, { allowMultiple: true })
export default class Header extends Component {

  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  static getDerivedStateFromProps({ history: { location: { pathname } } }) {
    if (pathname === '/ru' || pathname === '/' || pathname === links.currencyWallet) {
      return { path: true }
    }
    return { path: false }
  }

  constructor(props) {
    super(props)

    const { lastCheckBalance, wasCautionPassed, didWalletCreated: didCreated } = constants.localStorage
    const { location: { pathname }, intl: { locale, formatMessage } } = props
    const { exchange, currencyWallet, home } = links

    if (localStorage.getItem(lastCheckBalance) || localStorage.getItem(wasCautionPassed)) {
      localStorage.setItem(didCreated, true)
    }

    const dinamicPath = pathname.includes(exchange) ? `${unlocalisedUrl(locale, pathname)}` : `${home}`

    const didWalletCreated = localStorage.getItem(didCreated)

    const isWalletPage = pathname === currencyWallet || pathname === `/ru${currencyWallet}`

    this.state = {
      isPartialTourOpen: false,
      path: false,
      isTourOpen: false,
      isShowingMore: false,
      sticky: false,
      isWallet: false,
      menuItemsFill: [
        {
          title: formatMessage(messages.products),
          link: 'openMySesamPlease',
          exact: true,
          haveSubmenu: true,
          icon: 'products',
          currentPageFlag: true,
        },
        {
          title: props.intl.formatMessage(messages.invest),
          link: 'exchange/btc-to-swap',
          icon: 'invest',
          haveSubmenu: false,
        },
        {
          title: props.intl.formatMessage(messages.history),
          link: links.history,
          icon: 'history',
          haveSubmenu: false,
        },
      ],
      menuItems: this.getMenuItems(props, didWalletCreated, dinamicPath),
      menuItemsMobile: this.getMenuItemsMobile(props, didWalletCreated, dinamicPath),
      createdWalletLoader: isWalletPage && !didWalletCreated,
    }
    this.lastScrollTop = 0
  }

  componentDidMount() {
    this.handlerAsync()
  }

  handlerAsync = async () => {
    const { history } = this.props

    await this.tapCreateWalletButton()

    this.startTourAndSignInModal()

    history.listen(async (location) => {
      await this.tapCreateWalletButton({ location })

      this.startTourAndSignInModal({ location })
    })
  }

  getMenuItems = (props, didWalletCreated, dinamicPath) =>
    (Number.isInteger(this.props.reputation) && this.props.reputation !== 0)
      || this.props.isSigned
      || window.localStorage.getItem('isWalletCreate') === 'true'
      ? ([
        {
          title: props.intl.formatMessage(didWalletCreated ? messages.wallet : messages.createWallet),
          link: links.currencyWallet,
          exact: true,
          haveSubmenu: true,
          icon: 'products',
          currentPageFlag: true,
        },
        {
          title: props.intl.formatMessage(messages.exchange),
          link: dinamicPath,
          exact: true,
          haveSubmenu: true,
          icon: 'products',
          currentPageFlag: true,
        },
        // {
        //   title: props.intl.formatMessage(messages.history),
        //   link: links.history,
        //   icon: 'history',
        //   haveSubmenu: false,
        //   displayNone: !didWalletCreated,
        // },
        // {
        //   title: props.intl.formatMessage(messages.IEO),
        //   link: links.ieo,
        //   icon: 'IEO',
        //   haveSubmenu: false,
        // },
      ])
      : ([
        {
          title: props.intl.formatMessage(didWalletCreated ? messages.wallet : messages.createWallet),
          link: links.currencyWallet,
          exact: true,
          haveSubmenu: true,
          icon: 'products',
          currentPageFlag: true,
        },
        {
          title: props.intl.formatMessage(messages.exchange),
          link: dinamicPath,
          exact: true,
          haveSubmenu: true,
          icon: 'products',
          currentPageFlag: true,
        },
        // {
        //   title: props.intl.formatMessage(messages.history),
        //   link: links.history,
        //   icon: 'history',
        //   haveSubmenu: false,
        //   displayNone: !didWalletCreated,
        // },
      ])

  getMenuItemsMobile = (props, didWalletCreated, dinamicPath) => ([
    {
      title: props.intl.formatMessage(didWalletCreated ? messages.wallet : messages.createWallet),
      link: links.currencyWallet,
      exact: true,
      haveSubmenu: true,
      icon: 'products',
    },
    {
      title: props.intl.formatMessage(messages.exchange),
      link: dinamicPath,
      exact: true,
      haveSubmenu: true,
      icon: 'products',
    },
    // {
    //   title: props.intl.formatMessage(messages.history),
    //   link: links.history,
    //   icon: 'history',
    //   haveSubmenu: false,
    //   displayNone: !didWalletCreated,
    // },
  ])

  tapCreateWalletButton = (customProps) => new Promise((resolve) => {
    const finishProps = { ...this.props, ...customProps }

    const { location, intl } = finishProps

    const dinamicPath = location.pathname.includes(links.exchange)
      ? `${unlocalisedUrl(intl.locale, location.pathname)}`
      : `${links.home}`

    let didWalletCreated = localStorage.getItem(constants.localStorage.isWalletCreate)

    const isWalletPage = location.pathname === links.currencyWallet
      || location.pathname === `/ru${links.currencyWallet}`

    if (isWalletPage && !didWalletCreated) {
      localStorage.setItem(constants.localStorage.didWalletCreated, true)
      didWalletCreated = true

      this.setState(() => ({
        menuItems: this.getMenuItems(this.props, didWalletCreated, dinamicPath),
        menuItemsMobile: this.getMenuItemsMobile(this.props, didWalletCreated, dinamicPath),
        createdWalletLoader: true,
      }), () => {
        setTimeout(() => {
          this.setState(() => ({ createdWalletLoader: false }))

          resolve()
        }, 4000)
      })
    } else {
      resolve()
    }
  })

  startTourAndSignInModal = (customProps) => {
    const finishProps = { ...this.props, ...customProps }

    const { location, intl } = finishProps

    const isGuestLink = !(!location.hash
      || location.hash.slice(1) !== 'guest')

    if (isGuestLink) {
      localStorage.setItem(constants.localStorage.wasOnWallet, true)
      localStorage.setItem(constants.localStorage.wasOnExchange, true)

      return
    }

    const isWalletPage = location.pathname === links.currencyWallet
      || location.pathname === `/ru${links.currencyWallet}`

    const isPartialPage = location.pathname.includes(links.exchange)
      || location.pathname === '/'
      || location.pathname === '/ru'

    const didOpenWalletCreate = localStorage.getItem(constants.localStorage.isWalletCreate)

    const wasOnWallet = localStorage.getItem(constants.localStorage.wasOnWallet)
    const wasOnExchange = localStorage.getItem(constants.localStorage.wasOnExchange)

    let tourEvent = () => { }

    switch (true) {
      case isWalletPage && !wasOnWallet:
        tourEvent = this.openWalletTour
        localStorage.setItem(constants.localStorage.wasOnWallet, true)
        break
      case isPartialPage && !wasOnExchange:
        tourEvent = this.openExchangeTour
        localStorage.setItem(constants.localStorage.wasOnExchange, true)
        break
      default: return
    }

    if (!didOpenWalletCreate && isWalletPage) {
      this.openCreateWallet({ onClose: tourEvent })
      return
    }

    tourEvent()
  }

  declineRequest = (orderId, participantPeer) => {
    actions.core.declineRequest(orderId, participantPeer)
    actions.core.updateCore()
  }

  acceptRequest = async (orderId, participantPeer, link) => {
    const { toggle, history, intl: { locale } } = this.props

    actions.core.acceptRequest(orderId, participantPeer)
    actions.core.updateCore()

    if (typeof toggle === 'function') {
      toggle()
    }

    await history.replace(localisedUrl(locale, link))
    await history.push(localisedUrl(locale, link))
  }

  handleScroll = () => {
    if (this.props.history.location.pathname === '/') {
      this.setState(() => ({
        sticky: false,
      }))
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
    this.setState(() => ({ isTourOpen: false }))
  }

  openCreateWallet = (options) => {
    const { history, intl: { locale } } = this.props
    localStorage.setItem(constants.localStorage.isWalletCreate, true)
    history.push(localisedUrl(locale, `createWallet`))
  }

  openWalletTour = () => {
    this.setState(() => ({ isTourOpen: true }))
  }

  openExchangeTour = () => {
    this.setState(() => ({ isPartialTourOpen: true }))
  }

  render() {
    const { sticky, menuItemsFill, isTourOpen, isShowingMore, path, isPartialTourOpen, isWallet, menuItems, menuItemsMobile, createdWalletLoader } = this.state
    const { intl: { locale, formatMessage }, history, pathname, feeds, peer, isSigned, isInputActive } = this.props

    const accentColor = '#510ed8'

    const isExchange = history.location.pathname.includes('/exchange')
      || history.location.pathname === '/'
      || history.location.pathname === '/ru'

    if (config && config.isWidget) {
      return (
        <User
          acceptRequest={this.acceptRequest}
          declineRequest={this.declineRequest}
        />
      )
    }
    if (history.location.pathname.includes('/createWallet') && isMobile) {
      return <span />
    }
    if (isMobile) {
      return (
        <div styleName={isInputActive ? 'header-mobile header-mobile__hidden' : 'header-mobile'}>
          {
            createdWalletLoader && (
              <div styleName="loaderCreateWallet">
                <Loader showMyOwnTip={formatMessage({ id: 'createWalletLoaderTip', defaultMessage: 'Creating wallet... Please wait.' })} />
              </div>
            )
          }
          <UserTooltip
            feeds={feeds}
            peer={peer}
            acceptRequest={this.acceptRequest}
            declineRequest={this.declineRequest}
          />
          <NavMobile menu={menuItemsMobile} />
          {!isSigned && (<SignUpButton mobile />)}
        </div>
      )
    }

    return (
      <div styleName={sticky ? 'header header-fixed' : isExchange ? 'header header-promo' : 'header'}>
        {
          createdWalletLoader && (
            <div styleName="loaderCreateWallet">
              <Loader showMyOwnTip={formatMessage({ id: 'createWalletLoaderTip', defaultMessage: 'Creating wallet... Please wait.' })} />
            </div>
          )
        }
        <WidthContainer styleName="container">
          <LogoTooltip withLink isColored isExchange={isExchange} />
          <Nav menu={menuItems} />
          <Logo withLink mobile />
          {isPartialTourOpen && <TourPartial isTourOpen={isPartialTourOpen} />}
          <User
            openTour={isExchange ? this.openExchangeTour : this.openWalletTour}
            path={path}
            acceptRequest={this.acceptRequest}
            declineRequest={this.declineRequest}
          />
          {isTourOpen &&
            <Tour
              steps={tourSteps}
              onRequestClose={this.closeTour}
              isOpen={isTourOpen}
              maskClassName="mask"
              className="helper"
              accentColor={accentColor}
            />
          }
        </WidthContainer>
      </div>
    )
  }
}

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
    selector: '[data-tut="reactour__sign-up"]',
    content: <FormattedMessage
      id="Header205"
      defaultMessage="You will receive notifications regarding updates with your account (orders, transactions) and monthly updates about our project" />,
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
