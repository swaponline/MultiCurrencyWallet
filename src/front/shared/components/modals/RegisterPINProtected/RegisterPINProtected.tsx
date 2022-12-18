import React, { Fragment } from 'react'
import { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'

import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './RegisterPINProtected.scss'
import * as mnemonicUtils from 'common/utils/mnemonic'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import CopyToClipboard from 'react-copy-to-clipboard'
import moment from 'moment/moment'
import okSvg from 'shared/images/ok.svg'

const langPrefix = `RegisterPINProtectedBTC`

const langs = defineMessages({
  registerPinModal: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Activate PIN Protected Wallet`,
  },
  pinCodePlaceHolder: {
    id: `${langPrefix}_PinCodePlaceholder`,
    defaultMessage: `Enter your pin code`,
  },
  pinCodeConfirmPlaceHolder: {
    id: `${langPrefix}_PinCodeConfirmPlaceholder`,
    defaultMessage: `Confirm your pin code`,
  },
  needSaveMnemonicToContinue: {
    id: `${langPrefix}_YouNeedSaveMnemonic`,
    defaultMessage: `Для активации 2fa вы должны сохранить 12 слов.`,
  },
  pleaseSaveMnemonicToContinue: {
    id: `${langPrefix}_SaveYourMnemonic`,
    defaultMessage: `Пожалуйста сохраните свою секретную фразу.`,
  },
  buttonSaveMnemonic: {
    id: `${langPrefix}_ButtonSaveMnemonic`,
    defaultMessage: `Save`,
  },
  buttonCancel: {
    id: `${langPrefix}_ButtonCancel`,
    defaultMessage: `Cancel`,
  },
  enterPinCodeUpMessage: {
    id: `${langPrefix}_EnterPinCodeUpMessage`,
    defaultMessage: `Активация кошелька BTC, защищенного паролем`,
  },
  enterPinCodeBottomMessage: {
    id: `${langPrefix}_EnterPinCodeBottomMessage`,
    defaultMessage: `Придумайте пароль`,
  },
  youNotEnterPin: {
    id: `${langPrefix}_ErrorNoPinOrSmall`,
    defaultMessage: `Пароль должен быть не менее 4х символов`,
  },
  pinCodeNotEqueals: {
    id: `${langPrefix}_ErrorPinCodesNotEqueals`,
    defaultMessage: `Пароли не совпадают`,
  },
  pinServerOffline: {
    id: `${langPrefix}_PinServerOffline`,
    defaultMessage: `Сервер авторизации не доступен`,
  },
  useMnemonicNote: {
    id: `${langPrefix}_UseMnemonicRestoreNote`,
    defaultMessage: `Вы можете востановить кошелек используя секретную фразу (12 слов)`,
  },
  useMnemonicButton: {
    id: `${langPrefix}_UseMnemonicButton`,
    defaultMessage: `Восстановить кошелек`,
  },
  restoryUpMessage: {
    id: `${langPrefix}_RestoryUpMessage`,
    defaultMessage: `Восстановление BTC кошелька защещеного паролем`,
  },
  restoryBottomMessage: {
    id: `${langPrefix}_RestoryBottomMessage`,
    defaultMessage: `Введите секретную фразу (12 слов)`,
  },
  labelYourMnemonic: {
    id: `${langPrefix}_LabelYourMnemonic`,
    defaultMessage: `Ваша секретная фраза`,
  },
  mnemonicPlaceHolder: {
    id: `${langPrefix}_MnemonicPlaceholder`,
    defaultMessage: `Введите секретную фразу (12 слов)`,
  },
  shipButton: {
    id: `${langPrefix}_ShipButton`,
    defaultMessage: `Processing ...`,
  },
  confirmButton: {
    id: `${langPrefix}_ConfirmRestory`,
    defaultMessage: `Восстановить кошелек`,
  },
  usepinButton: {
    id: `${langPrefix}_UsePinButton`,
    defaultMessage: `Использовать пароль`,
  },
  activateWallet: {
    id: `${langPrefix}_ActivateWalletButton`,
    defaultMessage: `Активировать кошелек`,
  },
  errorWalletLocked: {
    id: `${langPrefix}_ErrorWalletLocked`,
    defaultMessage: `Этот счет уже зарегистрирован и защищен другим паролем. Укажите правильный пароль`,
  },
  labelYourPin: {
    id: `${langPrefix}_LabelYourPinCode`,
    defaultMessage: `Your PIN-code`,
  },
  labelConfirmYourPin: {
    id: `${langPrefix}_LabelConfirmYourPin`,
    defaultMessage: `Confirm your PIN-code`,
  },
  buttonFinish: {
    id: `${langPrefix}_ButtonFinish`,
    defaultMessage: `Готово`,
  },
  buttonCopiedInstruction: {
    id: `${langPrefix}_Instruction_Copied`,
    defaultMessage: `Скопировано`,
  },
  buttonCopyInstruction: {
    id: `${langPrefix}_Instruction_Copy`,
    defaultMessage: `Скопировать`,
  },
  buttonDownloadingInstruction: {
    id: `${langPrefix}_Instruction_Downloading`,
    defaultMessage: `Загружается`,
  },
  buttonDownloadInstruction: {
    id: `${langPrefix}_Instruction_Download`,
    defaultMessage: `Скачать`,
  },
  buttonShare: {
    id: `${langPrefix}_Share`,
    defaultMessage: `Share`,
  },
  finishMessage: {
    id: `${langPrefix}_FinishMessage`,
    defaultMessage: `Your protected wallet activated`,
  },
  instructionMessage: {
    id: `${langPrefix}_Instruction_Message`,
    defaultMessage: `Информация на случай недоступности нашего сервиса`,
  },
  howToWithdraw: {
    id: `${langPrefix}_HowToWithdraw`,
    defaultMessage: `How to withdraw money manually`,
  },
  errorMnemonicInvalid: {
    id: `${langPrefix}_ErrorMnemonicInvalid`,
    defaultMessage: `Вы указали не валидную секретную фразу (12 слов)`,
  },
  errorMnemonicIncorrect: {
    id: `${langPrefix}_ErrorMnemonicIncorrect`,
    defaultMessage: `Указаная секретная фраза не подходит к этому кошельку`,
  },
})

@connect(({ user: { btcData, btcMultisigPinData } }) => ({
  btcData,
  btcMultisigPinData,
}))
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
class RegisterPINProtected extends React.Component<any, any> {
  constructor(props) {
    super(props)

    const {
      data: { initStep },
    } = props

    const generatedKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKeyGenerated)

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicSaved = mnemonic === `-`
    const useGeneratedKeyEnabled = !!generatedKey

    let step = 'enterPinCode'
    if (useGeneratedKeyEnabled && !mnemonicSaved) step = 'saveMnemonicWords'

    let showFinalInstruction = false
    if (initStep === 'export') {
      showFinalInstruction = true
      step = 'ready'
    }

    this.state = {
      pinCode: '',
      pinCodeConfirm: '',
      step,
      error: false,
      isShipped: false,
      showFinalInstruction,
      useGeneratedKey: useGeneratedKeyEnabled,
      generatedKey,
      useGeneratedKeyEnabled,
      mnemonicSaved,
      mnemonic: ``,
      mnemonicWallet: false,
      isMnemonicGenerated: false,
      isMnemonicValid: true,
      isWalletLockedOtherPin: false,
      isInstructionCopied: false,
      isInstructionDownloaded: false,
    }
  }

  componentDidMount() {
    this.generateRestoreInstruction()
  }

  handleRestoreWallet = async () => {
    const { mnemonic } = this.state

    this.setState(
      {
        error: false,
        isShipped: true,
      },
      async () => {
        if (!mnemonic || !mnemonicUtils.validateMnemonicWords(mnemonic)) {
          this.setState({
            error: <FormattedMessage {...langs.errorMnemonicInvalid} />,
            isShipped: false,
          })
          return
        }

        if (!actions.btcmultisig.checkPinCanRestory(mnemonic.trim())) {
          this.setState({
            error: <FormattedMessage {...langs.errorMnemonicIncorrect} />,
            isShipped: false,
          })
          return
        }

        await actions.btcmultisig.addPinWallet(mnemonic.trim())

        this.generateRestoreInstruction()

        this.setState({
          isShipped: false,
          step: 'ready',
        })
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

  handleUsePin = () => {
    this.setState({
      pinCode: ``,
      pinCodeConfirm: ``,
      step: `enterPinCode`,
      error: false,
      pinServerOffline: false,
    })
  }

  handleRestoreWalletStep = () => {
    this.setState({
      error: false,
      mnemonic: ``,
      pinServerOffline: false,
      step: `restory`,
    })
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

    actions.modals.open(constants.modals.Share, {
      title: `BTC Sms-protected wallet restory instruction`,
      link: restoreInstruction,
    })
  }

  handleBeginSaveMnemonic = async () => {
    actions.modals.open(constants.modals.SaveWalletSelectMethod, {
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
    const { mnemonic, mnemonicWallet, useGeneratedKey, generatedKey } = this.state

    const { btcData, btcMultisigPinData } = this.props

    let restoreInstruction = ''

    restoreInstruction = `Wallet address:\r\n`
    restoreInstruction += `${btcMultisigPinData.address}\r\n`
    restoreInstruction += `To withdraw funds create transaction using this code https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/transactions.spec.ts#L193\r\n`
    restoreInstruction += `\r\n`
    restoreInstruction += `Public keys for create Multisig (2of3) wallet:\r\n`
    if (btcMultisigPinData.publicKeys[0])
      restoreInstruction += `${btcMultisigPinData.publicKeys[0].toString('Hex')}\r\n`
    if (btcMultisigPinData.publicKeys[1])
      restoreInstruction += `${btcMultisigPinData.publicKeys[1].toString('Hex')}\r\n`
    if (btcMultisigPinData.publicKeys[2])
      restoreInstruction += `${btcMultisigPinData.publicKeys[2].toString('Hex')}\r\n`
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
  }

  handleCheckPIN = () => {
    const {
      pinCode,
      pinCodeConfirm,
      mnemonic,
      useGeneratedKey,
      useGeneratedKeyEnabled,
      generatedKey,
    } = this.state

    this.setState(
      {
        error: false,
        isShipped: true,
        pinServerOffline: false,
        isWalletLockedOtherPin: false,
      },
      async () => {
        if (!pinCode || pinCode.length < 4) {
          this.setState({
            error: <FormattedMessage {...langs.youNotEnterPin} />,
            isShipped: false,
          })
          return
        }
        if (pinCode != pinCodeConfirm) {
          this.setState({
            error: <FormattedMessage {...langs.pinCodeNotEqueals} />,
            isShipped: false,
          })
          return
        }
        const result = await actions.btcmultisig.registerPinWallet(
          pinCode,
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
            if (result && result.error == 'This wallet already locked by other pin code') {
              // Кошелек зарегистрирован на другой номер телефона
              // Может быть так, что человек потерял телефон или забыл его
              // Даем возможность подключить кошелек, чтобы если у клиента есть
              // валидный mnemonic - он мог разблокировать средства
              this.setState({
                isShipped: false,
                isWalletLockedOtherPin: true,
              })
            } else {
              const pinServerOffline = result === false
              this.setState({
                isShipped: false,
                pinServerOffline,
                error: result && result.error ? result.error : 'Unknown error',
              })
            }
          }
        }
      }
    )
  }

  render() {
    const {
      step,
      pinCode,
      pinCodeConfirm,
      error,
      isShipped,
      mnemonicSaved,
      // useGeneratedKey,
      useGeneratedKeyEnabled,
      mnemonic,
      mnemonicWallet,
      isMnemonicGenerated,
      isMnemonicValid,
      pinServerOffline,
      isWalletLockedOtherPin,
      isInstructionCopied,
      isInstructionDownloaded,
      restoreInstruction,
      showFinalInstruction,
    } = this.state

    const { name, intl, btcData, btcMultisigPinData } = this.props

    const linked = Link.all(this, 'pinCode', 'pinCodeConfirm', 'mnemonic')

    return (
      <Modal name={name} title={`${intl.formatMessage(langs.registerPinModal)}`}>
        <div styleName="registerPINModalHolder">
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
          {step === 'restory' && (
            <Fragment>
              <p styleName="centerInfoBlock">
                <strong>
                  <FormattedMessage {...langs.restoryUpMessage} />
                </strong>
                <br />
                <FormattedMessage {...langs.restoryBottomMessage} />
              </p>
              <div styleName="highLevel" className="ym-hide-content">
                <FieldLabel>
                  <FormattedMessage {...langs.labelYourMnemonic} />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25"
                  valueLink={linked.mnemonic}
                  placeholder={`${intl.formatMessage(langs.mnemonicPlaceHolder)}`}
                  focusOnInit
                />
              </div>
              {error && <div styleName="error rednotes">{error}</div>}
              <div styleName="mnemonicButtonsHolder">
                <Button blue disabled={isShipped} onClick={this.handleRestoreWallet}>
                  {isShipped ? (
                    <Fragment>
                      <FormattedMessage {...langs.shipButton} />
                    </Fragment>
                  ) : (
                    <Fragment>
                      <FormattedMessage {...langs.confirmButton} />
                    </Fragment>
                  )}
                </Button>
                <Button blue disabled={isShipped} onClick={this.handleUsePin}>
                  <FormattedMessage {...langs.usepinButton} />
                </Button>
              </div>
            </Fragment>
          )}
          {step === 'enterPinCode' && (
            <Fragment>
              <p styleName="centerInfoBlock">
                <strong>
                  <FormattedMessage {...langs.enterPinCodeUpMessage} />
                </strong>
                <br />
                <FormattedMessage {...langs.enterPinCodeBottomMessage} />
              </p>
              {isWalletLockedOtherPin && (
                <div styleName="rednotes pinInfoBlock">
                  <FormattedMessage {...langs.errorWalletLocked} />
                </div>
              )}
              <div styleName="highLevel" className="ym-hide-content">
                <FieldLabel>
                  <FormattedMessage {...langs.labelYourPin} />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25"
                  valueLink={linked.pinCode}
                  type="password"
                  placeholder={`${intl.formatMessage(langs.pinCodePlaceHolder)}`}
                  focusOnInit
                />
              </div>
              <div styleName="highLevel" className="ym-hide-content">
                <FieldLabel>
                  <FormattedMessage {...langs.labelConfirmYourPin} />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25"
                  valueLink={linked.pinCodeConfirm}
                  type="password"
                  placeholder={`${intl.formatMessage(langs.pinCodeConfirmPlaceHolder)}`}
                />
                {!pinServerOffline && error && <div styleName="error rednotes">{error}</div>}
                {pinServerOffline && (
                  <div styleName="error rednotes">
                    <FormattedMessage {...langs.pinServerOffline} />
                  </div>
                )}
              </div>
              <div styleName="buttonHolder">
                <Button blue big fullWidth disabled={isShipped} onClick={this.handleCheckPIN}>
                  {isShipped ? (
                    <Fragment>
                      <FormattedMessage {...langs.shipButton} />
                    </Fragment>
                  ) : (
                    <Fragment>
                      <FormattedMessage {...langs.activateWallet} />
                    </Fragment>
                  )}
                </Button>
              </div>
              {pinServerOffline && (
                <div styleName="restoryHolder">
                  <p>
                    <FormattedMessage {...langs.useMnemonicNote} />
                  </p>
                  <Button blue fullWidth onClick={this.handleRestoreWalletStep}>
                    <FormattedMessage {...langs.useMnemonicButton} />
                  </Button>
                </div>
              )}
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
                  <FormattedMessage {...langs.finishMessage} />
                </span>
              </div>
              {showFinalInstruction && (
                <div styleName="restoreInstruction" className="ym-hide-content">
                  <h1>
                    <FormattedMessage {...langs.instructionMessage} />
                  </h1>
                  <div>
                    <pre>{restoreInstruction}</pre>
                    <a
                      styleName="link"
                      target="_blank"
                      href="https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/addresses.spec.ts"
                    >
                      <FormattedMessage {...langs.howToWithdraw} />
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
                          <FormattedMessage {...langs.buttonCopiedInstruction} />
                        ) : (
                          <FormattedMessage {...langs.buttonCopyInstruction} />
                        )}
                      </Button>
                    </CopyToClipboard>
                    <Button
                      blue
                      disabled={isInstructionDownloaded}
                      onClick={this.handleDownloadInstruction}
                    >
                      {isInstructionDownloaded ? (
                        <FormattedMessage {...langs.buttonDownloadingInstruction} />
                      ) : (
                        <FormattedMessage {...langs.buttonDownloadInstruction} />
                      )}
                    </Button>
                    <Button blue onClick={this.handleShareInstruction}>
                      <FormattedMessage {...langs.buttonShare} />
                    </Button>
                  </div>
                </div>
              )}
              <Button big blue fullWidth onClick={this.handleFinish}>
                <Fragment>
                  <FormattedMessage {...langs.buttonFinish} />
                </Fragment>
              </Button>
            </Fragment>
          )}
        </div>
      </Modal>
    )
  }
}

export default injectIntl(RegisterPINProtected)
