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


const defaultLanguage = defineMessages({
  title: {
    id: 'confirmDialogDefaultTitle',
    defaultMessage: 'Confirm action',
  },
  message: {
    id: 'confirmDialogDefaultMessage',
    defaultMessage: 'Confirm action on this site',
  },
  ok: {
    id: 'confirmDialogDefaultOK',
    defaultMessage: 'Ok',
  },
  cancel: {
    id: 'confirmDialogDefaultCancel',
    defaultMessage: 'Cancel',
  },
})

@injectIntl
@cssModules(styles)
export default class Confirm extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    labelOk: PropTypes.string,
    labelCancel: PropTypes.string,
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
        labelOk,
        labelCancel,
      }
    } = this.props

    const labels = {
      title: (title) ? title : intl.formatMessage(defaultLanguage.title),
      message: (message) ? message: intl.formatMessage(defaultLanguage.message),
      ok: (labelOk) ? labelOk : intl.formatMessage(defaultLanguage.ok),
      cancel: (labelCancel) ? labelCancel : intl.formatMessage(defaultLanguage.cancel),
    }

    return (
      <Modal name={name} title={labels.title}>
        <div styleName="content">
          <p>{labels.message}</p>
          <Button styleName="button" brand onClick={this.handleConfirm}>{labels.ok}</Button>
          <Button styleName="button" brand onClick={this.handleClose}>{labels.cancel}</Button>
        </div>
      </Modal>
    )
  }
}
