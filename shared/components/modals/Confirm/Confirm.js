import React from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { constants } from 'helpers'

import Link from 'sw-valuelink'

import cssModules from 'react-css-modules'
import styles from './Confirm.scss'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FieldLabel, Input } from 'components/forms'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


const defaultLanguage = defineMessages({
  title: {
    id: 'confirmDialogDefaultTitle',
    defaultMessage: 'Confirm action',
  },
  message: {
    id: 'confirmDialogDefaultMessage',
    defaultMessage: 'Confirm action on this site?',
  },
  yes: {
    id: 'confirmDialogDefaultYes',
    defaultMessage: 'Yes',
  },
  no: {
    id: 'confirmDialogDefaultNo',
    defaultMessage: 'No',
  },
})

@injectIntl
@cssModules(styles)
export default class Confirm extends React.Component {

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

  handleConfirm = () => {
    const { name, data, onAccept } = this.props

    actions.modals.close(name)

    if (typeof onAccept === 'function') {
      onAccept()
    }

    if (typeof data.onAccept === 'function') {
      data.onAccept()
    }
  }

  render() {
    const {
      intl,
      name,
      data: {
        title,
        message,
        labelYes,
        labelNo,
      },
    } = this.props

    const labels = {
      title: title || intl.formatMessage(defaultLanguage.title),
      message: message || intl.formatMessage(defaultLanguage.message),
      yes: labelYes || intl.formatMessage(defaultLanguage.yes),
      no: labelNo || intl.formatMessage(defaultLanguage.no),
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
              <Button styleName="button" brand onClick={this.handleConfirm}>{labels.yes}</Button>
              <Button styleName="button" gray onClick={this.handleClose}>{labels.no}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
