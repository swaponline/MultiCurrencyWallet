import { connect } from 'redaction'
import { FormattedMessage } from 'react-intl'
import cssModules from 'react-css-modules'
import styles from './index.scss'

import Coin from 'components/Coin/Coin'

import { metamask, constants } from 'helpers'
import actions from 'redux/actions'


const WalletConnect = (props) => {
  const {
    metamaskData
  } = props

  const isMetamaskConnetced = metamaskData.isConnected

  const web3Type = metamask.web3connect.getInjectedType()
  const isNotAvailableMetamaskNetwork = isMetamaskConnetced && !metamask.isAvailableNetwork()
  const disconectedOrNetworkNowAvailable = !isMetamaskConnetced || isNotAvailableMetamaskNetwork

  const connectWallet = () => {
    metamask.handleConnectMetamask({
      dontRedirect: true,
    })
  }

  const disconnectWallet = async () => {
    await metamask.disconnect()
  }

  const openWalletConnectAccountModal = () => {
    actions.modals.open(constants.modals.WalletConnectAccount)
  }

  const currencyName = metamaskData.currency.toLowerCase()

  return (
    <div
      styleName="connectWallet"
      onClick={
        isMetamaskConnetced ?
          (isNotAvailableMetamaskNetwork ?
            disconnectWallet :
            openWalletConnectAccountModal) :
          connectWallet
      }
    >
      {disconectedOrNetworkNowAvailable ?
        <Coin
          size={40}
          name={web3Type}
        /> :
        <Coin
          size={30}
          name={currencyName}
        />
      }
      <span styleName={`connectWalletText ${disconectedOrNetworkNowAvailable ? '' : 'hasCoinIcon'}`}>
        {isNotAvailableMetamaskNetwork ?
          <FormattedMessage id="UnknownNetworkConnectedWallet" defaultMessage="Unknown Network" /> :
          isMetamaskConnetced ?
            metamask.getShortAddress() :
            <FormattedMessage id="Exchange_ConnectAddressOption" defaultMessage="Connect Wallet" />
        }
      </span>
    </div>
  )
}

export default connect(
  ({
    user,
  }) => ({
    metamaskData: user.metamaskData,
  })
)(cssModules(WalletConnect, styles, { allowMultiple: true }))