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
import { messages, getMenuItems, getMenuItemsMobile } from "./config"

let lastScrollTop = 0

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
    if (pathname === '/ru' || pathname === '/' || pathname === links.wallet) {
      return { path: true }
    }
    return { path: false }
  }

  constructor(props) {
    super(props)

    const { location: { pathname }, intl } = props
    const { exchange, home, wallet, history: historyLink } = links
    const { products, invest, history } = messages
    const { lastCheckBalance, wasCautionPassed, didWalletCreated } = constants.localStorage

    if (localStorage.getItem(lastCheckBalance) || localStorage.getItem(wasCautionPassed)) {
      localStorage.setItem(didWalletCreated, true)
    }

    const dinamicPath = pathname.includes(exchange) ? `${unlocalisedUrl(intl.locale, pathname)}` : `${home}`
    const lsWalletCreated = localStorage.getItem(didWalletCreated)
    const isWalletPage = pathname === wallet || pathname === `/ru${wallet}`

    this.state = {
      isPartialTourOpen: false,
      path: false,
      isTourOpen: false,
      isShowingMore: false,
      sticky: false,
      isWallet: false,
      menuItemsFill: [
        {
          title: intl.formatMessage(products),
          link: 'openMySesamPlease',
          exact: true,
          haveSubmenu: true,
          icon: 'products',
          currentPageFlag: true,
        },
        {
          title: intl.formatMessage(invest),
          link: 'exchange/btc-to-usdt',
          icon: 'invest',
          haveSubmenu: false,
        },
        {
          title: intl.formatMessage(history),
          link: historyLink,
          icon: 'history',
          haveSubmenu: false,
        },
      ],
      menuItems: getMenuItems(props, lsWalletCreated, dinamicPath),
      menuItemsMobile: getMenuItemsMobile(props, lsWalletCreated, dinamicPath),
      createdWalletLoader: isWalletPage && !lsWalletCreated,
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

  tapCreateWalletButton = (customProps) => new Promise((resolve) => {
    const finishProps = { ...this.props, ...customProps }

    const { location, intl } = finishProps
    const { pathname } = location
    const { wallet, home } = links

    const dinamicPath = pathname.includes(wallet)
      ? `${unlocalisedUrl(intl.locale, pathname)}`
      : `${home}`

    let didWalletCreated = localStorage.getItem(constants.localStorage.isWalletCreate)

    const isWalletPage = pathname === wallet
      || pathname === `/ru${wallet}`

    if (isWalletPage && !didWalletCreated) {
      localStorage.setItem(constants.localStorage.didWalletCreated, true)
      didWalletCreated = true

      this.setState(() => ({
        menuItems: getMenuItems(this.props, didWalletCreated, dinamicPath),
        menuItemsMobile: getMenuItemsMobile(this.props, didWalletCreated, dinamicPath),
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
    const { wasOnExchange, wasOnWallet, isWalletCreate } = constants.localStorage
    const { location: { hash, pathname } } = finishProps
    const { wallet, exchange } = links
    const isGuestLink = !(!hash || hash.slice(1) !== 'guest')

    if (isGuestLink) {
      localStorage.setItem(wasOnWallet, true)
      localStorage.setItem(wasOnExchange, true)
      return
    }


    const path = pathname.toLowerCase()
    const isWalletPage = path.includes(wallet) || path === `/` || path === '/ru'
    const isPartialPage = path.includes(exchange) || path === `/ru${exchange}`

    const didOpenWalletCreate = localStorage.getItem(isWalletCreate)

    const wasOnWalletLs = localStorage.getItem(wasOnWallet)
    const wasOnExchangeLs = localStorage.getItem(wasOnExchange)

    let tourEvent = () => { }

    switch (true) {
      case isWalletPage && !wasOnWalletLs:
        tourEvent = this.openWalletTour
        break
      case isPartialPage && !wasOnExchangeLs:
        tourEvent = this.openExchangeTour
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
    const { wasOnWallet } = constants.localStorage

    this.setState(() => ({ isTourOpen: true }))

    localStorage.setItem(wasOnWallet, true)
  }

  openExchangeTour = () => {
    const { wasOnExchange } = constants.localStorage

    this.setState(() => ({ isPartialTourOpen: true }))
    localStorage.setItem(wasOnExchange, true)

  }

  render() {
    const { sticky, isTourOpen, path, isPartialTourOpen, menuItems, menuItemsMobile, createdWalletLoader } = this.state
    const { intl: { formatMessage }, history: { location: { pathname } }, feeds, peer, isSigned, isInputActive } = this.props
    const { exchange, wallet } = links

    const accentColor = '#510ed8'

    const isWalletPage = pathname.includes(wallet)
      || pathname === `/ru${wallet}`
      || pathname === `/`

    if (config && config.isWidget) {
      return (
        <User
          acceptRequest={this.acceptRequest}
          declineRequest={this.declineRequest}
        />
      )
    }
    if (pathname.includes('/createWallet') && isMobile) {
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
      <div styleName={sticky ? 'header header-fixed' : isWalletPage ? 'header header-promo' : 'header'}>
        {
          createdWalletLoader && (
            <div styleName="loaderCreateWallet">
              <Loader showMyOwnTip={formatMessage({ id: 'createWalletLoaderTip', defaultMessage: 'Creating wallet... Please wait.' })} />
            </div>
          )
        }
        <WidthContainer styleName="container" data-tut="reactour__address">
          <LogoTooltip withLink isColored isExchange={isWalletPage} />
          <Nav menu={menuItems} />
          <Logo withLink mobile />
          {isPartialTourOpen && <TourPartial isTourOpen={isPartialTourOpen} />}
          <User
            openTour={isWalletPage ? this.openExchangeTour : this.openWalletTour}
            path={path}
            acceptRequest={this.acceptRequest}
            declineRequest={this.declineRequest}
          />
          {/* {isTourOpen &&
            <Tour
              steps={tourSteps}
              onRequestClose={this.closeTour}
              isOpen={isTourOpen}
              maskClassName="mask"
              className="helper"
              accentColor={accentColor}
            />
          } */}
        </WidthContainer>
      </div>
    )
  }
}

const tourSteps = [
  {
    selector: '[data-tut="reactour__address"]',
    content: <FormattedMessage
      id="tour-step-1"
      defaultMessage="Баланс по выбранной валюте показывается в конце строки, напротив валюты. Вы можете закрыть браузер, перезагрузить компьютер. Ваш баланс не изменится, только не забудте сохранить ключи" />,
  },
  // {
  //   selector: '[data-tut="reactour__save"]',
  //   content: <FormattedMessage id="tour-step-2" defaultMessage="Swap Online does NOT store your private keys, please download and keep them in a secured place" />,
  // },
  {
    selector: '[data-tut="reactour__store"]',
    content: <FormattedMessage id="tour-step-2" defaultMessage="Вы можете хранить валюты разных блокчейнов, таких как: Bitcoin, Ethereum, EOS, Bitcoin Cash, Litecoin и различные токены" />,
  },
  {
    selector: '[data-tut="reactour__exchange"]',
    content: <FormattedMessage id="tour-step-3" defaultMessage="Наша уникальная функция peer-to-peer обмена доступна в нашем кольке, основанном на технологии Atomic Swap. Вы можете разместить вашу криптовалюту в нашем кошельке." />,
  },
  {
    selector: '[data-tut="reactour__sign-up"]',
    content: <FormattedMessage
      id="tour-step-4"
      defaultMessage="Вы будете получать уведомления об обновлениях с вашей учетной записью (заказы, транзакции) и ежемесячные обновления о нашем проекте" />,
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
