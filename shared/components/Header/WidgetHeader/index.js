import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import { constants } from 'helpers'

import styles from './styles.scss'


const defaultLanguage = defineMessages({
  title: {
    id: 'WidgetExitTitle3',
    defaultMessage: 'Approve exit',
  },
  message: {
    id: 'widgetApproveMessage',
    defaultMessage: 'Are you sure you want to logout? IMPORTANT: Save your private keys!',
  },
  yes: {
    id: 'widgetApproveApprove',
    defaultMessage: 'Yes',
  },
  no: {
    id: 'widgetApproveCancel',
    defaultMessage: 'Cancel',
  },
})

const WidgetHeaderComponent = ({ intl }) => {
  const [isConfirmOpen, setOpen] = useState(false)

  const data = {
    title: intl.formatMessage(defaultLanguage.title),
    message: intl.formatMessage(defaultLanguage.message),
    labelYes: intl.formatMessage(defaultLanguage.yes),
    labelNo: intl.formatMessage(defaultLanguage.no),
  }

  const handleConfirmToggle = () => {
    setOpen(!isConfirmOpen)
    if (!isConfirmOpen) {
      actions.modals.open(constants.modals.Confirm, {
        ...data,
        onAccept: () => handleConfirm(),
        onCancel: () => handleConfirmToggle(),
      })
    }

  }

  const handleConfirm = () => {
    window.location = (window && window.logoutUrl) ? window.logoutUrl : '/wp-login.php?action=logout'
  }

  return (
    window.isUserRegisteredAndLoggedIn && <div styleName="exitArea" onClick={handleConfirmToggle}>
      <i className="fas fa-sign-out-alt" /><FormattedMessage id="ExitWidget" defaultMessage="Exit" />
                                          </div>
  )
}

export const WidgetHeader = injectIntl(CSSModules(WidgetHeaderComponent, styles, { allowMultiple: true }))
