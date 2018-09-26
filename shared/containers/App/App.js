import React, { Fragment } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import actions from 'redux/actions'
import { connect } from 'redaction'
import moment from 'moment-with-locales-es6'
import { constants, localStorage } from 'helpers'
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
import NotificationConductor from 'components/notification/NotificationConductor/NotificationConductor'
import Seo from 'components/Seo/Seo'
import ErrorNotification from 'components/notification/ErrorNotification/ErrorNotification'
import UserTooltip from 'components/Header/User/UserTooltip/UserTooltip'


const userLanguage = (navigator.userLanguage || navigator.language || 'en-gb').split('-')[0]
moment.locale(userLanguage)

@withRouter
@connect({
  isVisible: 'loader.isVisible',
  ethAddress: 'user.ethData.address',
  btcAddress: 'user.btcData.address',
  tokenAddress: 'user.tokensData.swap.address',
})
@CSSModules(styles)
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
      fallbackUiError: '',
    }
  }

  componentWillMount() {
    localStorage.setItem(constants.localStorage.activeTabId, Date.now())

    if (localStorage.getItem(constants.localStorage.activeTabId)) {
      localStorage.setItem(constants.localStorage.activeTabId, Date.now())
    }

    this.localStorageListener = localStorage.subscribe(constants.localStorage.activeTabId, (newValue) => {
      if (newValue !== localStorage.getItem(constants.localStorage.activeTabId)) {
        this.setState({ multiTabs: true })
      }
    })

    if (!localStorage.getItem(constants.localStorage.demoMoneyReceived)) {
      actions.user.getDemoMoney()
    }
  }

  componentWillUnmount() {
    localStorage.unsubscribe(this.localStorageListener)
  }

  componentDidMount() {
    window.onerror = (error) => {
      this.setState({ error })
    }

    setTimeout(() => {
      actions.user.sign()
      createSwapApp()
      this.setState({ fetching: true })
    }, 1000)
  }

  hideErrorNotification = () => {
    this.setState({ error: '', fallbackUiError: '' })
  }

  componentDidCatch(error) {
    this.setState({ fallbackUiError: error.message })
  }

  render() {
    const { fetching, multiTabs, error, fallbackUiError } = this.state
    const { children, ethAddress, btcAddress, tokenAddress, history /* eosAddress */ } = this.props
    const isFetching = !ethAddress || !btcAddress || !tokenAddress || !fetching

    if (multiTabs) {
      return <PreventMultiTabs />
    }

    if (isFetching) {
      return <Loader showTips />
    }

    if (fallbackUiError) {
      return <ErrorNotification hideErrorNotification={this.hideErrorNotification} error={error} />
    }

    return (
      <Fragment>
        {error && <ErrorNotification hideErrorNotification={this.hideErrorNotification} error={error} />}
        <Seo location={history.location} />
        { isMobile && <UserTooltip /> }
        <Header />
        <WidthContainer styleName="main">
          <main>
            {children}
          </main>
        </WidthContainer>
        <Core />
        { !isMobile && <Footer /> }
        <RequestLoader />
        <ModalConductor />
        <NotificationConductor />
      </Fragment>
    )
  }
}
