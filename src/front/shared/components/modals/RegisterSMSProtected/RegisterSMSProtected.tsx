import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'

import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './RegisterSMSProtected.scss'
import * as mnemonicUtils from 'common/utils/mnemonic'
import { isValidPhoneNumber } from 'react-phone-number-input'

import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import { PhoneInput } from 'components/forms/PhoneInput'
import Button from 'components/controls/Button/Button'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import CopyToClipboard from 'react-copy-to-clipboard'
import moment from 'moment/moment'
import okSvg from 'shared/images/ok.svg'


@connect(({ user: { btcData, btcMultisigSMSData } }) => ({
  btcData,
  btcMultisigSMSData,
}))
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
class RegisterSMSProtected extends React.Component<any, any> {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    let {
      data: { version, initStep },
    } = props

    version = version ? version : '2of3' // 2of2

    const generatedKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKeyGenerated)

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicSaved = mnemonic === `-`
    const useGeneratedKeyEnabled = !!generatedKey

    let step = 'enterPhoneAndMnemonic' // "enterPhone",
    if (useGeneratedKeyEnabled && !mnemonicSaved) step = 'saveMnemonicWords'

    let showFinalInstruction = false
    if (initStep === 'export') {
      showFinalInstruction = true
      step = 'ready'
    }

    this.state = {
      version,
      phone: window.DefaultCountryCode || '',
      step,
      error: false,
      smsCode: '',
      smsConfirmed: false,
      isShipped: false,
      showFinalInstruction,
      useGeneratedKey: useGeneratedKeyEnabled,
      generatedKey,
      useGeneratedKeyEnabled,
      mnemonicSaved,
      mnemonic: version === '2of3' ? mnemonicUtils.getRandomMnemonicWords() : false,
      mnemonicWallet: false,
      isMnemonicCopied: false,
      isMnemonicGenerated: false,
      isMnemonicValid: true,
      isWalletLockedOtherPhone: false,
      isInstructionCopied: false,
      isInstructionDownloaded: false,
    }
  }

  componentDidMount() {
    this.generateRestoreInstruction()
  }

  handleSendSMS = async () => {
    const {
      version,
      phone,
      mnemonic,
      generatedKey,
      useGeneratedKey,
      useGeneratedKeyEnabled,
    } = this.state

    if (!useGeneratedKey) {
      // Old - own mnemonic for unlock
      if (version === '2of3' && !mnemonicUtils.validateMnemonicWords(mnemonic)) {
        this.setState({
          isMnemonicValid: false,
          error: false,
        })
        return
      } else {
        const mnemonicWallet = actions.btc.getWalletByWords(mnemonic.trim(), 1)
        this.setState({
          mnemonicWallet,
          isMnemonicValid: true,
        })
      }
    }

    if (!phone) {
      this.setState({
        error: (
          <FormattedMessage
            id="registerSMS_NotValidPhone"
            defaultMessage="Укажите номер телефона"
          />
        ),
      })
      return
    }

    this.setState({
      isShipped: true,
      error: false,
    })

    const result = await actions.btcmultisig.beginRegisterSMS(
      phone,
      mnemonic ? mnemonic.trim() : false,
      useGeneratedKey && useGeneratedKeyEnabled ? generatedKey : false
    )

    if (result && result.answer && result.answer == 'ok') {
      this.setState({
        isShipped: false,
        step: 'enterCode',
      })
    } else {
      console.log('One step set', result)
      const smsServerOffline = result === false
      this.setState({
        isShipped: false,
        error: result && result.error ? result.error : 'Unknown error',
        smsServerOffline,
      })
    }
  }

  handleCheckSMS = async () => {
    const {
      phone,
      smsCode,
      mnemonic,
      useGeneratedKey,
      useGeneratedKeyEnabled,
      generatedKey,
    } = this.state

    if (!smsCode) {
      this.setState({
        error: (
          <FormattedMessage
            id="RegisterSMSProtected_SmsCodeRequery"
            defaultMessage="Введите смс-код"
          />
        ),
      })
      return
    }

    this.setState({
      isShipped: true,
      error: false,
      smsServerOffline: false,
      isWalletLockedOtherPhone: false,
    })

    const result = await actions.btcmultisig.confirmRegisterSMS(
      phone,
      smsCode,
      mnemonic ? mnemonic.trim() : false,
      useGeneratedKey && useGeneratedKeyEnabled ? generatedKey : false
    )

    if (result && result.answer && result.answer == 'ok') {
      this.generateRestoreInstruction()
      this.setState({
        isShipped: false,
        step: 'ready',
      })
    } else {
      if (result && result.error == 'Already registered') {
        this.generateRestoreInstruction()
        this.setState({
          isShipped: false,
          step: 'ready',
        })
      } else {
        if (result && result.error == 'This wallet already locked by other phone number') {
          // Кошелек зарегистрирован на другой номер телефона
          // Может быть так, что человек потерял телефон или забыл его
          // Даем возможность подключить кошелек, чтобы если у клиента есть
          // валидный mnemonic - он мог разблокировать средства
          this.setState({
            isShipped: false,
            isWalletLockedOtherPhone: true,
          })
        } else {
          const smsServerOffline = result === false
          this.setState({
            isShipped: false,
            smsServerOffline,
            error: result && result.error ? result.error : 'Unknown error',
          })
        }
      }
    }
  }

  handleRestoreWallet = async () => {
    const { mnemonic } = this.state

    if (!mnemonic || !mnemonicUtils.validateMnemonicWords(mnemonic)) {
      this.setState({
        isMnemonicValid: false,
        error: false,
      })
      return
    } else {
      const mnemonicWallet = actions.btc.getWalletByWords(mnemonic.trim(), 1)
      this.setState({
        mnemonicWallet,
        isShipped: true,
        isMnemonicValid: true,
      })
    }

    await actions.btcmultisig.addSMSWallet(mnemonic.trim())

    this.generateRestoreInstruction()

    this.setState({
      isShipped: false,
      step: 'ready',
    })
  }

  handleCopyMnemonic = async () => {
    this.setState(
      {
        isMnemonicCopied: true,
      },
      () => {
        setTimeout(() => {
          this.setState({
            isMnemonicCopied: false,
          })
        }, 1000)
      }
    )
  }

  handleCopyInstruction = async () => {
    this.setState(
      {
        isInstructionCopied: true,
      },
      () => {
        setTimeout(() => {
          this.setState({
            isInstructionCopied: false,
          })
        }, 1000)
      }
    )
  }

  handleDownloadInstruction = async () => {
    const { restoreInstruction } = this.state

    this.setState(
      {
        isInstructionDownloaded: true,
      },
      () => {
        const element = document.createElement('a')
        const message = 'Check your browser downloads'

        element.setAttribute(
          'href',
          `data:text/plaincharset=utf-8,${encodeURIComponent(restoreInstruction)}`
        )
        element.setAttribute(
          'download',
          `${window.location.hostname}_btc_sms_protected_keys_${moment().format('DD.MM.YYYY')}.txt`
        )

        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)

        setTimeout(() => {
          this.setState({
            isInstructionDownloaded: false,
          })
        }, 1000)
      }
    )
  }

  handleGenerateMnemonic = async () => {
    this.setState(
      {
        isMnemonicGenerated: true,
        isMnemonicValid: true,
        mnemonic: mnemonicUtils.getRandomMnemonicWords(),
      },
      () => {
        setTimeout(() => {
          this.setState({
            isMnemonicGenerated: false,
          })
        }, 1000)
      }
    )
  }

  handleFinish = async () => {
    const { name } = this.props

    actions.btcmultisig.enableWalletSMS()
    actions.modals.close(name)
    if (this.props.data.callback) {
      this.props.data.callback()
    }
  }

  handleShareInstruction = async () => {
    const { restoreInstruction } = this.state

    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.Share, {
      title: `BTC Sms-protected wallet restory instruction`,
      link: restoreInstruction,
    })
  }

  handleBeginSaveMnemonic = async () => {
    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.SaveMnemonicModal, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicSaved = mnemonic === `-`
        const step = mnemonicSaved ? 'enterPhoneAndMnemonic' : 'saveMnemonicWords'

        this.setState({
          mnemonicSaved,
          step,
        })
      },
    })
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

  generateRestoreInstruction = () => {
    // @ToDo - temp comment - find error, fix, and uncomment
    /*
    const { mnemonic, mnemonicWallet, useGeneratedKey } = this.state

    const { btcData, btcMultisigSMSData } = this.props

    let restoreInstruction = ''

    restoreInstruction = `Wallet address:\r\n`
    restoreInstruction += `${btcMultisigSMSData.address}\r\n`
    restoreInstruction += `To withdraw funds create transaction using this code https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/transactions.spec.ts#L193\r\n`
    restoreInstruction += `\r\n`
    restoreInstruction += `Public keys for create Multisig (2of3) wallet:\r\n`
    if (btcMultisigSMSData.publicKeys[0])
      restoreInstruction += `${btcMultisigSMSData.publicKeys[0].toString('Hex')}\r\n`
    if (btcMultisigSMSData.publicKeys[1])
      restoreInstruction += `${btcMultisigSMSData.publicKeys[1].toString('Hex')}\r\n`
    if (btcMultisigSMSData.publicKeys[2])
      restoreInstruction += `${btcMultisigSMSData.publicKeys[2].toString('Hex')}\r\n`
    restoreInstruction += `\r\n`
    restoreInstruction += `Hot wallet private key (WIF) (first of three for sign tx):\r\n`
    restoreInstruction += `Wallet delivery path from your secret phrase:\r\n`
    restoreInstruction += `m/44'/0'/0'/0/0\r\n`
    restoreInstruction += `${btcData.privateKey}\r\n`
    restoreInstruction += `*** (this private key stored in your browser)\r\n`
    restoreInstruction += `\r\n`
    if (!useGeneratedKey) {
      restoreInstruction += `Secret mnemonic:\r\n`
      restoreInstruction += `${mnemonic}\r\n`
      restoreInstruction += `Wallet delivery path for mnemonic:\r\n`
      restoreInstruction += `m/44'/0'/0'/0/0\r\n`
      restoreInstruction += `Private key (WIF) of wallet, generated from mnemonic:\r\n`
      restoreInstruction += `(DELETE THIS LINE!) ${mnemonicWallet.WIF}\r\n`
      restoreInstruction += `*** (this private key does not stored anywhere! but in case if our  2fa server does down, you can withdraw your fond using this private key)\r\n`
    } else {
      restoreInstruction += `Second of three for sign tx:\r\n`
      restoreInstruction += `Wallet delivery path from your secret phrase:\r\n`
      restoreInstruction += `m/44'/0'/0'/0/1\r\n`
      restoreInstruction += `\r\n`
    }
    restoreInstruction += `If our service is unavailable, use a local copy of the wallet.\r\n`
    restoreInstruction += `https://swaponline.github.io/2fa_wallet.zip\r\n`

    this.setState({
      restoreInstruction,
    })
    */
  }

  onPhoneChange = (phone) => {
    this.setState(() => ({ phone }))
  }

  render() {
    const {
      step,
      error,
      phone,
      isShipped,
      // useGeneratedKey,
      useGeneratedKeyEnabled,
      mnemonic,
      isMnemonicCopied,
      isMnemonicGenerated,
      isMnemonicValid,
      smsServerOffline,
      isWalletLockedOtherPhone,
      isInstructionCopied,
      isInstructionDownloaded,
      restoreInstruction,
      showFinalInstruction,
    } = this.state

    const { name, intl } = this.props

    const linked = Link.all(this, 'smsCode', 'mnemonic')

    const langs = defineMessages({
      registerSMSModal: {
        id: 'registerSMSProtectedTitle',
        defaultMessage: `Activate SMS Protected Wallet`,
      },
      mnemonicPlaceholder: {
        id: 'registerSMSMPlaceHolder',
        defaultMessage: `12 слов`,
      },
      phonePlaceHolder: {
        id: 'registerSMSModalPhonePlaceholder',
        defaultMessage: `Enter your phone`,
      },
      smsPlaceHolder: {
        id: 'registerSMSModalSmsCodePlaceholder',
        defaultMessage: `Enter code from SMS`,
      },
      needSaveMnemonicToContinue: {
        id: 'registerSMS_YouNeedSaveMnemonic',
        defaultMessage: `Для активации 2fa вы должны сохранить 12 слов.`,
      },
      pleaseSaveMnemonicToContinue: {
        id: 'registerSMS_SaveYourMnemonic',
        defaultMessage: `Пожалуйста сохраните свою секретную фразу.`,
      },
      buttonSaveMnemonic: {
        id: 'registerSMS_ButtonSaveMnemonic',
        defaultMessage: `Save`,
      },
      buttonCancel: {
        id: 'registerSMS_ButtonCancel',
        defaultMessage: `Cancel`,
      },
    })

    const sentBtnDisabled = isShipped || !phone || (phone && !isValidPhoneNumber(phone))
    return (
      //@ts-ignore: strictNullChecks
      <Modal name={name} title={`${intl.formatMessage(langs.registerSMSModal)}`}>
        <div styleName="registerSMSModalHolder">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .PhoneInputCountryIcon {
              width: 26px !important;
            }
          `,
            }}
          />
          {step === 'saveMnemonicWords' && (
            <Fragment>
              <div styleName="content-overlay">
                <p styleName="centerInfoBlock">
                  <strong>
                    <FormattedMessage {...langs.needSaveMnemonicToContinue} />
                  </strong>
                  <br />
                  <FormattedMessage {...langs.pleaseSaveMnemonicToContinue} />
                </p>
              </div>

              <div styleName="buttonsHolder buttonsHolder_2_buttons button-overlay">
                <Button blue onClick={this.handleBeginSaveMnemonic}>
                  <FormattedMessage {...langs.buttonSaveMnemonic} />
                </Button>
                <Button gray onClick={this.handleClose}>
                  <FormattedMessage {...langs.buttonCancel} />
                </Button>
              </div>
            </Fragment>
          )}
          {step === 'enterPhoneAndMnemonic' && (
            <Fragment>
              <PhoneInput
                value={phone}
                error={error}
                locale={intl.locale}
                onChange={this.onPhoneChange}
                placeholder={`${intl.formatMessage(langs.phonePlaceHolder)}`}
                label={
                  <FieldLabel>
                    <FormattedMessage id="registerSMSModalPhone" defaultMessage="Your phone:" />
                  </FieldLabel>
                }
              />
              {!useGeneratedKeyEnabled && (
                <Fragment>
                  <div styleName="highLevel">
                    <div styleName="infoCaption">
                      <FormattedMessage
                        id="registerSMSWordsInfoBlock"
                        defaultMessage="Сгенерируйте секретную фразу или укажите ранее сохраненную для восстановления старого кошелька"
                      />
                    </div>
                  </div>
                  <div styleName="highLevel" className="ym-hide-content">
                    <FieldLabel>
                      <FormattedMessage
                        id="registerSMSModalWords"
                        defaultMessage="Секретная фраза (12 слов):"
                      />
                    </FieldLabel>

                    <div styleName="mnemonicButtonsHolder">
                      <Button
                        blue
                        fullWidth
                        disabled={isMnemonicGenerated}
                        onClick={this.handleGenerateMnemonic}
                      >
                        {isMnemonicGenerated ? (
                          <FormattedMessage
                            id="registerSMSModalMnemonicGenerateNewGenerated"
                            defaultMessage="Создана"
                          />
                        ) : (
                          <FormattedMessage
                            id="registerSMSModalMnemonicGenerateNew"
                            defaultMessage="Создать новую"
                          />
                        )}
                      </Button>
                      <CopyToClipboard text={mnemonic} onCopy={this.handleCopyMnemonic}>
                        <Button
                          blue
                          fullWidth
                          disabled={isMnemonicCopied}
                          onClick={this.handleCopyMnemonic}
                        >
                          {isMnemonicCopied ? (
                            <FormattedMessage
                              id="registerSMSModalMnemonicCopied"
                              defaultMessage="Фраза скопирована"
                            />
                          ) : (
                            <FormattedMessage
                              id="registerSMSModalMnemonicCopy"
                              defaultMessage="Скопировать"
                            />
                          )}
                        </Button>
                      </CopyToClipboard>
                    </div>
                    <div styleName="notice mnemonicNotice">
                      <FormattedMessage
                        id="registerSMSMnemonicNotice"
                        defaultMessage="Она поможет разблокировать средства на кошельке, если сервер 2fa будет не доступен"
                      />
                    </div>
                    {!isMnemonicValid && (
                      <div styleName="rednotes mnemonicNotice">
                        <FormattedMessage
                          id="registerSMSMnemonicError"
                          defaultMessage="Вы указали не валидный набор слов"
                        />
                      </div>
                    )}
                  </div>
                </Fragment>
              )}
              <div>
                {smsServerOffline ? (
                  <Fragment>
                    <Button blue fullWidth disabled={isShipped} onClick={this.handleRestoreWallet}>
                      <FormattedMessage
                        id="registerSMSAddOffline"
                        defaultMessage="Восстановить кошелек"
                      />
                    </Button>
                    <hr />
                  </Fragment>
                ) : (
                  <Fragment>
                    {error && <div styleName="rednotes mnemonicNotice">{error}</div>}
                  </Fragment>
                )}
              </div>
              <Button blue big fullWidth disabled={sentBtnDisabled} onClick={this.handleSendSMS}>
                {isShipped ? (
                  <Fragment>
                    <FormattedMessage
                      id="registerSMSModalProcess"
                      defaultMessage="Processing ..."
                    />
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormattedMessage id="registerSMSModalSendSMS" defaultMessage="Send SMS" />
                  </Fragment>
                )}
              </Button>
            </Fragment>
          )}
          {step === 'enterPhone' && (
            <Fragment>
              <PhoneInput
                value={phone}
                error={error}
                locale={intl.locale}
                onChange={this.onPhoneChange}
                placeholder={`${intl.formatMessage(langs.phonePlaceHolder)}`}
                label={
                  <FieldLabel>
                    <FormattedMessage id="registerSMSModalPhone" defaultMessage="Your phone:" />
                  </FieldLabel>
                }
              />
              <Button blue big fullWidth disabled={sentBtnDisabled} onClick={this.handleSendSMS}>
                {isShipped ? (
                  <Fragment>
                    <FormattedMessage
                      id="registerSMSModalProcess"
                      defaultMessage="Processing ..."
                    />
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormattedMessage id="registerSMSModalSendSMS" defaultMessage="Send SMS" />
                  </Fragment>
                )}
              </Button>
            </Fragment>
          )}
          {step === 'enterCode' && (
            <Fragment>
              {error && <div styleName="rednotes smsInfoBlock">{error}</div>}
              {isWalletLockedOtherPhone && (
                <div styleName="rednotes smsInfoBlock">
                  <FormattedMessage
                    id="registerSMS_WalletLocked"
                    defaultMessage="Этот счет привязан к другому номеру телефона"
                  />
                </div>
              )}
              {smsServerOffline && (
                <div styleName="rednotes smsInfoBlock">
                  <FormattedMessage
                    id="registerSMS_ConfigServerOffline"
                    defaultMessage="Сервер авторизации не доступен. Попробуйте позже или используйте секретную фраза для разблокировки счета"
                  />
                </div>
              )}
              <div styleName="highLevel smsCodeHolder">
                <FieldLabel>
                  <FormattedMessage
                    id="registerSMSModalCode"
                    defaultMessage="Enter code from SMS:"
                  />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25"
                  valueLink={linked.smsCode}
                  focusOnInit
                  placeholder={`${intl.formatMessage(langs.smsPlaceHolder)}`}
                />
              </div>
              <Button
                styleName="confirmSmsCode"
                big
                blue
                fullWidth
                disabled={isShipped}
                onClick={this.handleCheckSMS}
              >
                {isShipped ? (
                  <FormattedMessage id="registerSMSModalProcess" defaultMessage="Processing ..." />
                ) : (
                  <FormattedMessage id="registerSMSModalSendSMS165" defaultMessage="Confirm" />
                )}
              </Button>
              <hr />
              <p styleName="notice">
                <FormattedMessage
                  id="registerSMS_MnemonicRestoreNotes"
                  defaultMessage="Если не приходит код подтверждения или у вас нет доступа к указаному номеру телефона, вы можете восстановить кошелек используя секретную фразу"
                />
              </p>
              <p styleName="notice">
                <FormattedMessage
                  id="registerSMS_MnemonicUseNotes"
                  defaultMessage="Используя секретную фразу, вы сможете разблокировать средства на счете"
                />
              </p>
              <p styleName="buttonContainer">
                <Button
                  blue
                  fullWidth
                  autoHeight
                  disabled={isShipped}
                  onClick={this.handleRestoreWallet}
                >
                  <FormattedMessage
                    id="registerSMSRestoryMnemonic"
                    defaultMessage="Восстановить кошелек используя секретную фразу"
                  />
                </Button>
              </p>
            </Fragment>
          )}
          {step === 'ready' && (
            <Fragment>
              <div styleName="highLevel">
                <div>
                  <img styleName="finishImg" src={okSvg} alt="finish" />
                </div>
                <span
                  style={{
                    fontSize: '25px',
                    display: 'block',
                    textAlign: 'center',
                    marginBottom: '40px',
                  }}
                >
                  <FormattedMessage
                    id="registerSMSModalReady"
                    defaultMessage="Your protected wallet activated"
                  />
                </span>
              </div>
              {showFinalInstruction && (
                <div styleName="restoreInstruction" className="ym-hide-content">
                  <h1>
                    <FormattedMessage
                      id="registerSMSModalFinishSaveThisInfo"
                      defaultMessage="Информация на случай недоступности нашего сервиса"
                    />
                  </h1>
                  <div>
                    <pre>{restoreInstruction}</pre>
                    <a
                      styleName="link"
                      target="_blank"
                      href="https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/addresses.spec.ts"
                    >
                      <FormattedMessage
                        id="registerSMS_LinkToManualRestore"
                        defaultMessage="How to withdraw money manually"
                      />
                    </a>
                  </div>
                  <div styleName="buttonsHolder">
                    <CopyToClipboard text={restoreInstruction} onCopy={this.handleCopyInstruction}>
                      <Button
                        blue
                        disabled={isInstructionCopied}
                        onClick={this.handleCopyInstruction}
                      >
                        {isInstructionCopied ? (
                          <FormattedMessage
                            id="registerSMSModalInstCopied"
                            defaultMessage="Скопировано"
                          />
                        ) : (
                          <FormattedMessage
                            id="registerSMSModalInstCopy"
                            defaultMessage="Скопировать"
                          />
                        )}
                      </Button>
                    </CopyToClipboard>
                    <Button
                      blue
                      disabled={isInstructionDownloaded}
                      onClick={this.handleDownloadInstruction}
                    >
                      {isInstructionDownloaded ? (
                        <FormattedMessage
                          id="registerSMSModalInstDownloaded"
                          defaultMessage="Загружается"
                        />
                      ) : (
                        <FormattedMessage
                          id="registerSMSModalInstDownload"
                          defaultMessage="Скачать"
                        />
                      )}
                    </Button>
                    <Button blue onClick={this.handleShareInstruction}>
                      <FormattedMessage id="registerSMS_ShareInstruction" defaultMessage="Share" />
                    </Button>
                  </div>
                </div>
              )}
              <Button big blue fullWidth onClick={this.handleFinish}>
                <Fragment>
                  <FormattedMessage id="registerSMSModalFinish" defaultMessage="Finish" />
                </Fragment>
              </Button>
            </Fragment>
          )}
        </div>
      </Modal>
    )
  }
}

export default injectIntl(RegisterSMSProtected)
