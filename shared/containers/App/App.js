import React, { Fragment } from 'react'
import { withRouter, HashRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import actions from 'redux/actions'
import { connect } from 'redaction'
import moment from 'moment-with-locales-es6'
import { constants, localStorage, firebase } from 'helpers'
import { isMobile } from 'react-device-detect'

import CSSModules from 'react-css-modules'
import styles from './App.scss'
import 'scss/app.scss'

import { createSwapApp } from 'instances/newSwap'
import Core from 'containers/Core/Core'

import Header from 'components/Header/Header'
import Footer from 'components/Footer/Footer'
import Loader from 'components/loaders/Loader/Loader'
import PreventMultiTabs from 'components/PreventMultiTabs/PreventMultiTabs'
import RequestLoader from 'components/loaders/RequestLoader/RequestLoader'
import ModalConductor from 'components/modal/ModalConductor/ModalConductor'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import Wrapper from 'components/layout/Wrapper/Wrapper'
import NotificationConductor from 'components/notification/NotificationConductor/NotificationConductor'
import Seo from 'components/Seo/Seo'

import config from 'app-config'


const memdown = require('memdown')


const userLanguage = (navigator.userLanguage || navigator.language || 'en-gb').split('-')[0]
moment.locale(userLanguage)

@withRouter
@connect(({
  currencies: { items: currencies },
}) => ({
  currencies,
  isVisible: 'loader.isVisible',
  ethAddress: 'user.ethData.address',
  btcAddress: 'user.btcData.address',
  tokenAddress: 'user.tokensData.swap.address',
}))
@CSSModules(styles, { allowMultiple: true })
export default class App extends React.Component {

  static propTypes = {
    children: PropTypes.element.isRequired,
  }

  constructor() {
    super()

    this.localStorageListener = null

    this.state = {
      fetching: false,
      multiTabs: false,
      error: '',
    }
  }

  componentWillMount() {
    const { currencies } = this.props
    const myId = Date.now().toString()
    localStorage.setItem(constants.localStorage.enter, myId)
    const enterSub = localStorage.subscribe(constants.localStorage.enter, () => {
      localStorage.setItem(constants.localStorage.reject, myId)
    })
    const rejectSub = localStorage.subscribe(constants.localStorage.reject, (id) => {
      if (id && id !== myId) {
        this.setState({ multiTabs: true })
        localStorage.unsubscribe(rejectSub)
        localStorage.unsubscribe(enterSub)
        localStorage.removeItem(constants.localStorage.reject)
      }
    })

    const isWalletCreate = localStorage.getItem(constants.localStorage.isWalletCreate)

    if(!isWalletCreate) {
      currencies.forEach(({ name }) => {
        if(name !== "BTC") {
          actions.core.markCoinAsHidden(name)
        }
      })
    }

    if (!localStorage.getItem(constants.localStorage.demoMoneyReceived)) {
      actions.user.getDemoMoney()
    }

    firebase.initialize()
  }

  componentDidMount() {
    window.actions = actions

    window.onerror = (error) => {
      // actions.analytics.errorEvent(error)
    }

    try {
      const db = indexedDB.open('test')
      db.onerror = () => {
        window.leveldown = memdown
      }
    } catch (e) {
      window.leveldown = memdown
    }

    actions.user.sign()
    createSwapApp()
    this.setState(() => ({ fetching: true }))

    window.prerenderReady = true
  }

  componentDidUpdate() {
    if (process.env.MAINNET) {
      firebase.setUserLastOnline()
    }
  }

  render() {
    const { fetching, multiTabs, error } = this.state
    const { children, ethAddress, btcAddress, tokenAddress, history /* eosAddress */ } = this.props
    const isFetching = !ethAddress || !btcAddress || (!tokenAddress && config && !config.isWidget) || !fetching

    const isWidget = history.location.pathname.includes('/exchange') && history.location.hash === '#widget'
    const isCalledFromIframe = window.location !== window.parent.location
    const isWidgetBuild = config && config.isWidget

    if (isWidgetBuild && localStorage.getItem(constants.localStorage.didWidgetsDataSend) !== 'true') {
      firebase.submitUserDataWidget('usersData')
      localStorage.setItem(constants.localStorage.didWidgetsDataSend, true)
    }

    if (multiTabs) {
      return <PreventMultiTabs />
    }

    if (isFetching) {
      return <Loader showTips />
    }

    const mainContent = (isWidget || isCalledFromIframe) && !isWidgetBuild
      ? (
        <Fragment>
          {children}
          <Core />
          <RequestLoader />
          <ModalConductor />
          <NotificationConductor history={history} />
        </Fragment>
      )
      : (
        <Fragment>
          <Seo location={history.location} />
          <Header />
          <Wrapper>
            <WidthContainer id="swapComponentWrapper" styleName={isWidgetBuild ? 'main main_widget' : 'main'}>
              <main>
                {children}
              </main>
            </WidthContainer>
          </Wrapper>
          <Core />
          <Footer />
          <RequestLoader />
          <ModalConductor />
          <NotificationConductor history={history} />
        </Fragment>
      )

    return (
      process.env.LOCAL === 'local'
        ? (<HashRouter>{mainContent}</HashRouter>)
        : mainContent
    )
  }
}
