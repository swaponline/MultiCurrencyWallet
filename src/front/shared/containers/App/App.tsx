import './wdyr'
import React from "react";
import { RouteComponentProps, withRouter, HashRouter } from "react-router-dom";
import DocumentMeta from 'react-document-meta'
import actions from "redux/actions";
import { connect } from "redaction";
import moment from "moment-with-locales-es6";
import {
  constants,
  localStorage,
  seo,
} from "helpers";

import CSSModules from "react-css-modules";
import styles from "./App.scss";
import "scss/app.scss";

import { createSwapApp } from "instances/newSwap";
import Core from "containers/Core/Core";
import Transactions from 'containers/Transactions'
import ErrorBoundary from 'components/ErrorBoundary'
import Header from "components/Header/Header";
import Footer from "components/Footer/Footer";
import Loader from "components/loaders/Loader/Loader";
import PreventMultiTabs from "components/PreventMultiTabs/PreventMultiTabs";
import RequestLoader from "components/loaders/RequestLoader/RequestLoader";
import ModalConductor from "components/modal/ModalConductor/ModalConductor";
import WidthContainer from "components/layout/WidthContainer/WidthContainer";
import NotificationConductor from "components/notification/NotificationConductor/NotificationConductor";
import Seo from "components/Seo/Seo";

import config from "helpers/externalConfig"
import { routing, links, utils } from 'helpers'
import backupUserData from 'plugins/backupUserData'
import { FormattedMessage, injectIntl } from 'react-intl'
import metamask from 'helpers/metamask'


const userLanguage = utils.getCookie('mylang') || "en"
moment.locale(userLanguage)

@withRouter
@connect(({ currencies: { items: currencies }, modals, ui: { dashboardModalsAllowed } }) => ({
  currencies,
  ethAddress: "user.ethData.address",
  btcAddress: "user.btcData.address",
  ghostAddress: "user.ghostData.address",
  nextAddress: "user.nextData.address",
  tokenAddress: "user.tokensData.swap.address",
  modals,
  dashboardModalsAllowed,
}))
@CSSModules(styles, { allowMultiple: true })
class App extends React.Component<RouteComponentProps<any>, any> {

  prvMultiTab: any

  constructor(props) {
    super(props);

    this.prvMultiTab = {
      reject: null,
      enter: null,
      switch: null
    };

    this.state = {
      initialFetching: true,
      completeCreation: false,
      multiTabs: false,
      error: "",
    }
  }


  generadeId(callback) {
    const newId = Date.now().toString();

    this.setState(
      {
        appID: newId
      },
      () => {
        callback(newId);
      }
    );
  }

  preventMultiTabs(isSwitch) {
    this.generadeId(newId => {
      if (isSwitch) {
        localStorage.setItem(constants.localStorage.switch, newId);
      }

      const onRejectHandle = () => {
        const { appID } = this.state;
        const id = localStorage.getItem(constants.localStorage.reject);

        if (id && id !== appID) {
          this.setState({ multiTabs: true });

          localStorage.unsubscribe(this.prvMultiTab.reject);
          localStorage.unsubscribe(this.prvMultiTab.enter);
          localStorage.unsubscribe(this.prvMultiTab.switch);
          localStorage.removeItem(constants.localStorage.reject);
        }
      };

      const onEnterHandle = () => {
        const { appID } = this.state;
        const id = localStorage.getItem(constants.localStorage.enter);
        const switchId = localStorage.getItem(constants.localStorage.switch);

        if (switchId && switchId === id) return;

        localStorage.setItem(constants.localStorage.reject, appID);
      };

      const onSwitchHangle = () => {
        const switchId = localStorage.getItem(constants.localStorage.switch);
        const { appID } = this.state;

        if (appID !== switchId) {
          if (window?.chrome?.extension) {
            const extViews = window.chrome.extension.getViews()
            const extBgWindow = window.chrome.extension.getBackgroundPage()
            if (extBgWindow !== window && extViews.length > 2) {
              window.close()
              return
            }
          }
          this.setState({
            multiTabs: true
          });

          localStorage.unsubscribe(this.prvMultiTab.reject);
          localStorage.unsubscribe(this.prvMultiTab.enter);
          localStorage.unsubscribe(this.prvMultiTab.switch);
        }
      };

      this.prvMultiTab.reject = localStorage.subscribe(constants.localStorage.reject, onRejectHandle);
      this.prvMultiTab.enter = localStorage.subscribe(constants.localStorage.enter, onEnterHandle);
      this.prvMultiTab.switch = localStorage.subscribe(constants.localStorage.switch, onSwitchHangle);

      localStorage.setItem(constants.localStorage.enter, newId);
    });
  }

  popupIncorrectNetwork() {
    actions.modals.open(constants.modals.AlertModal, {
      title: (
        <FormattedMessage 
          id="MetamaskNetworkAlert_Title"
          defaultMessage="Warning"
        />
      ),
      message: (
        <FormattedMessage
          id="MetamaskNetworkAlert_Message"
          defaultMessage='Wrong network, please switch to another network in {walletTitle} (or disconnect wallet).'
          values={{
            walletTitle: metamask.web3connect.getProviderTitle(),
          }}
        />
      ),
      labelOk: (
        <FormattedMessage
          id="MetamaskNetworkAlert_OkDisconnectWallet"
          defaultMessage="Disconnect external wallet"
        />
      ),
      dontClose: true,
      okButtonAutoWidth: true,
      callbackOk: () => {
        metamask.disconnect()
        actions.modals.close(constants.modals.AlertModal)
      },
    })
  }

  async processMetamask () {
    await metamask.web3connect.onInit(() => {
      const _checkChain = () => {
        const wrongNetwork = metamask.isConnected() && !metamask.isCorrectNetwork()

        if (wrongNetwork) {
          this.popupIncorrectNetwork()
        } else {
          actions.modals.close(constants.modals.AlertModal)
        }
      }

      metamask.web3connect.on('chainChanged', _checkChain)
      metamask.web3connect.on('connected', _checkChain)

      if (metamask.isConnected() && !metamask.isCorrectNetwork()) {
        this.popupIncorrectNetwork()
      }
    })
  }

  processUserBackup () {
    new Promise(async (resolve) => {
      const wpLoader = document.getElementById('wrapper_element')

      const hasServerBackup = await backupUserData.hasServerBackup()
      console.log('has server backup', hasServerBackup)
      if (backupUserData.isUserLoggedIn()
        && backupUserData.isUserChanged()
        && hasServerBackup
      ) {
        console.log('do restore user')
        backupUserData.restoreUser().then((isRestored) => {
          console.log('is restored', isRestored, constants.localStorage.isWalletCreate)
          if (isRestored) {
            if (localStorage.getItem(constants.localStorage.isWalletCreate)) {
              routing.redirectTo(links.home)
              window.location.reload()
            } else {
              routing.redirectTo(window.location.host === 'bsc.swap.io' ? links.exchange : links.createWallet)
              if (wpLoader) wpLoader.style.display = 'none'
            }
          }
        })
      } else {
        if (backupUserData.isUserLoggedIn()
          && backupUserData.isFirstBackup()
          || !hasServerBackup
        ) {
          console.log('Do backup user')
          backupUserData.backupUser().then(() => {
            if (wpLoader) wpLoader.style.display = 'none'
          })

          if (window.location.host === 'bsc.swap.io') {
            routing.redirectTo('#/exchange/btc-to-btcb')
          }
        } else {
          if (wpLoader) wpLoader.style.display = 'none'
        }
      }
      resolve(`ready`)
    })
  }

  async componentDidMount() {

    const shouldUpdatePageAfterMigration = localStorage.getItem('shouldUpdatePageAfterMigration')

    if (shouldUpdatePageAfterMigration) {
      localStorage.setItem('shouldUpdatePageAfterMigration', false)
      window.location.reload()
    }

    //@ts-ignore
    const { currencies } = this.props

    if (config.opts.preventMultiTab) this.preventMultiTabs(false)

    const isWalletCreate = localStorage.getItem(constants.localStorage.isWalletCreate)

    if (!isWalletCreate) {
      currencies.forEach(({ name, standard, value }) => {
        if (name !== "BTC") {
          actions.core.markCoinAsHidden(standard ? value.toUpperCase() : name)
        }
      })
    }

    this.processUserBackup()
    await this.processMetamask()

    this.checkIfDashboardModalsAllowed()
    window.actions = actions;

    window.onerror = (error) => {
      console.error('App error: ', error)
    };

    try {
      const db = indexedDB.open("test");
      db.onerror = (e) => {
        console.error('db error', e)
      };
    } catch (e) {
      console.error('db error', e)
    }

    window.prerenderReady = true;

    const appInstalled = (e) => {
      alert(
        userLanguage === 'ru'
          ? 'Подождите пока приложение устанавливается'
          : 'Wait while application is installing'
      )
      window.removeEventListener('appinstalled', appInstalled)
    }
    window.addEventListener('appinstalled', appInstalled)

    this.checkCompletionOfAppCreation()
  }

  componentDidUpdate() {
    const { initialFetching, completeCreation } = this.state

    this.checkIfDashboardModalsAllowed()

    if (initialFetching && completeCreation) {
      // without setTimeout splash screen freezes when creating wallets
      setTimeout(() => {
        this.completeAppCreation().then(() => {
          this.setState(() => ({
            completeCreation: false,
            initialFetching: false,
          }))
        })
      })
    }
  }

  completeAppCreation = async () => {
    console.group('App >%c loading...', 'color: green;')

    if(!window.SwapApp){
      await actions.user.sign()
      await createSwapApp()
    }

    /* 
    Currently not in use. See Exchange/Quickswap/index.tsx comments
    */
    // if (config.entry === 'mainnet') { 
    //   await actions.oneinch.fetchUserOrders()
    // }

    console.groupEnd()
  }

  checkCompletionOfAppCreation = () => {
    const startPage = document.getElementById('starter-modal')
    const isWalletCreated = localStorage.getItem('isWalletCreate')

    if (
      !startPage ||
      config.isWidget ||
      utils.getCookie('startedSplashScreenIsDisabled') ||
      isWalletCreated ||
      window.location.hash !== '#/'
    ) {
      this.setState(() => ({
        initialFetching: true,
        completeCreation: true,
      }))
    } else {
      this.addStartPageListeners()
    }
  }

  setCompleteCreation = () => {
    this.removeStartPageListeners()
    this.setState(() => ({
      completeCreation: true,
    }))
  }

  addStartPageListeners = () => {
    // id from index.html start page
    const createBtn = document.getElementById('preloaderCreateBtn')
    const connectBtn = document.getElementById('preloaderConnectBtn')
    const restoreBtn = document.getElementById('preloaderRestoreBtn')
    const skipBtn = document.getElementById('preloaderSkipBtn')
  
    if (createBtn) createBtn.addEventListener('click', this.setCompleteCreation)
    if (connectBtn) connectBtn.addEventListener('click', this.setCompleteCreation)
    if (restoreBtn) restoreBtn.addEventListener('click', this.setCompleteCreation)
    if (skipBtn) skipBtn.addEventListener('click', this.setCompleteCreation)
  }

  removeStartPageListeners = () => {
    //@ts-ignore: strictNullChecks
    document.getElementById('preloaderCreateBtn').removeEventListener('click', this.setCompleteCreation)
    //@ts-ignore: strictNullChecks
    document.getElementById('preloaderConnectBtn').removeEventListener('click', this.setCompleteCreation)
    //@ts-ignore: strictNullChecks
    document.getElementById('preloaderRestoreBtn').removeEventListener('click', this.setCompleteCreation)
    //@ts-ignore: strictNullChecks
    document.getElementById('preloaderSkipBtn').removeEventListener('click', this.setCompleteCreation)
  }

  checkIfDashboardModalsAllowed = () => {
    const dashboardModalProvider = document.querySelector('.__modalConductorProvided__')
    //@ts-ignore
    if (dashboardModalProvider && !this.props.dashboardModalsAllowed) {
      return actions.ui.allowDashboardModals()
    //@ts-ignore
    } else if (dashboardModalProvider && this.props.dashboardModalsAllowed) {
      return null
    }
    return actions.ui.disallowDashboardModals()
  }

  handleSwitchTab = () => {
    this.setState({
      multiTabs: false
    });
    this.preventMultiTabs(true);
  };

  overflowHandler = () => {
    //@ts-ignore
    const { modals, dashboardModalsAllowed } = this.props;
    const isAnyModalCalled = Object.keys(modals).length > 0

    if (typeof document !== 'undefined' && isAnyModalCalled && !dashboardModalsAllowed) {
      document.body.classList.remove('overflowY-default')
      document.body.classList.add('overflowY-hidden')
    } else {
      document.body.classList.remove('overflowY-hidden')
      document.body.classList.add('overflowY-default')
    }
    if (typeof document !== 'undefined' && isAnyModalCalled && dashboardModalsAllowed) {
      document.body.classList.remove('overflowY-default')
      document.body.classList.add('overflowY-dashboardView-hidden')
    } else {
      document.body.classList.remove('overflowY-dashboardView-hidden')
      document.body.classList.add('overflowY-default')
    }
  }

  render() {
    const { initialFetching, multiTabs } = this.state;
    //@ts-ignore
    const { children, ethAddress, btcAddress, ghostAddress, nextAddress, tokenAddress, history, dashboardModalsAllowed } = this.props;

    this.overflowHandler()

    const isFetching = !ethAddress || !btcAddress || !ghostAddress || !nextAddress || (!tokenAddress && config && !config.isWidget) || initialFetching;

    const isWidget = history.location.pathname.includes("/exchange") && history.location.hash === "#widget";
    const isCalledFromIframe = window.location !== window.parent.location;
    const isWidgetBuild = config && config.isWidget;

    if (isWidgetBuild && localStorage.getItem(constants.localStorage.didWidgetsDataSend) !== "true") {
      localStorage.setItem(constants.localStorage.didWidgetsDataSend, true);
    }

    if (multiTabs) {
      return <PreventMultiTabs onSwitchTab={this.handleSwitchTab} />
    }

    if (isFetching) {
      return (
        <Loader 
          showMyOwnTip={
            <FormattedMessage id="Table96" defaultMessage="Loading..." />
          }
        />
      )
    }

    const isSeoDisabled = isWidget || isWidgetBuild || isCalledFromIframe
    const widgetTitle = window.defaultWindowTitle || seo.defaultTitle
    const widgetUrl = window.location.origin + window.location.pathname

    return <HashRouter>
      <div styleName="compressor">
        {!isSeoDisabled &&
          <Seo location={history.location} />
        }
        {isWidgetBuild && (
          <DocumentMeta
            title={widgetTitle}
            description={seo.defaultDescription}
            canonical={widgetUrl}
            meta={{
              property: {
                'og:title': widgetTitle,
                'og:description': seo.defaultDescription,
                'og:url': widgetUrl,
                'og:image': window.logoUrl,
              },
            }}
          />
        )}

        <ErrorBoundary>
          <Transactions>
            {/* @ts-ignore */}
            <WidthContainer id="swapComponentWrapper" styleName="headerAndMain">
              <Header />
              <main>{children}</main>
            </WidthContainer>
            <Core />
            <Footer />
            <RequestLoader />
            {!dashboardModalsAllowed &&
              <ModalConductor history={history}
            />}
            <NotificationConductor history={history} />
          </Transactions>
        </ErrorBoundary>
      </div>
    </HashRouter>;
  }
}

export default withRouter(injectIntl(App))
