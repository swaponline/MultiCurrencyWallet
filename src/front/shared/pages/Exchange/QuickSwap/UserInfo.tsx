import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { isMobile } from 'react-device-detect'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { AddressFormat, AddressType } from 'domain/address'
import { metamask, links, constants, localStorage } from 'helpers'
import actions from 'redux/actions'
import Address from 'components/ui/Address/Address'
import Copy from 'components/ui/Copy/Copy'
import Button from 'components/controls/Button/Button'

function UserInfo(props) {
  const { slippage, fromWallet } = props

  const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
  const [mnemonicSaved, setMnemonicSaved] = useState(mnemonic === '-')

  const isWalletCreated = localStorage.getItem(constants.localStorage.isWalletCreate)
  const saveSecretPhrase = !mnemonicSaved && !metamask.isConnected()

  const saveMnemonic = () => {
    actions.modals.open(constants.modals.SaveMnemonicModal, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

        setMnemonicSaved(mnemonic === '-')
      },
    })
  }

  const createWallet = () => {
    const { history } = this.props
    const walletName = fromWallet.tokenKey || fromWallet.currency

    history.push(`${links.createWallet}/${walletName.toUpperCase()}`)
  }

  const connectWallet = () => {
    metamask.connect({ dontRedirect: true })
  }

  return (
    <section styleName="userInfo">
      <p styleName="slippageIndicator">
        <FormattedMessage id="slippageTolerance" defaultMessage="Slippage tolerance" />
        <span>{`${slippage} %`}</span>
      </p>

      {!metamask.isConnected() && (!isWalletCreated || !mnemonicSaved) && (
        <Button
          id="connectWalletBtn"
          brand
          fullWidth
          styleName="connectWalletBtn"
          onClick={connectWallet}
        >
          <FormattedMessage id="Exchange_ConnectAddressOption" defaultMessage="Connect Wallet" />
        </Button>
      )}
      {!isWalletCreated ? (
        <Button id="createWalletBtn" center onClick={createWallet}>
          <FormattedMessage id="menu.CreateWallet" defaultMessage="Create wallet" />
        </Button>
      ) : saveSecretPhrase ? (
        <Button id="saveSecretPhraseBtn" center onClick={saveMnemonic}>
          <FormattedMessage id="BTCMS_SaveMnemonicButton" defaultMessage="Save secret phrase" />
        </Button>
      ) : (
        <div styleName="addressWrapper">
          <span>
            <FormattedMessage id="addressOfYourWallet" defaultMessage="Address of your wallet:" />
          </span>
          <Copy text={fromWallet.address}>
            <span styleName="address">
              <Address
                address={fromWallet.address}
                format={isMobile ? AddressFormat.Short : AddressFormat.Full}
                type={metamask.isConnected() ? AddressType.Metamask : AddressType.Internal}
              />
            </span>
          </Copy>
        </div>
      )}
    </section>
  )
}

export default CSSModules(UserInfo, styles, { allowMultiple: true })
