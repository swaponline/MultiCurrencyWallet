import React, { Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import styles from './KeychainStatus.scss'


const handleActivateKeychain = (event, currency) => {
  event.preventDefault()
  event.stopPropagation()
  console.log('activate currency: ', currency)
}

const handleDeactivateKeychain = (event, currency) => {
  event.preventDefault()
  event.stopPropagation()
  console.log('deactivate currency: ', currency)
}

const KeychainStatus = ({ keychainActivated, currency }) => {console.log('keychainActivated, currency: ', keychainActivated, currency); return (
  <Fragment>
    <br />
    <span className={styles.keychainActiveLink}>
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
)}


export default KeychainStatus
