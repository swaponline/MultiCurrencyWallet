import React, { Component } from 'react'

import { withRouter } from 'react-router'
import CSSModules from 'react-css-modules'
import { defineMessages, injectIntl } from 'react-intl'

import actions from 'redux/actions'
import { constants, links } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import { Button } from 'components/controls'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'

import styles from './styles.scss'


const isDark = localStorage.getItem(constants.localStorage.isDark)

const defaultLanguage = defineMessages({
  createWallet: {
    id: 'AlertModalcreateWallet',
    defaultMessage: 'Create Wallet',
  },
  deposit: {
    id: 'AlertModaldeposit',
    defaultMessage: 'Deposit',
  },
  title: {
    id: 'alertTitle',
    defaultMessage: 'Alert',
  },
})

@injectIntl
@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class AlertWindow extends Component {

  handleClose = () => {
    const { name, data, onClose, history, intl } = this.props
    const { onClose: dataCLose, currency, address, actionType } = data
    const { locale } = intl

    if (actionType === 'deposit') {
      actions.modals.open(constants.modals.ReceiveModal, {
        currency,
        address,
      })
    }

    if (actionType === 'createWallet') {
      history.push(localisedUrl(locale, links.createWallet))
    }

    if (typeof onClose === 'function') {
      onClose()
    }

    if (typeof dataCLose === 'function') {
      dataCLose()
    }

    actions.modals.close(name)
  }

  render() {
    const {
      data: {
        title,
        message,
        actionType,
      },
      intl
    } = this.props

    const labels = {
      actionLabel: intl.formatMessage(defaultLanguage[actionType]),
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
              <Button styleName="button" gray onClick={this.handleClose}>{labels.actionLabel}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
