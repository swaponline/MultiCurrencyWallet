import React, { Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import actions from 'redux/actions'
import { constants } from 'helpers'
import styles from './KeychainStatus.scss'


const handleActivateKeychain = (event, currency) => {
  event.preventDefault()
  event.stopPropagation()
  actions.modals.open(constants.modals.Keychain, { currency })
}

const handleDeactivateKeychain = (event, currency) => {
  event.preventDefault()
  event.stopPropagation()
  actions.modals.open(constants.modals.Keychain, { currency })
}

const KeychainStatus = ({ currency }) => {
  if (true) {
    return null
  }
  const isMac = navigator.platform.indexOf('Mac') > -1
  if (!isMac) {
    return null
  }
  const keychainActivated = currency === 'ETH' ?
    !!localStorage.getItem(constants.privateKeyNames.ethKeychainPublicKey) :
    !!localStorage.getItem(constants.privateKeyNames.btcKeychainPublicKey)
  return (
    <Fragment>
      <br />
      <span className={`${styles.link} ${keychainActivated ? styles.active : styles.inactive}`}>
        <i className={`fas fa-lock ${styles.icon}`} aria-hidden="true" />
        { keychainActivated ?
          <FormattedMessage id="Row288" defaultMessage="KeyChain is activated" />
          :
          <FormattedMessage id="Row289" defaultMessage="KeyChain is not activated" />
        }
        &nbsp;
        { keychainActivated ?
          <a href="#" onClick={(e) => { handleDeactivateKeychain(e, currency) }}>
            <FormattedMessage id="RowWallet284" defaultMessage="Deactivate" />
          </a>
          :
          <a href="#" onClick={(e) => { handleActivateKeychain(e, currency) }}>
            <FormattedMessage id="RowWallet283" defaultMessage="Activate" />
          </a>
        }
      </span>
    </Fragment>
  ) }


export default KeychainStatus
