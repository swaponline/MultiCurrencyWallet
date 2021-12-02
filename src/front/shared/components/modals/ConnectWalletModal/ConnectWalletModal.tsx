import React from 'react'
import actions from 'redux/actions'
import { connect } from 'redaction'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import cssModules from 'react-css-modules'
import cx from 'classnames'
import styles from './ConnectWalletModal.scss'
import { externalConfig } from 'helpers'
import SUPPORTED_PROVIDERS from 'common/web3connect/providers/supported'
import { constants, links, metamask } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { Button } from 'components/controls'
import Coin from 'components/Coin/Coin'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import web3Icons from 'images'

@connect(({ ui: { dashboardModalsAllowed } }) => ({
  dashboardModalsAllowed,
}))
@cssModules(styles, { allowMultiple: true })
class ConnectWalletModal extends React.Component<any, any> {
  constructor(props) {
    super(props)

    this.state = {
      choseNetwork: false,
      currentBaseCurrency: -1,
    }
  }

  goToPage(link) {
    const {
      name,
      history,
      intl: { locale },
    } = this.props
    history.push(localisedUrl(locale, link))
  }

  onConnectLogic(connected) {
    const {
      name,
      data: { dontRedirect, onResolve },
    } = this.props

    if (connected) {
      if (!dontRedirect) this.goToPage(links.home)
      if (typeof onResolve === `function`) {
        onResolve(true)
      }
      actions.modals.close(name)
    }
  }

  handleClose = () => {
    const {
      name,
      data: { dontRedirect, onResolve },
    } = this.props

    if (!dontRedirect) {
      if (!localStorage.getItem(constants.localStorage.isWalletCreate)) {
        this.goToPage(links.createWallet)
      } else {
        this.goToPage(links.home)
      }
    }
    if (typeof onResolve === `function`) {
      onResolve(false)
    }
    actions.modals.close(name)
  }

  handleInjected = async () => {
    const { currentBaseCurrency } = this.state
    const web3connect = this.newWeb3connect()

    web3connect.connectTo(SUPPORTED_PROVIDERS.INJECTED).then(async (connected) => {
      if (!connected && web3connect.isLocked()) {
        actions.modals.open(constants.modals.AlertModal, {
          message: (
            <FormattedMessage
              id="ConnectWalletModal_WalletLocked"
              defaultMessage="Wallet is locked. Unlock the wallet first."
            />
          ),
        })
      } else {
        if (!metamask.isAvailableNetworkByCurrency(currentBaseCurrency)) {
          await metamask.switchNetwork(currentBaseCurrency)
        }

        this.onConnectLogic(connected)
      }
    })
  }

  handleWalletConnect = () => {
    const web3connect = this.newWeb3connect()

    web3connect.connectTo(SUPPORTED_PROVIDERS.WALLETCONNECT).then(async (connected) => {
      await metamask.web3connectInit()

      this.onConnectLogic(connected)
    })
  }

  newWeb3connect = () => {
    const { currentBaseCurrency } = this.state
    const networkInfo = externalConfig.evmNetworks[currentBaseCurrency.toUpperCase()]

    metamask.setWeb3connect(networkInfo.networkVersion)

    return metamask.getWeb3connect()
  }

  setNetwork = async (coinName) => {
    const { currentBaseCurrency } = this.state

    this.setState(() => ({
      choseNetwork: true,
    }))

    if (currentBaseCurrency !== coinName) {
      this.setState(() => ({
        currentBaseCurrency: coinName,
      }))
    }
  }

  render() {
    const { dashboardModalsAllowed, noCloseButton } = this.props
    const { choseNetwork, currentBaseCurrency } = this.state

    const web3Type = metamask.web3connect.getInjectedType()
    const web3Icon = (web3Icons[web3Type] && web3Type !== `UNKNOWN` && web3Type !== `NONE`) ? web3Icons[web3Type] : false
    const walletConnectIcon = web3Icons[`WALLETCONNECT`]

    return (
      <div
        className={cx({
          [styles['modal-overlay']]: true,
          [styles['modal-overlay_dashboardView']]: dashboardModalsAllowed,
        })}
      >
        <div
          className={cx({
            [styles['modal']]: true,
            [styles['modal_dashboardView']]: dashboardModalsAllowed,
          })}
        >
          <div styleName="header">
            <h3 styleName="title"><FormattedMessage id="Connect" defaultMessage="Connect" /></h3>
            {!noCloseButton && (
              <CloseIcon onClick={this.handleClose} />
            )}
          </div>

          <div styleName="notification-overlay">
            <div styleName="stepWrapper">
              <h3 styleName="title">
                <FormattedMessage id="chooseNetwork" defaultMessage="Choose network" />
              </h3>
              <div styleName="options">
                {Object.values(externalConfig.evmNetworks)
                  .filter( (network: any) => {
                    return externalConfig.opts.curEnabled[network.currency.toLowerCase()]
                  })
                  .map(
                  (
                    item: {
                      currency: string
                      chainId: number
                      networkVersion: number
                      chainName: string
                      rpcUrls: string[]
                      blockExplorerUrls: string[]
                    },
                    index
                  ) => {
                    return (
                      <button
                        key={index}
                        styleName={`option ${currentBaseCurrency === item.currency ? 'selected' : ''}`}
                        onClick={() => this.setNetwork(item.currency)}
                      >
                        <Coin size={50} name={item.currency.toLowerCase()} />
                        <span styleName="chainName">{item.chainName.split(' ')[0]}</span>
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            <div styleName={`stepWrapper ${choseNetwork ? '' : 'disabled'}`}>
              <h3 styleName="title">
                <FormattedMessage id="chooseWallet" defaultMessage="Choose wallet" />
              </h3>
              <div styleName="options">
                {metamask.web3connect.isInjectedEnabled() && (
                  <div styleName="provider">
                    <Button brand onClick={this.handleInjected}>
                      {web3Icon && (
                        <img src={web3Icon} />
                      )}
                      {metamask.web3connect.getInjectedTitle()}
                    </Button>
                  </div>
                )}
                <div styleName="provider">
                  <Button brand onClick={this.handleWalletConnect}>
                    <img src={walletConnectIcon} />
                    <FormattedMessage id="ConnectWalletModal_WalletConnect" defaultMessage="WalletConnect" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
//@ts-ignore: strictNullChecks
export default injectIntl(ConnectWalletModal)
