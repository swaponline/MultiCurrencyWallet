import React from 'react'
import { connect } from 'redaction'
import cx from 'classnames'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'
import styles from './AlertModal.scss'
import { Button } from 'components/controls'
import { injectIntl, IntlShape, defineMessages } from 'react-intl'
import { constants } from 'helpers'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'

const isDark = localStorage.getItem(constants.localStorage.isDark)

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

type AlertModalProps = {
  intl: IntlShape
  name: string
  dashboardModalsAllowed
  onClose: () => void
  data: {
    dontClose: boolean
    okButtonAutoWidth: boolean
    onClose: () => void
    callbackOk: () => boolean
    title: JSX.Element
    message: JSX.Element
    labelOk: JSX.Element
  }
}


@connect(({ ui: { dashboardModalsAllowed }}) => ({
  dashboardModalsAllowed
}))
@cssModules(styles)
class AlertModal extends React.Component<AlertModalProps, null> {
  handleClose = () => {
    const {
      name,
      data,
      data: {
        dontClose,
      },
      onClose,
    } = this.props

    if (dontClose) return

    if (typeof onClose === 'function') {
      onClose()
    }

    if (typeof data.onClose === 'function') {
      data.onClose()
    }

    actions.modals.close(name)
  }

  handleOk = () => {
    const {
      name,
      data: {
        callbackOk,
      },
    } = this.props

    if (typeof callbackOk === `function`) {
      if (callbackOk()) {
        actions.modals.close(name)
      }
    } else {
      this.handleClose()
    }
  }

  render() {
    const {
      intl,
      data: {
        title,
        message,
        labelOk,
        okButtonAutoWidth,
      },
      dashboardModalsAllowed,
    } = this.props

    const labels = {
      title: title || intl.formatMessage(defaultLanguage.title),
      message: message || intl.formatMessage(defaultLanguage.message),
      ok: labelOk || intl.formatMessage(defaultLanguage.ok),
    }

    const buttonStyle = (!okButtonAutoWidth) ? `button` : `button_autoWidth`

    return (
      <div className={cx({
        [styles['modal-overlay']]: true,
        [styles['modal-overlay_dashboardView']]: dashboardModalsAllowed
      })}>
        <div className={cx({
          [styles.modal]: true,
          [styles.dark]: isDark,
          [styles.modal_dashboardView]: dashboardModalsAllowed
        })}>
          <div styleName="header">
            {/*
            //@ts-ignore */}
            <WidthContainer styleName="headerContent">
              <div styleName="title">{labels.title}</div>
            </WidthContainer>
          </div>
          <div styleName="content">
            <div styleName="notification-overlay">
              <p styleName="notification">{labels.message}</p>
            </div>
            <div styleName="button-overlay">
              <Button styleName={buttonStyle} blue onClick={this.handleOk}>{labels.ok}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

//@ts-ignore: strictNullChecks
export default injectIntl(AlertModal)