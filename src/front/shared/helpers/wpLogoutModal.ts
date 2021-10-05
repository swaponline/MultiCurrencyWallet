import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import actions from 'redux/actions'
import { constants } from 'helpers'


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

const handleShowMnemonic = () => {
  actions.modals.open(constants.modals.SaveMnemonicModal)
}

const handleConfirm = () => {
  actions.backupManager.serverBackup().then(({backupReady, hasBackupPlugin}) => {
    console.log('Backup ready', backupReady)
    if (hasBackupPlugin) {
      if (backupReady) window.localStorage.clear()
    } else {
      window.localStorage.clear()
    }

    window.location = (window && window.logoutUrl) ? window.logoutUrl : '/wp-login.php?action=logout'
  })
}

const wpLogoutModal = (onCancelHandle, intl) => {
  const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
  const mnemonicSaved = (mnemonic === `-`)
  if (!mnemonicSaved)  {
    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.AlertModal, {
      title: intl.formatMessage(alertTexts.title),
      message: intl.formatMessage(alertTexts.message),
      onClose: () => handleShowMnemonic(),
    })
  } else {
    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.Confirm, {
      title: intl.formatMessage(confirmTexts.title),
      message: intl.formatMessage(confirmTexts.message),
      labelNo: intl.formatMessage(confirmTexts.no),
      labelYes: intl.formatMessage(confirmTexts.yes),
      onCancel: onCancelHandle,
      onClose: onCancelHandle,
      onAccept: () => handleConfirm(),
    })
  }
}


export default wpLogoutModal