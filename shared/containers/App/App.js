import React, { Fragment } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import actions from 'redux/actions'
import { connect } from 'redaction'
import moment from 'moment-with-locales-es6'
import { constants, localStorage } from 'helpers'

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


const userLanguage = (navigator.userLanguage || navigator.language || 'en-gb').split('-')[0]
moment.locale(userLanguage)

@withRouter
@connect({
  ethAddress: 'user.ethData.address',
  btcAddress: 'user.btcData.address',
  // nimAddress: 'user.nimData.address',
  tokenAddress: 'user.tokensData.noxon.address',
  // eosAddress: 'user.eosData.address',
  isVisible: 'loader.isVisible',
  tabId: 'site.tabId'
})
@CSSModules(styles)
export default class App extends React.Component {

  static propTypes = {
    children: PropTypes.element.isRequired,
  }

  localStorageListener;

  state = {
    fetching: false,
    core: false,
    multiTabs: false
  }

  componentWillMount() {
    if(!this.props.tabId) {
      localStorage.setItem(constants.localStorage.activeTabId, actions.site.generateTabId());
    }
    this.localStorageListener = localStorage.subscribe(constants.localStorage.activeTabId, (newValue, oldValue)=> {
        if(newValue != this.props.tabId) {
          this.setState({multiTabs: true});
        }
    });

    if (!localStorage.getItem(constants.localStorage.demoMoneyReceived)) {
      actions.user.getDemoMoney()
    }
  }
  componentWillUnmount() {
    localStorage.unsubscribe(this.localStorageListener);
  }

  componentDidMount() {
    setTimeout(() => {
      actions.user.sign()
      createSwapApp()
      this.setState({
        fetching: true,
      })
    }, 1000)
  }

  addCore = () => {
    createSwapApp()
    this.setState({ core: !this.state.core })
  }

  render() {
    const { fetching, multiTabs } = this.state
    const { children, ethAddress, btcAddress, tokenAddress, history /* eosAddress */ } = this.props
    const isFetching = !ethAddress || !btcAddress || !tokenAddress || !fetching

    const reloaded = window.performance.navigation.type === PerformanceNavigation.TYPE_RELOAD;

    return (
      <Fragment>
      {
        multiTabs && <PreventMultiTabs />
      }
      {
        isFetching && !multiTabs && <Loader />
      }
      {
        !isFetching && !multiTabs && <Fragment>
          <Header history={history} />
          <WidthContainer styleName="main">
            {children}
          </WidthContainer>
          <Core />
          <Footer />
          <RequestLoader />
          <ModalConductor />
          <NotificationConductor />
        </Fragment>
      }
      </Fragment>
    )
  }
}
