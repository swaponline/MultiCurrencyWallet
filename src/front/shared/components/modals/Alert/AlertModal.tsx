import React from 'react'
import { connect } from 'redaction'
import cx from 'classnames'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'
import styles from './AlertModal.scss'
import { Button } from 'components/controls'
import { injectIntl, IntlShape, defineMessages } from 'react-intl'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
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

type AlertModalProps = {
  intl: IntlShape
  name: string
  dashboardModalsAllowed
  onClose: () => void
  data: {
    canClose: boolean
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
  closeWithCustomAction = () => {
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

  closeModal = () => {
    const { name } = this.props

    actions.modals.close(name)
  }

  handleOk = () => {
    const {
      data: {
        callbackOk,
      },
    } = this.props

    if (typeof callbackOk === `function`) {
      if (callbackOk()) {
        this.closeModal()
      }
    } else {
      this.closeWithCustomAction()
    }
  }

  render() {
    const {
      intl,
      data: {
        canClose,
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
      })}>
        <div className={cx({
          [styles.modal]: true,
          [styles.modal_dashboardView]: dashboardModalsAllowed
        })}>
          <div styleName="header">
            {/*
            //@ts-ignore */}
            <WidthContainer styleName="headerContent">
              <div styleName="title">{labels.title}</div>

              {canClose && (
                <CloseIcon styleName="closeButton" onClick={this.closeModal} />
              )}
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