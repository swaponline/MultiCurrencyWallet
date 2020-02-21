import React, { Fragment } from "react";
import PropTypes from "prop-types";
import helpers, { constants } from "helpers";
import actions from "redux/actions";
import Link from "sw-valuelink";
import { connect } from "redaction";
import config from "app-config";

import cssModules from "react-css-modules";
import styles from "../Styles/default.scss";
import ownStyle from './RegisterSMSProtected.scss'


import { BigNumber } from "bignumber.js";
import Modal from "components/modal/Modal/Modal";
import FieldLabel from "components/forms/FieldLabel/FieldLabel";
import Input from "components/forms/Input/Input";
import Button from "components/controls/Button/Button";
import Tooltip from "components/ui/Tooltip/Tooltip";
import { FormattedMessage, injectIntl, defineMessages } from "react-intl";
import ReactTooltip from "react-tooltip";
import { isMobile } from "react-device-detect";

import typeforce from "swap.app/util/typeforce";
// import { isCoinAddress } from 'swap.app/util/typeforce'
import minAmount from "helpers/constants/minAmount";
import { inputReplaceCommaWithDot } from "helpers/domUtils";
import CopyToClipboard from 'react-copy-to-clipboard'
import moment from 'moment/moment'


@injectIntl
@connect(({ user: { btcData, btcMultisigSMSData } }) => ({
  btcData,
  btcMultisigSMSData,
}))
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
export default class RegisterSMSProtected extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object
  };

  constructor(props) {
    super(props)

    let {
      data: {
        version,
      },
    } = this.props

    version = (version) ? version : '2of3', // 2of2

    this.state = {
      version,
      phone: '',
      step: 'enterPhoneAndMnemonic',//"enterPhone",
      error: false,
      smsCode: "",
      smsConfirmed: false,
      isShipped: false,
      mnemonic: (version === '2of3') ? actions.btc.getRandomMnemonicWords() : false,
      mnemonicWallet: false,
      isMnemonicCopied: false,
      isMnemonicGenerated: false,
      isMnemonicValid: true,
      isWalletLockedOtherPhone: false,
      isInstructionCopied: false,
      isInstructionDownloaded: false,
    };
  }

  handleSendSMS = async () => {
    const {
      version,
      phone,
      mnemonic,
    } = this.state

    if (version === '2of3' && !actions.btc.validateMnemonicWords(mnemonic.trim())) {
      this.setState({
        isMnemonicValid: false,
        error: false,
      })
      return
    } else {
      const mnemonicWallet = actions.btc.getWalletByWords(mnemonic.trim())
      this.setState({
        mnemonicWallet,
        isMnemonicValid: true,
      })
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
    const result = await actions.btcmultisig.beginRegisterSMS(phone, (mnemonic) ? mnemonic.trim() : false)

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

    const result = await actions.btcmultisig.confirmRegisterSMS(phone, smsCode, (mnemonic) ? mnemonic.trim() : false)

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
      const mnemonicWallet = actions.btc.getWalletByWords(mnemonic.trim())
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

  generateRestoreInstruction = () => {
    const {
      mnemonic,
      mnemonicWallet,
    } = this.state

    const {
      btcData,
      btcMultisigSMSData,
    } = this.props

    let restoreInstruction = ''

    restoreInstruction = `Wallet address:\r\n`
    restoreInstruction+= `${btcMultisigSMSData.address}\r\n`
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
    restoreInstruction+= `Secret mnemonic:\r\n`
    restoreInstruction+= `${mnemonic}\r\n`
    restoreInstruction+= `Wallet delivery path for mnemonic:\r\n`
    restoreInstruction+= `m/44'/0'/0'/0/0\r\n`
    restoreInstruction+= `Private key (WIF) of wallet, generated from mnemonic:\r\n`
    restoreInstruction+= `${mnemonicWallet.WIF}\r\n`
    restoreInstruction+= `*** (this private key does not stored anywhere! but in case if our  2fa server does down, you can withdraw your fond using this private key)\r\n`

    this.setState({
      restoreInstruction,
    })
  }

  render() {
    const {
      step,
      phone,
      error,
      smsCode,
      smsConfirmed,
      isShipped,
      mnemonic,
      mnemonicWallet,
      isMnemonicCopied,
      isMnemonicGenerated,
      isMnemonicValid,
      smsServerOffline,
      isWalletLockedOtherPhone,
      isInstructionCopied,
      isInstructionDownloaded,
      restoreInstruction,
    } = this.state

    const {
      name,
      intl,
      btcData,
      btcMultisigSMSData,
    } = this.props

    console.log('sms modal props', this.props)
    const linked = Link.all(this, 'phone', 'smsCode', 'mnemonic')

    const langs = defineMessages({
      registerSMSModal: {
        id: "registerSMSProtectedTitle",
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
    });

    return (
      <Modal name={name} title={`${intl.formatMessage(langs.registerSMSModal)}`}>
        <div styleName='registerSMSModalHolder'>
          {step === 'enterPhoneAndMnemonic' && (
            <Fragment>
              <div styleName="highLevel">
                <FieldLabel label>
                  <FormattedMessage id="registerSMSModalPhone" defaultMessage="Your phone:" />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25"
                  valueLink={linked.phone}
                  placeholder={`${intl.formatMessage(langs.phonePlaceHolder)}`}
                  focusOnInit
                />
              </div>
              <div styleName="highLevel">
                <div styleName='infoCaption'>
                  <FormattedMessage id='registerSMSWordsInfoBlock' defaultMessage='Сгенерируйте секретную фразу или укажите ранее сохраненную для восстановления старого кошелька' />
                </div>
              </div>
              <div styleName="highLevel">
                <FieldLabel label>
                  <FormattedMessage id="registerSMSModalWords" defaultMessage="Секретная фраза (12 слов):" />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25 for12words"
                  valueLink={linked.mnemonic}
                  multiline={true}
                  placeholder={`${intl.formatMessage(langs.mnemonicPlaceholder)}`}
                />
                <div styleName='mnemonicButtonsHolder'>
                  <Button blue fullWidth disabled={isMnemonicGenerated} onClick={this.handleGenerateMnemonic}>
                    {isMnemonicGenerated ? (
                      <FormattedMessage id='registerSMSModalMnemonicGenerateNewGenerated' id='Создана'/>
                    ) : (
                      <FormattedMessage id='registerSMSModalMnemonicGenerateNew' id='Создать новую'/>
                    )}
                  </Button>
                  <CopyToClipboard
                    text={mnemonic}
                    onCopy={this.handleCopyMnemonic}
                  >
                    <Button blue fullWidth disabled={isMnemonicCopied} onClick={this.handleCopyMnemonic}>
                      {isMnemonicCopied ? (
                        <FormattedMessage id='registerSMSModalMnemonicCopied' id='Фраза скопирована' />
                      ) : (
                        <FormattedMessage id='registerSMSModalMnemonicCopy' id='Скопировать' />
                      )}
                    </Button>
                  </CopyToClipboard>
                </div>
                <div styleName='notice mnemonicNotice'>
                  <FormattedMessage id='registerSMSMnemonicNotice' defaultMessage='Она поможет разблокировать средства на кошельке, если сервер 2fa будет не доступен' />
                </div>
                {!isMnemonicValid && (
                  <div styleName='rednotes mnemonicNotice'>
                    <FormattedMessage id='registerSMSMnemonicError' defaultMessage='Вы указали не валидный набор слов' />
                  </div>
                )}
                
                {(smsServerOffline) ? (
                  <Fragment>
                    <Button blue fullWidth disabled={isShipped} onClick={this.handleRestoreWallet}>
                      <FormattedMessage id="registerSMSAddOffline" defaultMessage="Восстановить кошелек" />
                    </Button>
                    <hr />
                  </Fragment>
                ) : (
                  <Fragment>
                    {error && <div styleName='rednotes mnemonicNotice'>{error}</div>}
                  </Fragment>
                )}
              </div>
              <Button blue big fullWidth disabled={isShipped || !isMnemonicValid} onClick={this.handleSendSMS}>
                {isShipped ? (
                  <Fragment>
                    <FormattedMessage id="registerSMSModalProcess" defaultMessage="Processing ..." />
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormattedMessage id="registerSMSModalSendSMS" defaultMessage="Send SMS" />
                  </Fragment>
                )}
              </Button>
            </Fragment>
          )}
          {step === "enterPhone" && (
            <Fragment>
              <div styleName="highLevel">
                <FieldLabel label>
                  <FormattedMessage id="registerSMSModalPhone" defaultMessage="Your phone:" />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25"
                  valueLink={linked.phone}
                  placeholder={`${intl.formatMessage(langs.mnemonicPlaceholder)}`}
                  focusOnInit
                />
                {error && <div styleName="rednote">{error}</div>}
              </div>
              <Button blue big fullWidth disabled={isShipped} onClick={this.handleSendSMS}>
                {isShipped ? (
                  <Fragment>
                    <FormattedMessage id="registerSMSModalProcess" defaultMessage="Processing ..." />
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormattedMessage id="registerSMSModalSendSMS" defaultMessage="Send SMS" />
                  </Fragment>
                )}
              </Button>
            </Fragment>
          )}
          {step === "enterCode" && (
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
                <FieldLabel label>
                  <FormattedMessage id="registerSMSModalCode" defaultMessage="Enter code from SMS:" />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25"
                  valueLink={linked.smsCode}
                  focusOnInit
                  placeholder={`${intl.formatMessage(langs.smsPlaceHolder)}`}
                />
              </div>
              <Button styleName="confirmSmsCode" big blue fullWidth disabled={isShipped} onClick={this.handleCheckSMS}>
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
              <Button blue fullWidth disabled={isShipped} onClick={this.handleRestoreWallet}>
                <FormattedMessage id="registerSMSRestoryMnemonic" defaultMessage="Восстановить кошелек используя секретную фразу" />
              </Button>
            </Fragment>
          )}
          {step === "ready" && (
            <Fragment>
              <div styleName="highLevel">
                <span style={{ fontSize: "25px", display: "block", textAlign: "center", marginBottom: "40px" }}>
                  <FormattedMessage id="registerSMSModalReady" defaultMessage="Your protected wallet activated" />
                </span>
              </div>
              <div styleName="restoreInstruction">
                <h1>
                  <FormattedMessage id="registerSMSModalFinishInfoTitle" defaultMessage="Сохраните эту информацию" />
                </h1>
                <div>
                  <pre>{restoreInstruction}</pre>
                </div>
                <div styleName="buttonsHolder">
                  <CopyToClipboard
                    text={restoreInstruction}
                    onCopy={this.handleCopyInstruction}
                  >
                    <Button blue disabled={isInstructionCopied} onClick={this.handleCopyInstruction}>
                      {isInstructionCopied ? (
                        <FormattedMessage id='registerSMSModalInstCopied' id='Скопировано' />
                      ) : (
                        <FormattedMessage id='registerSMSModalInstCopy' id='Скопировать' />
                      )}
                    </Button>
                  </CopyToClipboard>
                  <Button blue disabled={isInstructionDownloaded} onClick={this.handleDownloadInstruction}>
                    {isInstructionDownloaded ? (
                      <FormattedMessage id='registerSMSModalInstDownloaded' id='Загружается' />
                    ) : (
                      <FormattedMessage id='registerSMSModalInstDownload' id='Скачать' />
                    )}
                  </Button>
                  <Button blue onClick={this.handleShareInstruction}>
                    <FormattedMessage id="registerSMS_ShareInstruction" defaultMessage="Share" />
                  </Button>
                </div>
              </div>
              <Button big blue fullWidth onClick={this.handleFinish}>
                <Fragment>
                  <FormattedMessage id="registerSMSModalFinish" defaultMessage="Finish" />
                </Fragment>
              </Button>
            </Fragment>
          )}
        </div>
      </Modal>
    );
  }
}
