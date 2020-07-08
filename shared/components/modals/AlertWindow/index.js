import React, { Component } from 'react'

import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './styles.scss'

import { Button } from 'components/controls'

import { defineMessages, injectIntl } from 'react-intl'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


const isDark = localStorage.getItem(constants.localStorage.isDark)

const defaultLanguage = defineMessages({
  ok: {
    id: 'oktext',
    defaultMessage: 'Ok',
  },
  title: {
    id: 'alertTitle',
    defaultMessage: 'Alert',
  },
})

@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class AlertWindow extends Component {

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
      data: {
        title,
        message,
        labelOk,
      },
      intl
    } = this.props

    const labels = {
      ok: labelOk || intl.formatMessage(defaultLanguage.ok),
      title: title || intl.formatMessage(defaultLanguage.title),
    }

    return (
      <div styleName={`modal-overlay ${isDark ? '--dark' : ''}`}>
        <div styleName="modal">
          <div styleName="header">
            <WidthContainer styleName="headerContent">
              <div styleName="title">{labels.title}</div>
            </WidthContainer>
          </div>
          <div styleName="content">
            <div styleName="notification-overlay">
              <p styleName="notification">{message}</p>
            </div>
            <div styleName="button-overlay">
              <Button styleName="button" gray onClick={this.handleClose}>{labels.ok}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
