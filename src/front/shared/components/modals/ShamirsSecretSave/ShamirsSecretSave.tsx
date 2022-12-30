import React, { Fragment } from 'react'
import { constants } from 'helpers'
import actions from 'redux/actions'
import { Link as HrefLink } from 'react-router-dom'
import { connect } from 'redaction'
import config from 'helpers/externalConfig'
import { getActivatedCurrencies } from 'helpers/user'

import cssModules from 'react-css-modules'
import moment from 'moment/moment'
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
    defaultMessage: `Shamir's Secret-Share`,
  },
  shareMnemonicTitle: {
    id: `${langPrefix}_ShareMnemonicTitle`,
    defaultMessage: `Shamir's Secret-Share codes`,
  },
  showMnemonicNotice: {
    id: `${langPrefix}_ShowMnemonicNotice`,
    defaultMessage: `Сохраните эти коды. Если вы потеряете хотя-бы два из них, восстановить кошелек будет не возможно`,
  },
  readySaveNotice: {
    id: `${langPrefix}_ReadySaveNotice`,
    defaultMessage: `Не потеряете сохраненные коды`,
  },
  countSecretsSaved: {
    id: `${langPrefix}_CountSavedSecrets`,
    defaultMessage: `Сохранено {saved} из {total}`,
  },
  mnemonicDeleted: {
    id: `${langPrefix}_MnemoniceDeleted`,
    defaultMessage: `You have already saved your Shamir's Secret-Share codes. {href}`,
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
  useCopy: {
    id: `${langPrefix}_UseCopy`,
    defaultMessage: `Скопировать`,
  },
  useSave: {
    id: `${langPrefix}_UseSave`,
    defaultMessage: `Сохранить`,
  },
  useSend: {
    id: `${langPrefix}_UseSend`,
    defaultMessage: `Отправить`,
  },
  codeNfromSite: {
    id: `${langPrefix}_CodeNfromSite`,
    defaultMessage: `Секретный Shamir's Secret-Share код #{number} от сайта {sitehost}`,
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
      copyUsed: false,
      saveUsed: false,
      sendUsed: false,
      sharededSecrets: {  // Части ключа, сохраненные, скопированные или расшаренные
        0: false,
        1: false,
        2: false,
      }
    }
  }

  handleGoToConfirm = () => {
    localStorage.setItem(constants.privateKeyNames.twentywords, '-')
    localStorage.setItem(constants.privateKeyNames.shamirsMnemonics, '-')
    localStorage.setItem(constants.privateKeyNames.shamirsSecrets, '-')
    actions.backupManager.serverCleanupSeed()
    this.setState({
      step: `ready`,
    })
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

    actions.modals.close(constants.modals.SaveWalletSelectMethod)
    actions.modals.close(name)
  }

  handleFinish = () => {
    feedback.backup.finished()
    this.handleClose()
  }

  createDownload = (filename, text) => {
    const element = document.createElement('a')
    const message = 'Check your browser downloads'

    element.setAttribute('href', `data:text/plaincharset=utf-8,${encodeURIComponent(text)}`)
    element.setAttribute('download', `${filename}_${moment().format('DD.MM.YYYY')}.txt`)

    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    actions.notifications.show(constants.notifications.Message, {
      message,
    })
  }

  markCodeShared = (secretNumber) => {
    const { sharededSecrets } = this.state
    this.setState({
      sharededSecrets: {
        ...sharededSecrets,
        [`${secretNumber}`]: true,
      }
    })
  }

  renderShareSecret = (secretNumber) => {
    const {
      shamirsSecretKeys,
      sharededSecrets,
      copyUsed,
      saveUsed,
      sendUsed,
    } = this.state


    const text = `Shamir's Secret-Share code #${secretNumber+1} from ${document.location.hostname}\n` +
      `${shamirsSecretKeys[secretNumber]}\n` +
      `Don't Lose This Code.`
    return (
      <div styleName="sharedSecret">
        <div styleName="sharedSecretKey">
          <span>
            <FormattedMessage
              {...langLabels.codeNfromSite}
              values={{
                number: (secretNumber+1),
                sitehost: window.location.hostname,
              }}
            />
          </span>
          <span>{shamirsSecretKeys[secretNumber]}</span>
        </div>
        <div styleName="sharedSecretButtons">
          {copyUsed ? (
            <Button disabled={true} blue>
              <FormattedMessage {...langLabels.useCopy} />
            </Button>
          ) : (
            <Copy text={text} onCopy={() => {
              this.markCodeShared(secretNumber)
              /* this.setState({ copyUsed: true }) */
            }}>
              <Button blue>
                <FormattedMessage {...langLabels.useCopy} />
              </Button>
            </Copy>
          )}
          <Button disabled={saveUsed} blue onClick={() => {
            this.createDownload(`shamirs_secret_key_${secretNumber+1}_${document.location.hostname}`,text)
            this.markCodeShared(secretNumber)
            /* this.setState({ saveUsed: true }) */
          }}>
            <FormattedMessage {...langLabels.useSave} />
          </Button>
          {(sendUsed) ? (
            <Button disabled={true} blue>
              <FormattedMessage {...langLabels.useSend} />
            </Button>
          ) : (
            <a href={'mailto:x@y.com?body=' + encodeURI(text) + '&subject=' + encodeURIComponent(`Shamir's Secret-Share code #${secretNumber+1} from ${document.location.hostname}`)}>
              <Button blue onClick={() => {
                this.markCodeShared(secretNumber)
                /* this.setState({ sendUsed: true }) */
              }}>
                <FormattedMessage {...langLabels.useSend} />
              </Button>
            </a>
          )}
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
      sharededSecrets,
    } = this.state

    const canContinue = !(sharededSecrets[0] && sharededSecrets[1] && sharededSecrets[2])
    const totalSaved = ((sharededSecrets[0]) ? 1 : 0) + ((sharededSecrets[1]) ? 1 : 0) + ((sharededSecrets[2]) ? 1 : 0)

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
                <Button gray onClick={this.handleClose}>
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
              </div>
              <div>
                <FormattedMessage
                  {...langLabels.countSecretsSaved}
                  values={{
                    saved: totalSaved,
                    total: 3,
                  }}
                />
              </div>
              <div styleName="mnemonicButtonsWrapper">
                <div styleName="continueBtnWrapper">
                  <Button brand disabled={canContinue} onClick={this.handleGoToConfirm}>
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
