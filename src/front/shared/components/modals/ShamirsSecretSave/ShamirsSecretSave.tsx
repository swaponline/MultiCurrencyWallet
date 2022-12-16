import React, { Fragment } from 'react'
import { constants } from 'helpers'
import actions from 'redux/actions'
import { Link as HrefLink } from 'react-router-dom'
import { connect } from 'redaction'
import config from 'helpers/externalConfig'
import { getActivatedCurrencies } from 'helpers/user'

import cssModules from 'react-css-modules'

import okSvg from 'shared/images/ok.svg'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import Copy from 'components/ui/Copy/Copy'

import links from 'helpers/links'
import feedback from 'shared/helpers/feedback'
import styles from './ShamirsSecretSave.scss'
import defaultStyles from '../Styles/default.scss'


const langPrefix = `ShamirsSecretSave`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Ваша секретная фраза`,
  },
  enterMnemonicNotice: {
    id: `${langPrefix}_EnterNotice`,
    defaultMessage: `Нажмите слова, чтобы поместить их рядом друг с другом в правильном порядке`,
  },
  shareMnemonicTitle: {
    id: `${langPrefix}_ShareMnemonicTitle`,
    defaultMessage: `Ваша секретная фраза`,
  },
  showMnemonicNotice: {
    id: `${langPrefix}_ShowMnemonicNotice`,
    defaultMessage: `Запишите эти слова в правильном порядке и сохраните их в безопасном месте.`,
  },
  readySaveNotice: {
    id: `${langPrefix}_ReadySaveNotice`,
    defaultMessage: `Храните бумагу в том месте, где вы не забудете`,
  },
  saveMnemonicStep1: {
    id: `${langPrefix}_SaveMnemonicStep1`,
    defaultMessage: `1. Запишите фразу на бумагу`,
  },
  saveMnemonicStep2: {
    id: `${langPrefix}_SaveMnemonicStep2`,
    defaultMessage: `2. Обязательно подпишите что это ключ от {domain}`,
  },
  mnemonicDeleted: {
    id: `${langPrefix}_MnemoniceDeleted`,
    defaultMessage: `You have already saved your 12-words seed. {href}`,
    values: { 
      href: (
        <HrefLink to={links.savePrivateKeys}>
          {' '}
          <FormattedMessage id="MnemoniceDeleted_hrefText" defaultMessage="Try export private key" />
        </HrefLink>
      ) 
    },
  },
  beginNotice: {
    id: `${langPrefix}_BeginNotice`,
    defaultMessage: `Сейчас мы вам покажем три секретных кода.{br}Если вы потеряете хотя-бы два из них, мы не сможем восстановить ваш кошелек`,
  },
  beginContinue: {
    id: `${langPrefix}_BeginContinue`,
    defaultMessage: `Я понимаю`,
  },
  beginLater: {
    id: `${langPrefix}_BeginLater`,
    defaultMessage: `Я сохраню позже`,
  },
})


@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
class ShamirsSecretSave extends React.Component<any, any> {
  constructor(props) {
    super(props)

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    let shamirsSecretKeys: any = localStorage.getItem(constants.privateKeyNames.shamirsSecrets)
    if (shamirsSecretKeys && shamirsSecretKeys !== '-') {
      try {
        shamirsSecretKeys = JSON.parse(shamirsSecretKeys)
      } catch (e) {
        shamirsSecretKeys = false
      }
    } else {
      shamirsSecretKeys = false
    }

    this.state = {
      step: (shamirsSecretKeys) ? `begin` : `removed`,
      shamirsSecretKeys,
      sharededSecrets: {  // Части ключа, сохраненные, скопированные или расшаренные
        0: false,
        1: false,
        2: false,
      }
    }
  }

  handleGoToConfirm = () => {
  }

  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (data && typeof data.onClose === 'function') {
      data.onClose()
    } else {
      window.location.assign(links.hashHome)
    }

    const addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase = config?.opts?.addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase

    if (addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase) {
      const currencies = getActivatedCurrencies()
      currencies.forEach((currency) => {
        actions.core.markCoinAsVisible(currency.toUpperCase(), true)
      })
      localStorage.setItem(constants.localStorage.isWalletCreate, 'true')
    }

    actions.modals.close(name)
  }

  handleFinish = () => {
    feedback.backup.finished()
    this.handleClose()
  }

  renderShareSecret = (secretNumber) => {
    const {
      shamirsSecretKeys,
      sharededSecrets,
    } = this.state

    return (
      <div styleName="sharedSecret">
        <div styleName="sharedSecretKey">
          <span>Секретный Shamir's Secret-Share код #{secretNumber+1} от сайта localhost</span>
          <span>{shamirsSecretKeys[secretNumber]}</span>
        </div>
        <div styleName="sharedSecretButtons">
          <Button blue>Скопировать</Button>
          <Button blue>Сохранить</Button>
          <Button blue>Отправить</Button>
        </div>
      </div>
    )
  }

  render() {
    const {
      name,
      intl,
    } = this.props

    const {
      step,
      shamirsSecretKeys,
    } = this.state

    return (
      // @ts-ignore: strictNullChecks
      <Modal
        name={name}
        title={`${intl.formatMessage(langLabels.title)}`}
        onClose={this.handleClose}
        showCloseButton
      >
        {step === `show` && (
          <p styleName="notice mnemonicNotice">
            <FormattedMessage {...langLabels.showMnemonicNotice} />
          </p>
        )}
        {step === `removed` && (
          <p styleName="notice mnemonicNotice">
            <FormattedMessage {...langLabels.mnemonicDeleted} />
          </p>
        )}
        <div>
          {step === `begin` && (
            <>
              <p styleName="notice mnemonicNotice">
                <FormattedMessage
                  {...langLabels.beginNotice}
                  values={{
                    br: <br />,
                  }} />
              </p>
              <div styleName="buttonsHolder">
                <Button
                  blue
                  onClick={() => {
                    feedback.backup.started()
                    this.setState({ step: `show` })
                  }}>
                  <FormattedMessage {...langLabels.beginContinue} />
                </Button>
                <Button blue onClick={this.handleClose}>
                  <FormattedMessage {...langLabels.beginLater} />
                </Button>
              </div>
            </>
          )}
          {step === `ready` && (
            <>
              <p styleName="notice mnemonicNotice">
                <img styleName="finishImg" src={okSvg} alt="finish" />
                <FormattedMessage {...langLabels.readySaveNotice} />
              </p>
              <div styleName="lowLevel">
                <Button
                  styleName="buttonCenter buttonHalfFullWidth"
                  blue
                  onClick={this.handleFinish}
                >
                  <FormattedMessage id="WithdrawMSUserFinish" defaultMessage="Ready" />
                </Button>
              </div>
            </>
          )}
          {step === `show` && (
            <>
              <div styleName="highLevel">
                {this.renderShareSecret(0)}
                {this.renderShareSecret(1)}
                {this.renderShareSecret(2)}
                <p styleName="notice mnemonicNotice">
                  <FormattedMessage {...langLabels.saveMnemonicStep1} />
                  <br />
                  <FormattedMessage {...langLabels.saveMnemonicStep2} values={{ domain: location.hostname }} />
                </p>
              </div>

              <div styleName="mnemonicButtonsWrapper">
                <Copy text={shamirsSecretKeys.join(`\n\n`)}>
                  <Button brand>
                    <FormattedMessage id="FeeControler49" defaultMessage="Copy" />
                  </Button>
                </Copy>
                <div styleName="continueBtnWrapper">
                  <Button brand onClick={this.handleGoToConfirm}>
                    <FormattedMessage id="createWalletButton1" defaultMessage="Continue" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    )
  }
}

export default injectIntl(ShamirsSecretSave)
