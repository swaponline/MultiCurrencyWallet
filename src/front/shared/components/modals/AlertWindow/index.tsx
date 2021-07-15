import React, { Component } from 'react'

import { withRouter } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import actions from 'redux/actions'
import { constants, links } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import { Button } from 'components/controls'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'

import styles from './styles.scss'

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

@withRouter
@CSSModules(styles, { allowMultiple: true })
class AlertWindow extends Component<any, any> {

  handleClose = () => {
    const { name, data, onClose, history, intl } = this.props
    const { onClose: dataClose, currency, address, actionType } = data
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

    if (typeof dataClose === 'function') {
      dataClose()
    }

    actions.modals.close(name)
  }

  handleClosePopup = () => {
    const { name } = this.props
    actions.modals.close(name)
  }

  render() {
    const {
      data: {
        title,
        message,
        actionType,
        canClose,
      },
      intl,
    } = this.props

    const labels = {
      actionLabel: intl.formatMessage(defaultLanguage[actionType]),
      title: title || intl.formatMessage(defaultLanguage.title),
    }

    return (
      <div styleName="modal-overlay">
        <div styleName="modal">
          <div styleName="header">
            {/*
            //@ts-ignore */}
            <WidthContainer styleName="headerContent">
              <div styleName="title">{labels.title}</div>

              {canClose && (<CloseIcon styleName="closeButton" onClick={this.handleClosePopup} />)}
            </WidthContainer>
          </div>
          <div styleName="content">
            <div styleName="notification-overlay">
              <p styleName="notification">
                {message}
              </p>
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

export default injectIntl(AlertWindow)
