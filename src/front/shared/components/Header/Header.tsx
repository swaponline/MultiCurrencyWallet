import { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import { connect } from 'redaction'
import actions from 'redux/actions'
import { injectIntl, FormattedMessage } from 'react-intl'

import cx from 'classnames'
import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import Nav from './Nav/Nav'
import NavMobile from './NavMobile/NavMobile'
import Logo from './Logo/Logo'
import ThemeSwitcher from './ThemeSwitcher'
import WalletConnect from './WalletConnect'
import TourPartial from './TourPartial/TourPartial'
import WalletTour from './WalletTour/WalletTour'
import { WidgetWalletTour } from './WidgetTours'

import Loader from 'components/loaders/Loader/Loader'
import Button from 'components/controls/Button/Button'
// Incoming swap requests and tooltips (revert)
import UserTooltip from 'components/Header/UserTooltip/UserTooltip'


import { getMenuItems, getMenuItemsMobile } from './config'
import { localisedUrl } from 'helpers/locale'
import {
  metamask,
  constants,
  links,
  user,
  feedback,
  wpLogoutModal,
  externalConfig as config
} from 'helpers'

import Swap from 'swap.swap'
import SwapApp from 'swap.app'

/* uncomment to debug */
//window.isUserRegisteredAndLoggedIn = true

const isWidgetBuild = config && config.isWidget

@withRouter
@connect({
  feeds: 'feeds.items',
  peer: 'pubsubRoom.peer',
  isInputActive: 'inputActive.isInputActive',
  modals: 'modals',
  hiddenCoinsList: 'core.hiddenCoinsList',
})
@CSSModules(styles, { allowMultiple: true })
class Header extends Component<any, any> {
  static getDerivedStateFromProps({
    history: {
      location: { pathname },
    },
  }) {
    if (pathname === '/' || pathname === links.wallet) {
      return { path: true }
    }
    return { path: false }
  }

  lastScrollTop: any

  constructor(props) {
    super(props)

    const {
      location: { pathname },
      intl,
    } = props
    const { exchange, home, wallet } = links
    const { isWalletCreate } = constants.localStorage

    const dynamicPath = pathname.includes(exchange) ? `${pathname}` : `${home}`
    //@ts-ignore: strictNullChecks
    let lsWalletCreated: string | boolean = localStorage.getItem(isWalletCreate)
    if (config && config.isWidget) {
      lsWalletCreated = true
    }

    const isWalletPage = pathname === wallet || pathname === `/ru${wallet}`

    this.state = {
      isPartialTourOpen: false,
      path: false,
      isTourOpen: false,
      isWallet: false,
      menuItems: getMenuItems(props),
      menuItemsMobile: getMenuItemsMobile(props, lsWalletCreated, dynamicPath),
      createdWalletLoader: isWalletPage && !lsWalletCreated,
      themeSwapAnimation: false,
    }
    this.lastScrollTop = 0
  }

  clearLocalStorage = () => {
    window.localStorage.clear()
    window.location.reload()
  }

  saveMnemonicAndClearStorage = () => {
    actions.modals.open(constants.modals.SaveWalletSelectMethod, {
      onClose: () => {
        this.clearLocalStorage()
      }
    })
  }

  componentDidMount() {
    this.handlerAsync()

    // Temporarily
    // show a request for users to clear their local storage
    const isWalletCreate = localStorage.getItem(constants.localStorage.isWalletCreate)
    const sawWarning = localStorage.getItem('sawLocalStorageWarning')
    const oldUserDidNotSee = isWalletCreate === 'true' && sawWarning !== 'true'
    const newUser = isWalletCreate !== 'true' && sawWarning !== 'true'

    if (oldUserDidNotSee && false) { // Времено отключено
      feedback.app.warning('Modal about local storage was opened')

      const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
      // user must save a mnemonic phrase if he hasn't done it
      const modalButton = mnemonic !== '-' ? (
        <Button empty onClick={this.saveMnemonicAndClearStorage}>
          <FormattedMessage id="registerSMSMPlaceHolder" defaultMessage="Secret phrase (12 words)" />
        </Button>
      ) : (
        <Button empty onClick={this.clearLocalStorage}>
          <FormattedMessage id="ClearAndReload" defaultMessage="Clear and reload" />
        </Button>
      )

      actions.notifications.show(constants.notifications.Message, {
        message: (
          <FormattedMessage
            id="CleanLocalStorage"
            defaultMessage="Oops, looks like the app needs to clean your local storage. Please save your 12 words seed phrase (if you have not saved it before), then clear local storage by clicking on the button and import 12 words seed again. Sorry for the inconvenience. {indent} {button}"
            values={{
              indent: <><br /><br /></>,
              button: modalButton,
            }}
          />
        ),
        timeout: false,
      })
    } else if (newUser) {
      // no problem with new user's storage
      localStorage.setItem('sawLocalStorageWarning', 'true')
    }
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

  tapCreateWalletButton = (customProps = {}) =>
    new Promise((resolve) => {
      const finishProps = { ...this.props, ...customProps }
      //@ts-ignore
      const { location, intl } = finishProps
      const { pathname } = location
      const { wallet, home } = links

      let isWalletCreate = localStorage.getItem(constants.localStorage.isWalletCreate)

      if (config && config.isWidget) {
        //@ts-ignore
        isWalletCreate = true
      }

      const isWalletPage = pathname === wallet || pathname === `/ru${wallet}`

      if (isWalletPage && !isWalletCreate) {
        //@ts-ignore
        isWalletCreate = true

        this.setState(
          () => ({
            menuItems: getMenuItems(this.props),
            //@ts-ignore
            menuItemsMobile: getMenuItemsMobile(this.props, isWalletCreate),
            createdWalletLoader: true,
          }),
          () => {
            setTimeout(() => {
              this.setState(() => ({
                createdWalletLoader: false,
              }))
              resolve(true)
            }, 4000)
          }
        )
      } else {
        resolve(true)
      }
    })

  startTourAndSignInModal = (customProps = {}) => {
    const finishProps = { ...this.props, ...customProps }
    const { wasOnExchange, wasOnWallet, isWalletCreate, wasOnWidgetWallet } = constants.localStorage
    const {
      //@ts-ignore
      hiddenCoinsList,
      //@ts-ignore
      location: { hash, pathname },
    } = finishProps
    const { wallet, exchange, marketmaker, marketmaker_short } = links
    const isGuestLink = !(!hash || hash.slice(1) !== 'guest')

    if (isGuestLink) {
      localStorage.setItem(wasOnWallet, 'true')
      localStorage.setItem(wasOnExchange, 'true')
      localStorage.setItem(wasOnWidgetWallet, 'true')
      return
    }

    this.setState(() => ({
      menuItems: getMenuItems(this.props),
      //@ts-ignore
      menuItemsMobile: getMenuItemsMobile(this.props, true),
    }))

    const path = pathname.toLowerCase()
    const isWalletPage = path.includes(wallet) || path === `/`
    const isPartialPage = path.includes(exchange)

    const isMarketPage = path.includes(marketmaker) || path.includes(marketmaker_short)
    const didOpenWalletCreate = localStorage.getItem(isWalletCreate)

    const wasOnWalletLs = localStorage.getItem(wasOnWallet)
    const wasOnExchangeLs = localStorage.getItem(wasOnExchange)
    const wasOnWidgetWalletLs = localStorage.getItem(wasOnWidgetWallet)

    let tourEvent = () => {}

    const allData = actions.core.getWallets({})
    const widgetCurrencies = user.getWidgetCurrencies()

    let userCurrencies = allData.filter(({ currency: baseCurrency, isToken, tokenKey, address, balance }) => {
      const currency = ((isToken) ? tokenKey : baseCurrency).toUpperCase()
      return (
        (!hiddenCoinsList.includes(currency) &&
          !hiddenCoinsList.includes(`${currency}:${address}`)) ||
        balance > 0
      )
    })

    if (isWidgetBuild) {
      userCurrencies = allData.filter(
        ({ currency: baseCurrency, isToken, tokenKey, address }) => {
          const currency = ((isToken) ? tokenKey : baseCurrency).toUpperCase()
          return !hiddenCoinsList.includes(currency) && !hiddenCoinsList.includes(`${currency}:${address}`)
        }
      )
      userCurrencies = userCurrencies.filter(({ currency: baseCurrency, isToken, tokenKey }) => {
        const currency = ((isToken) ? tokenKey : baseCurrency).toUpperCase()
        return widgetCurrencies.includes(currency)
      })
    }

    userCurrencies = user.filterUserCurrencyData(userCurrencies)

    switch (true) {
      case isWalletPage && !wasOnWalletLs:
        tourEvent = this.openWalletTour
        break
      case isPartialPage && !wasOnExchangeLs:
        tourEvent = this.openExchangeTour
        break
      case isWidgetBuild && !wasOnWidgetWalletLs:
        tourEvent = this.openWidgetWalletTour
        break
      case !metamask.isConnected() && !userCurrencies.length && isWalletPage && !config.opts.plugins.backupPlugin && !config.opts.ui.disableInternalWallet:
        this.openCreateWallet({ onClose: tourEvent })
        break
      default:
        return
    }

    if (!didOpenWalletCreate && isWalletPage && !config.opts.plugins.backupPlugin && !config.opts.ui.disableInternalWallet) {
      this.openCreateWallet({ onClose: tourEvent })
      return
    }

    tourEvent()
  }

  closeTour = () => {
    this.setState(() => ({ isTourOpen: false }))
  }

  closeWidgetTour = () => {
    this.setState(() => ({ isWidgetTourOpen: false }))
  }

  closePartialTour = () => {
    this.setState(() => ({ isPartialTourOpen: false }))
  }

  openCreateWallet = (options) => {
    const {
      history,
      intl: { locale },
    } = this.props
    history.push(localisedUrl(locale, links.createWallet))
  }

  openWalletTour = () => {
    const { wasOnWallet } = constants.localStorage

    setTimeout(() => {
      this.setState(() => ({ isTourOpen: true }))
    }, 1000)

    localStorage.setItem(wasOnWallet, 'true')
  }

  openWidgetWalletTour = () => {
    const { wasOnWidgetWallet } = constants.localStorage

    setTimeout(() => {
      this.setState(() => ({ isWidgetTourOpen: true }))
    }, 1000)

    localStorage.setItem(wasOnWidgetWallet, 'true')
  }

  openExchangeTour = () => {
    const { wasOnExchange } = constants.localStorage
    setTimeout(() => {
      this.setState(() => ({ isPartialTourOpen: true }))
    }, 1000)

    localStorage.setItem(wasOnExchange, 'true')
  }

  handleToggleTheme = () => {
    this.setState(() => ({ themeSwapAnimation: true }))

    const wasDark = localStorage.getItem(constants.localStorage.isDark)
    const dataset = document.body.dataset

    feedback.theme.switched(wasDark ? 'light' : 'dark')

    if (wasDark) {
      localStorage.removeItem(constants.localStorage.isDark)
      localStorage.setItem(constants.localStorage.isLight, 'true')
      dataset.scheme = "default"
    } else {
      localStorage.removeItem(constants.localStorage.isLight)
      localStorage.setItem(constants.localStorage.isDark, 'true')
      dataset.scheme = "dark"
    }

    this.setState(() => ({ themeSwapAnimation: false }))
  }

  declineRequest = (orderId, participantPeer) => {
    actions.core.declineRequest(orderId, participantPeer)
    actions.core.updateCore()
  }

  acceptRequest = async (orderId, participantPeer, link) => {
    const {
      toggle,
      history,
      intl: { locale },
      location: {
        pathname,
      },
    } = this.props

    actions.core.acceptRequest(orderId, participantPeer)
    actions.core.updateCore()

    if (typeof toggle === 'function') {
      toggle()
    }


    if ((pathname.substr(0, links.marketmaker.length) === links.marketmaker)
      || (pathname.substr(0, links.marketmaker_short) === links.marketmaker_short)
    ) {
      const swap = new Swap(orderId, SwapApp.shared())
      actions.core.rememberSwap(swap)
      window.active_swap = swap
    } else {
      await history.replace(localisedUrl(locale, link))
      await history.push(localisedUrl(locale, link))
    }
  }

  handleLogout = () => {
    const { intl } = this.props
    wpLogoutModal(this.handleLogout, intl)
  }

  render() {
    const {
      isTourOpen,
      isPartialTourOpen,
      menuItems,
      menuItemsMobile,
      createdWalletLoader,
      isWidgetTourOpen,
    } = this.state
    const {
      intl: { formatMessage },
      history: {
        location: { pathname },
      },
      feeds,
      peer,
      isInputActive,
    } = this.props

    const { exchange, wallet } = links

    const isWalletPage =
      pathname.includes(wallet) || pathname === `/ru${wallet}` || pathname === `/`

    const isExchange = pathname.includes(exchange)

    const isLogoutPossible = window.isUserRegisteredAndLoggedIn

    const flexebleHeaderRender = (
      <div styleName="flexebleHeader">
        <div styleName="leftArea">
          <Logo />
          {!isMobile && <Nav menu={menuItems} />}
        </div>
        <div styleName="rightArea">
          {!config.isExtension && Object.values(config.enabledEvmNetworks).length ? (
            <WalletConnect />
          ) : null}

          {window.WPSO_selected_theme !== 'only_light' && window.WPSO_selected_theme !== 'only_dark' && (
            <ThemeSwitcher onClick={this.handleToggleTheme} />
          )}

          {isLogoutPossible && ( // some wordpress plugin cases
            <div styleName="logoutWrapper" onClick={this.handleLogout}>
              <i className="fas fa-sign-out-alt" />
              <FormattedMessage id="ExitWidget" defaultMessage="Exit" />
            </div>
          )}
        </div>
      </div>
    )

    if (pathname.includes('/createWallet') && isMobile) {
      return <span />
    }

    const incomingSwapRequest = (
      <UserTooltip
        feeds={feeds}
        peer={peer}
        acceptRequest={this.acceptRequest}
        declineRequest={this.declineRequest}
      />
    )

    if (isMobile) {
      return (
        <header id="header-mobile" styleName="header-mobile" className="data-tut-widget-tourFinish">
          {flexebleHeaderRender}
          {createdWalletLoader && (
            <div styleName="loaderCreateWallet">
              <Loader
                showMyOwnTip={formatMessage({
                  id: 'createWalletLoaderTip',
                  defaultMessage: 'Creating wallet... Please wait.',
                })}
              />
            </div>
          )}
          {incomingSwapRequest}
          <NavMobile menu={menuItemsMobile} isHidden={isInputActive} />
          {isWidgetTourOpen && isWalletPage && (
            <div styleName="walletTour">
              <WidgetWalletTour isTourOpen={isWidgetTourOpen} closeTour={this.closeWidgetTour} />
            </div>
          )}
        </header>
      )
    }

    return (
      <header
        className={cx({
          [styles['header']]: true,
          [styles['widgetHeader']]: isWidgetBuild,
          [styles['header-promo']]: isWalletPage,
        })}
      >
        {createdWalletLoader && (
          <div styleName="loaderCreateWallet">
            <Loader
              showMyOwnTip={formatMessage({
                id: 'createWalletLoaderTip',
                defaultMessage: 'Creating wallet... Please wait.',
              })}
            />
          </div>
        )}
        {flexebleHeaderRender}
        {isPartialTourOpen && isExchange && (
          <div styleName="walletTour">
            <TourPartial isTourOpen={isPartialTourOpen} closeTour={this.closePartialTour} />
          </div>
        )}
        {incomingSwapRequest}
        {isTourOpen && isWalletPage && (
          <div styleName="walletTour">
            <WalletTour isTourOpen={isTourOpen} closeTour={this.closeTour} />
          </div>
        )}
        {isWidgetTourOpen && isWalletPage && (
          <div styleName="walletTour">
            <WidgetWalletTour isTourOpen={isWidgetTourOpen} closeTour={this.closeWidgetTour} />
          </div>
        )}
      </header>
    )
  }
}

export default injectIntl(Header)
