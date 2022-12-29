import React from 'react'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './ShamirsSecretRestory.scss'
import Copy from 'components/ui/Copy/Copy'
import Modal from 'components/modal/Modal/Modal'
import { Button } from 'components/controls'
import Input from 'components/forms/Input/Input'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Link from 'local_modules/sw-valuelink'
import * as mnemonicUtils from 'common/utils/mnemonic'
import okSvg from 'shared/images/ok.svg'
import links from 'helpers/links'
import feedback from 'shared/helpers/feedback'


const langPrefix = `Shamirs_Restory`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: 'Восстановление кошелька',
  },
  doRestore: {
    id: `${langPrefix}_DoRestore`,
    defaultMessage: 'Восстановить',
  },
  isDoRestoring: {
    id: `${langPrefix}_IsDoRestoring`,
    defaultMessage: 'Восстанавливаем',
  },
  secretOne: {
    id: `${langPrefix}_SecretOne`,
    defaultMessage: 'Секретный код #1',
  },
  secretOneError: {
    id: `${langPrefix}_SecretOneError`,
    defaultMessage: 'Введите корректный секретный код #1',
  },
  enterSecretOne: {
    id: `${langPrefix}_EnterSecretOne`,
    defaultMessage: 'Введите секретный код #1',
  },
  secretTwo: {
    id: `${langPrefix}_SecretTwo`,
    defaultMessage: 'Секретный код #2',
  },
  enterSecretTwo: {
    id: `${langPrefix}_EnterSecretTwo`,
    defaultMessage: 'Введите секретный код #2',
  },
  secretTwoError: {
    id: `${langPrefix}_SecretTwoError`,
    defaultMessage: 'Введите корректный секретный код #2',
  },
  hasError: {
    id: `${langPrefix}_RestoreHasError`,
    defaultMessage: 'При восстановлении произошла ошибка: {errorMessage}',
  },
  readyNotice: {
    id: `${langPrefix}_ReadyNotice`,
    defaultMessage: 'Теперь вы можете добавить BTC, ETH и другие валюты',
  },
  Ready: {
    id: `${langPrefix}_Ready`,
    defaultMessage: 'Готово',
  },
  cancelRestory: {
    id: `${langPrefix}_CancelRestory`,
    defaultMessage: 'Отмена',
  },
})

/*
  Какой механизм ключей использовать
  фраза из 20 слов или BigInt этой фразы
*/
const useMnemonicAsSecret = false

@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
class ShamirsSecretRestory extends React.PureComponent<any, any> {
  constructor(props) {
    super(props)
    this.state = {
      isRestoring: false,
      isFetching: false,
      secretOne: ``,
      secretTwo: ``,
      hasError: false,
      secretOneError: false,
      secretTwoError: false,
      errorMessage: ``,
      isRestored: false,
    }
  }

  handleCloseModal = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (data && typeof data.onClose === 'function') {
      data.onClose()
    } else if (!(data && data.noRedirect)) {
      window.location.assign(links.hashHome)
    }

    actions.modals.close(name)
  }

  handleRestore = () => {
    const {
      isRestoring,
      isFetching,
      secretOne,
      secretTwo,
    } = this.state
    if (isRestoring || isFetching) return
    this.setState({
      isFetching: true,
      hasError: false,
      secretOneError: false,
      secretTwoError: false,
    }, () => {
      if (!secretOne || secretOne.length === 0 || !mnemonicUtils.isValidShamirsSecret(secretOne)) {
        this.setState({ secretOneError: true, isFetching: false})
        return
      }
      if (!secretTwo || secretTwo.length === 0 || !mnemonicUtils.isValidShamirsSecret(secretTwo)) {
        this.setState({ secretTwoError: true, isFetching: false})
        return
      }

      this.setState({
        isRestoring: true,
      }, () => {
        setTimeout(async () => {
          try {
            const mnemonicFromSecrets = mnemonicUtils.restoryMnemonicFromSecretParts([secretOne, secretTwo], useMnemonicAsSecret)
            
            await actions.user.restoreWallet(mnemonicFromSecrets)
            this.setState(() => ({
              isRestored: true,
            }))

            feedback.restore.finished()
          } catch (e) {
            console.log(e.message)
            this.setState({
              isFetching: false,
              isRestoring: false,
              hasError: true,
              errorMessage: e.message,
            })
          }
        })
      })
    })
  }

  handleFinish = () => {
    const { data } = this.props

    this.handleCloseModal()

    if (!(data && data.noRedirect)) {
      window.location.assign(links.hashHome)
      window.location.reload()
    }
  }

  render() {
    const { name, intl } = this.props

    const {
      isRestoring,
      isFetching,
      secretOne,
      secretTwo,
      hasError,
      secretOneError,
      secretTwoError,
      errorMessage,
      isRestored,
    } = this.state

    const linked = Link.all(
      this,
      'secretOne',
      'secretTwo',
    )

    return (
      <Modal
        name={name}
        showCloseButton
        onClose={this.handleCloseModal}
        title={intl.formatMessage(langLabels.title)}
      >
        <section styleName="content">
          {!isRestored && (
            <>
              <div styleName="highLevel">
                <FieldLabel>
                  <FormattedMessage {...langLabels.enterSecretOne} />
                </FieldLabel>
                <Input
                  smallFontSize
                  withMargin
                  valueLink={linked.secretOne}
                  focusOnInit
                  disabled={isRestoring}
                  onFocus={() => { this.setState({ secretOneError: false }) }}
                  placeholder={intl.formatMessage(langLabels.secretOne)}
                />
                {secretOneError && (
                  <div styleName="rednote">
                    <FormattedMessage {...langLabels.secretOneError} />
                  </div>
                )}
              </div>
              <div styleName="highLevel">
                <FieldLabel>
                  <FormattedMessage {...langLabels.enterSecretTwo} />
                </FieldLabel>
                <Input
                  smallFontSize
                  withMargin
                  valueLink={linked.secretTwo}
                  disabled={isRestoring}
                  onFocus={() => { this.setState({ secretTwoError: false }) }}
                  placeholder={intl.formatMessage(langLabels.secretTwo)}
                />
                {secretTwoError && (
                  <div styleName="rednote">
                    <FormattedMessage {...langLabels.secretTwoError} />
                  </div>
                )}
              </div>
              <div styleName="highLevel">
                {!isRestoring && (
                  <div styleName="buttonsHolder">
                    <Button gray disabled={isFetching} onClick={this.handleCloseModal}>
                      <FormattedMessage {...langLabels.cancelRestory} />
                    </Button>
                    <Button
                      blue
                      disabled={isFetching}
                      onClick={this.handleRestore}
                    >
                      <FormattedMessage {...langLabels.doRestore} />
                    </Button>
                  </div>
                )}
                {isRestoring && (
                  <Button
                    styleName="buttonCenter buttonFull"
                    blue
                    disabled={true}
                  >
                    <FormattedMessage {...langLabels.isDoRestoring} />
                  </Button>
                )}
                {hasError && (
                  <div styleName="rednote">
                    <FormattedMessage {...langLabels.hasError} values={{errorMessage}} />
                  </div>
                )}
              </div>
            </>
          )}
          {isRestored && (
            <>
              <p styleName="notice mnemonicNotice">
                <img styleName="finishImg" src={okSvg} alt="finish" />
                <FormattedMessage {...langLabels.readyNotice} />
              </p>
              <div styleName="lowLevel">
                <Button
                  styleName="buttonCenter buttonHalfFullWidth"
                  blue
                  onClick={this.handleFinish}
                >
                  <FormattedMessage {...langLabels.Ready} />
                </Button>
              </div>
            </>
          )}
        </section>
      </Modal>
    )
  }
}

export default injectIntl(ShamirsSecretRestory)
