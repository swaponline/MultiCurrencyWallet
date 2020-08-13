import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import { constants } from 'helpers'

import styles from './styles.scss'

import actions from 'redux/actions'


const isDark = localStorage.getItem(constants.localStorage.isDark)

const alertTexts = defineMessages({
  title: {
    id: 'WidgetExitAlertTitle',
    defaultMessage: 'One more step',
  },
  message: {
    id: 'widgetExitAlertMessage',
    defaultMessage: 'Save your secret phrase before exit!',
  },
})

const confirmTexts = defineMessages({
  title: {
    id: 'WidgetExitTitle3',
    defaultMessage: 'Confirm exit',
  },
  message: {
    id: 'widgetApproveMessage',
    defaultMessage: 'Are you sure you want to logout?',
  },
  no: {
    id: 'widgetApproveCancel',
    defaultMessage: 'Cancel',
  },
  yes: {
    id: 'widgetApproveApprove',
    defaultMessage: 'Yes',
  },
})

const WidgetHeaderComponent = ({ intl }) => {
  const [isConfirmOpen, setOpen] = useState(false)

  const handleShowMnemonic = () => {
    actions.modals.open(constants.modals.SaveMnemonicModal)
  }

  const handleConfirmToggle = () => {
    setOpen(!isConfirmOpen)
    if (!isConfirmOpen) {
      const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
      const mnemonicSaved = (mnemonic === `-`)
      if (!mnemonicSaved)  {
        actions.modals.open(constants.modals.AlertModal, {
          title: intl.formatMessage(alertTexts.title),
          message: intl.formatMessage(alertTexts.message),
          onClose: () => handleShowMnemonic(),
        })
      } else {
        actions.modals.open(constants.modals.Confirm, {
          title: intl.formatMessage(confirmTexts.title),
          message: intl.formatMessage(confirmTexts.message),
          labelNo: intl.formatMessage(confirmTexts.no),
          labelYes: intl.formatMessage(confirmTexts.yes),
          onCancel: () => handleConfirmToggle(),
          onAccept: () => handleConfirm(),
        })
      }
    }

  }

  const handleConfirm = () => {
    actions.backupManager.serverBackup().then((backupReady) => {
      console.log('Backup ready', backupReady)
      if (backupReady) window.localStorage.clear()
      window.location = (window && window.logoutUrl) ? window.logoutUrl : '/wp-login.php?action=logout'
    })
  }

  return (
    window.isUserRegisteredAndLoggedIn &&
    <div styleName={`exitArea ${isDark ? 'dark' : ''}`} onClick={handleConfirmToggle}>
      <i class="fas fa-sign-out-alt" /><FormattedMessage id="ExitWidget" defaultMessage="Exit" />
    </div>
  )
}

export const WidgetHeader = injectIntl(CSSModules(WidgetHeaderComponent, styles, { allowMultiple: true }))
