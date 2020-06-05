import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './RegisterPINProtected.scss'


import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { isMobile } from 'react-device-detect'

import typeforce from 'swap.app/util/typeforce'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import CopyToClipboard from 'react-copy-to-clipboard'
import moment from 'moment/moment'
import finishSvg from './images/finish.svg'



@injectIntl
@connect(({ user: { btcData, btcMultisigPinData } }) => ({
  btcData,
  btcMultisigPinData,
}))
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
export default class RegisterPINProtected extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object
  };

  constructor(props) {
    super(props)


    const generatedKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKeyGenerated)

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicSaved = true //(mnemonic === `-`)
    const useGeneratedKeyEnabled = !(!generatedKey)


    let step = 'enterPinCode'
    if (useGeneratedKeyEnabled && !mnemonicSaved) step = 'saveMnemonicWords'

    this.state = {
      pinCode: '',
      pinCodeConfirm: '',
      step,
      error: false,
      isShipped: false,
      showFinalInstruction: false,
      useGeneratedKey: useGeneratedKeyEnabled,
      generatedKey,
      useGeneratedKeyEnabled,
      mnemonicSaved,
      mnemonic: actions.btc.getRandomMnemonicWords(),
      mnemonicWallet: false,
      isMnemonicCopied: false,
      isMnemonicGenerated: false,
      isMnemonicValid: true,
      isWalletLockedOtherPin: false,
      isInstructionCopied: false,
      isInstructionDownloaded: false,
    }
  }

  handleCheckPin = async () => {
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
      if (version === '2of3' && !actions.btc.validateMnemonicWords(mnemonic.trim())) {
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
        error: <FormattedMessage id='registerSMS_NotValidPhone' defaultMessage='Укажите номер телефона' />,
      })
      return
    }

    this.setState({
      isShipped: true,
      error: false,
    })

    const result = await actions.btcmultisig.beginRegisterSMS(
      phone,
      (mnemonic) ? mnemonic.trim() : false,
      (useGeneratedKey && useGeneratedKeyEnabled) ? generatedKey : false
    )

    if (result && result.answer && result.answer == 'ok') {
      this.setState({
        isShipped: false,
        step: 'enterCode',
      })
    } else {
      console.log("One step set", result)
      const smsServerOffline = (result === false)
      this.setState({
        isShipped: false,
        error: (result && result.error) ? result.error : 'Unknown error',
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
        error: <FormattedMessage id='RegisterSMSProtected_SmsCodeRequery' defaultMessage='Введите смс-код' />,
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
      (mnemonic) ? mnemonic.trim() : false,
      (useGeneratedKey && useGeneratedKeyEnabled) ? generatedKey : false
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
          const smsServerOffline = (result === false)
          this.setState({
            isShipped: false,
            smsServerOffline,
            error: (result && result.error) ? result.error : 'Unknown error',
          })
        }
      }
    }
  };

  handleRestoreWallet = async () => {
    const {
      mnemonic,
    } = this.state

    if (!mnemonic || !actions.btc.validateMnemonicWords(mnemonic.trim())) {
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
    this.setState({
      isMnemonicCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isMnemonicCopied: false,
        })
      }, 1000)
    })
  }

  handleCopyInstruction = async () => {
    this.setState({
      isInstructionCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isInstructionCopied: false,
        })
      }, 1000)
    })
  }

  handleDownloadInstruction = async () => {
    const {
      restoreInstruction,
    } = this.state

    this.setState({
      isInstructionDownloaded: true,
    }, () => {
      const element = document.createElement('a')
      const message = 'Check your browser downloads'

      element.setAttribute('href', `data:text/plaincharset=utf-8,${encodeURIComponent(restoreInstruction)}`)
      element.setAttribute('download', `${window.location.hostname}_btc_sms_protected_keys_${moment().format('DD.MM.YYYY')}.txt`)

      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      setTimeout(() => {
        this.setState({
          isInstructionDownloaded: false,
        })
      }, 1000)
    })
  }

  handleGenerateMnemonic = async () => {
    this.setState({
      isMnemonicGenerated: true,
      isMnemonicValid: true,
      mnemonic: actions.btc.getRandomMnemonicWords(),
    }, () => {
      setTimeout(() => {
        this.setState({
          isMnemonicGenerated: false,
        })
      }, 1000)
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
    actions.modals.open(constants.modals.SaveMnemonicModal, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicSaved = (mnemonic === `-`)
        const step = (mnemonicSaved) ? 'enterPhoneAndMnemonic' : 'saveMnemonicWords'

        this.setState({
          mnemonicSaved,
          step,
        })
      }
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
    const {
      mnemonic,
      mnemonicWallet,
      useGeneratedKey,
    } = this.state

    const {
      btcData,
      btcMultisigSMSData,
    } = this.props

    let restoreInstruction = ''

    restoreInstruction = `Wallet address:\r\n`
    restoreInstruction+= `${btcMultisigSMSData.address}\r\n`
    restoreInstruction+= `To withdraw funds create transaction using this code https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/transactions.spec.ts#L193\r\n`
    restoreInstruction+= `\r\n`
    restoreInstruction+= `Public keys for create Multisig (2of3) wallet:\r\n`
    if (btcMultisigSMSData.publicKeys[0]) restoreInstruction+=`${btcMultisigSMSData.publicKeys[0].toString('Hex')}\r\n`
    if (btcMultisigSMSData.publicKeys[1]) restoreInstruction+=`${btcMultisigSMSData.publicKeys[1].toString('Hex')}\r\n`
    if (btcMultisigSMSData.publicKeys[2]) restoreInstruction+=`${btcMultisigSMSData.publicKeys[2].toString('Hex')}\r\n`
    restoreInstruction+= `\r\n`
    restoreInstruction+= `Hot wallet private key (WIF):\r\n`
    restoreInstruction+= `${btcData.privateKey}\r\n`
    restoreInstruction+= `*** (this private key stored in your browser)\r\n`
    restoreInstruction+= `\r\n`
    if (!useGeneratedKey) {
      restoreInstruction+= `Secret mnemonic:\r\n`
      restoreInstruction+= `${mnemonic}\r\n`
      restoreInstruction+= `Wallet delivery path for mnemonic:\r\n`
      restoreInstruction+= `m/44'/0'/0'/0/0\r\n`
      restoreInstruction+= `Private key (WIF) of wallet, generated from mnemonic:\r\n`
      restoreInstruction+= `(DELETE THIS LINE!) ${mnemonicWallet.WIF}\r\n`
      restoreInstruction+= `*** (this private key does not stored anywhere! but in case if our  2fa server does down, you can withdraw your fond using this private key)\r\n`
    }
    restoreInstruction+= `If our service is unavailable, use a local copy of the wallet.\r\n`
    restoreInstruction+= `https://swaponline.github.io/2fa_wallet.zip\r\n`

    this.setState({
      restoreInstruction,
    })
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
      isMnemonicCopied,
      isMnemonicGenerated,
      isMnemonicValid,
      pinServerOffline,
      isWalletLockedOtherPhone,
      isInstructionCopied,
      isInstructionDownloaded,
      restoreInstruction,
      showFinalInstruction,
    } = this.state

    const {
      name,
      intl,
      btcData,
      btcMultisigPinData,
    } = this.props

    const linked = Link.all(this, 'pinCode', 'pinCodeConfirm', 'mnemonic')

    const langs = defineMessages({
      registerPinModal: {
        id: "registerPINProtectedTitle",
        defaultMessage: `Activate PIN Protected Wallet`,
      },
      mnemonicPlaceholder: {
        id: 'registerPinMnemoPlaceHolder',
        defaultMessage: `12 слов`,
      },
      pinCodePlaceHolder: {
        id: 'registerPinModalCodePlaceholder',
        defaultMessage: `Enter your pin code`,
      },
      pinCodeConfirmPlaceHolder: {
        id: 'registerPinModalCodeConfirmPlaceholder',
        defaultMessage: `Confirm your pin code`,
      },
      needSaveMnemonicToContinue: {
        id: 'registerPIN_YouNeedSaveMnemonic',
        defaultMessage: `Для активации 2fa вы должны сохранить 12 слов.`,
      },
      pleaseSaveMnemonicToContinue: {
        id: 'registerPIN_SaveYourMnemonic',
        defaultMessage: `Пожалуйста сохраните свою секретную фразу.`
      },
      buttonSaveMnemonic: {
        id: 'registerPIN_ButtonSaveMnemonic',
        defaultMessage: `Save`,
      },
      buttonCancel: {
        id: 'registerPIN_ButtonCancel',
        defaultMessage: `Cancel`,
      },
    });

    return (
      <Modal name={name} title={`${intl.formatMessage(langs.registerPinModal)}`}>
        <div styleName="registerPINModalHolder">
          {step === 'saveMnemonicWords' && (
            <Fragment>
              <div styleName="content-overlay">
                <p styleName="centerInfoBlock">
                  <strong>
                    <FormattedMessage { ...langs.needSaveMnemonicToContinue } />
                  </strong>
                  <br />
                  <FormattedMessage { ...langs.pleaseSaveMnemonicToContinue } />
                </p>
              </div>

              <div styleName="buttonsHolder buttonsHolder_2_buttons button-overlay">
                <Button blue onClick={this.handleBeginSaveMnemonic}>
                  <FormattedMessage { ...langs.buttonSaveMnemonic } />
                </Button>
                <Button gray onClick={this.handleClose}>
                  <FormattedMessage { ...langs.buttonCancel } />
                </Button>
              </div>
            </Fragment>
          )}
          {step === 'enterPinCode' && (
            <Fragment>
              <p styleName="centerInfoBlock">
                <strong>
                  <FormattedMessage { ...langs.needSaveMnemonicToContinue } />
                </strong>
                <br />
                <FormattedMessage { ...langs.pleaseSaveMnemonicToContinue } />
              </p>
              <div styleName="highLevel" className="ym-hide-content">
                <FieldLabel label>
                  <FormattedMessage id="registerPinModalPinCode" defaultMessage="Your PIN-code:" />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25"
                  valueLink={linked.pinCode}
                  placeholder={`${intl.formatMessage(langs.pinCodePlaceHolder)}`}
                  focusOnInit
                />
              </div>
              <div styleName="highLevel" className="ym-hide-content">
                <FieldLabel label>
                  <FormattedMessage id="registerPinModalPinCodeConfirm" defaultMessage="Confirm your PIN-code:" />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25"
                  valueLink={linked.pinCodeConfirm}
                  placeholder={`${intl.formatMessage(langs.pinCodeConfirmPlaceHolder)}`}
                  focusOnInit
                />
                {error && <div styleName="rednote">{error}</div>}
              </div>
              <Button blue big fullWidth disabled={isShipped} onClick={this.handleCheckPIN}>
                {isShipped ? (
                  <Fragment>
                    <FormattedMessage id="registerPinModalProcess" defaultMessage="Processing ..." />
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormattedMessage id="registerPinModalActivateWallet" defaultMessage="Activate Wallet" />
                  </Fragment>
                )}
              </Button>
            </Fragment>
          )}
          {step === "ready" && (
            <Fragment>
              <div styleName="highLevel">
                <div>
                  <img styleName="finishImg" src={finishSvg} alt="finish" />
                </div>
                <span style={{ fontSize: "25px", display: "block", textAlign: "center", marginBottom: "40px" }}>
                  <FormattedMessage id="registerPINModalReady" defaultMessage="Your protected wallet activated" />
                </span>
              </div>
              {showFinalInstruction && (
                <div styleName="restoreInstruction" className="ym-hide-content">
                  <h1>
                    <FormattedMessage id="registerPinModalFinishSaveThisInfo" defaultMessage="Информация на случай недоступности нашего сервиса" />
                  </h1>
                  <div>
                    <pre>{restoreInstruction}</pre>
                    <a styleName="link" target="_blank" href="https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/addresses.spec.ts">
                      <FormattedMessage id="registerPin_LinkToManualRestore" defaultMessage="How to withdraw money manually" />
                    </a>
                  </div>
                  <div styleName="buttonsHolder">
                    <CopyToClipboard
                      text={restoreInstruction}
                      onCopy={this.handleCopyInstruction}
                    >
                      <Button blue disabled={isInstructionCopied} onClick={this.handleCopyInstruction}>
                        {isInstructionCopied ? (
                          <FormattedMessage id='registerPinModalInstCopied' defaultMessage='Скопировано' />
                        ) : (
                          <FormattedMessage id='registerPinModalInstCopy' defaultMessage='Скопировать' />
                        )}
                      </Button>
                    </CopyToClipboard>
                    <Button blue disabled={isInstructionDownloaded} onClick={this.handleDownloadInstruction}>
                      {isInstructionDownloaded ? (
                        <FormattedMessage id='registerPinModalInstDownloaded' defaultMessage='Загружается' />
                      ) : (
                        <FormattedMessage id='registerPinModalInstDownload' defaultMessage='Скачать' />
                      )}
                    </Button>
                    <Button blue onClick={this.handleShareInstruction}>
                      <FormattedMessage id="registerPin_ShareInstruction" defaultMessage="Share" />
                    </Button>
                  </div>
                </div>
              )}
              <Button big blue fullWidth onClick={this.handleFinish}>
                <Fragment>
                  <FormattedMessage id="registerPinModalFinish" defaultMessage="Finish" />
                </Fragment>
              </Button>
            </Fragment>
          )}
        </div>
      </Modal>
    );
  }
}
