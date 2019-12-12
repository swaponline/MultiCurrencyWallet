import React from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { constants } from 'helpers'

import Link from 'sw-valuelink'

import cssModules from 'react-css-modules'
import styles from './AlertModal.scss'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FieldLabel, Input } from 'components/forms'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import Logo from 'components/Logo/Logo'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'


const defaultLanguage = defineMessages({
  title: {
    id: 'alertDialogDefaultTitle',
    defaultMessage: 'Информация',
  },
  message: {
    id: 'alertDialogDefaultMessage',
    defaultMessage: 'Ставим перед фактом',
  },
  ok: {
    id: 'alertDialogDefaultOk',
    defaultMessage: 'Ok',
  },
})

@injectIntl
@cssModules(styles)
export default class AlertModal extends React.Component {

  static propTypes = {
    onAccept: PropTypes.func,
  }

  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (typeof data.onClose === 'function') {
      data.onClose()
    }

    actions.modals.close(name)
  }

  render() {
    const {
      intl,
      name,
      data: {
        title,
        message,
        labelOk,
      },
    } = this.props

    const labels = {
      title: title || intl.formatMessage(defaultLanguage.title),
      message: message || intl.formatMessage(defaultLanguage.message),
      ok: labelOk || intl.formatMessage(defaultLanguage.ok),
    }

    return (
      <div styleName="modal-overlay" onClick={this.handleClose}>
        <div styleName="modal">
          <div styleName="header">
            <WidthContainer styleName="headerContent">
              <div styleName="title">{labels.title}</div>
            </WidthContainer>
          </div>
          <div styleName="content">
            <div styleName="notification-overlay">
              <p styleName="notification">{labels.message}</p>
            </div>
            <div styleName="button-overlay">
              <Button styleName="button" brand onClick={this.handleClose}>{labels.ok}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
