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


@injectIntl
@connect(({ user: { btcMultisigSMSData } }) => ({
  items: [btcMultisigSMSData]
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
      isMnemonicCopied: false,
      isMnemonicGenerated: false,
      isMnemonicValid: true,
    };
  }

  handleSendSMS = async () => {
    const {
      version,
      phone,
      mnemonic,
    } = this.state

    if (version === '2of3' && !actions.btc.validateMnemonicWords(mnemonic)) {
      this.setState({
        isMnemonicValid: false,
        error: false,
      })
      return
    } else {
      this.setState({ isMnemonicValid: true })
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
    const result = await actions.btcmultisig.beginRegisterSMS(phone, mnemonic)

    if (result && result.answer && result.answer == 'ok') {
      this.setState({
        isShipped: false,
        step: 'enterCode',
      })
    } else {
      this.setState({
        isShipped: false,
        error: (result && result.error) ? result.error : 'Unknown error',
      })
    }
  }

  handleCheckSMS = async () => {
    const {
      phone,
      smsCode,
      mnemonic
    } = this.state

    if (!smsCode) {
      this.setState({
        error: <FormattedMessage id='RegisterSMSProtected_SmsCodeRequery' defaultMessage='Введите смс-код' />,
      })
      return
    }

    this.setState({
      isShipped: true,
      error: false
    })

    const result = await actions.btcmultisig.confirmRegisterSMS(phone, smsCode, mnemonic)

    if (result && result.answer && result.answer == 'ok') {
      this.setState({
        isShipped: false,
        step: 'ready',
      })
    } else {
      if (result && result.error == 'Already registered') {
        this.setState({
          isShipped: false,
          step: 'ready',
        })
      } else {
        this.setState({
          isShipped: false,
          error: (result && result.error) ? result.error : 'Unknown error',
        })
      }
    }
  };


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
    const { name } = this.props;

    actions.btcmultisig.enableWalletSMS();
    actions.modals.close(name);
    if (this.props.data.callback) {
      this.props.data.callback();
    }
  };

  render() {
    const {
      step,
      phone,
      error,
      smsCode,
      smsConfirmed,
      isShipped,
      mnemonic,
      isMnemonicCopied,
      isMnemonicGenerated,
      isMnemonicValid,
    } = this.state

    const {
      name,
      intl,
    } = this.props

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
                {error && <div styleName='rednotes mnemonicNotice'>{error}</div>}
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
              <div styleName="highLevel">
                <FieldLabel label>
                  <FormattedMessage id="registerSMSModalCode" defaultMessage="Enter code from SMS:" />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25"
                  valueLink={linked.smsCode}
                  focusOnInit
                  placeholder={`${intl.formatMessage(langs.smsPlaceHolder)}`}
                />
                {error && <div styleName="rednote">{error}</div>}
              </div>
              <Button big blue fullWidth disabled={isShipped} onClick={this.handleCheckSMS}>
                {isShipped ? (
                  <FormattedMessage id="registerSMSModalProcess" defaultMessage="Processing ..." />
                ) : (
                  <FormattedMessage id="registerSMSModalSendSMS165" defaultMessage="Confirm" />
                )}
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
