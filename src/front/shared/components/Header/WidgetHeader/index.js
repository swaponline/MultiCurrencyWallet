import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import { FormattedMessage, injectIntl } from 'react-intl'

import { constants } from 'helpers'

import styles from './styles.scss'
import wpLogoutModal from 'helpers/wpLogoutModal'


const isDark = localStorage.getItem(constants.localStorage.isDark)

const WidgetHeaderComponent = ({ intl }) => {
  const [isConfirmOpen, setOpen] = useState(false)

  const handleConfirmToggle = () => {
    setOpen(!isConfirmOpen)
    if (!isConfirmOpen) {
      wpLogoutModal(handleConfirmToggle, intl)
    }
  }

  return (
    window.isUserRegisteredAndLoggedIn &&
    <div styleName={`exitArea ${isDark ? 'dark' : ''}`} onClick={handleConfirmToggle}>
      <i class="fas fa-sign-out-alt" /><FormattedMessage id="ExitWidget" defaultMessage="Exit" />
    </div>
  )
}

export const WidgetHeader = injectIntl(CSSModules(WidgetHeaderComponent, styles, { allowMultiple: true }))
