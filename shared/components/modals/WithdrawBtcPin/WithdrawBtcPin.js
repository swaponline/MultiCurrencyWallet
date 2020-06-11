import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './WithdrawBtcPin.scss'


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
import redirectTo from 'helpers/redirectTo'


const langPrefix = `WithdrawPINProtected`

const langs = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Confirm withdraw transaction`,
  },
  upMessage: {
    id: `${langPrefix}_UpMessage`,
    defaultMessage: `Для подтверждения транзакции введите пароль`,
  },
  pinCodePlaceHolder: {
    id: `${langPrefix}_PinCodePlaceholder`,
    defaultMessage: `Enter your pin code`,
  },
  youNotEnterPin: {
    id: `${langPrefix}_ErrorNoPinOrSmall`,
    defaultMessage: `Пароль должен быть не менее 4х символов`,
  },
  pinCodeNotValid: {
    id: `${langPrefix}_PinCodeNotValid`,
    defaultMessage: `Вы указали не верный пароль`,
  },
  useMnemonic: {
    id: `${langPrefix}_UseMnemonicButton`,
    defaultMessage: `Использовать секретную фразу`,
  },
  confirmButton: {
    id: `${langPrefix}_Confirm`,
    defaultMessage: `Подтвердить транзакцию`,
  },
  shipButton: {
    id: `${langPrefix}_ShipButton`,
    defaultMessage: `Processing ...`,
  },
  cancelButton: {
    id: `${langPrefix}_Cancel`,
    defaultMessage: `Отмена`,
  },
})

@injectIntl
@connect(({ user: { btcData, btcMultisigPinData } }) => ({
  btcData,
  btcMultisigPinData,
}))
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
export default class WithdrawBtcPin extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object
  };

  constructor(props) {
    super(props)

    const {
      wallet,
      invoice,
      sendOptions,
      beforeBalances,
    } = props.data

    this.state = {
      pinCode: '',
      error: false,
      isShipped: false,
      mnemonic: '',
      isMnemonicValid: true,
      serverOffline: false,
      useMnemonic: false,
    }
  }

  handleFinish = async () => {
    const { name } = this.props

    actions.btcmultisig.enableWalletSMS()
    actions.modals.close(name)
    if (this.props.data.callback) {
      this.props.data.callback()
    }
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

  handleSend = async () => {
    const {
      pinCode,
    } = this.state
    
    const {
      data: {
        wallet,
        sendOptions,
        sendOptions: {
          amount,
        },
        invoice,
        adminFee,
        beforeBalances,
        onReady,
      },
    } = this.props

    this.setState({
      error: false,
      serverOffline: false,
      isShipped: true,
    }, async () => {
      const result = await actions.btcmultisig.sendPinProtected({
        ...sendOptions,
        password: pinCode,
      })

      console.log('sendPinProtected result', result)
      if (result && result.answer === 'ok') {
        const { txId } = result

        helpers.transactions.pullTxBalances(txId, amount, beforeBalances, adminFee)

        actions.loader.hide()
        actions.btcmultisig.getBalancePin()
        if (invoice) {
          await actions.invoices.markInvoice(invoice.id, 'ready', txId, wallet.address)
        }

        if (onReady instanceof Function) {
          onReady()
        }

        const txInfoUrl = helpers.transactions.getTxRouter('btc', txId)
        redirectTo(txInfoUrl)
      } else {
        this.setState({
          isShipped: false,
          serverOffline: true,
        })
      }
    })
  }

  render() {
    const {
      pinCode,
      error,
      isShipped,
      mnemonic,
      isMnemonicValid,
      serverOffline,
      useMnemonic,
    } = this.state

    const step = ''

    const {
      name,
      intl,
    } = this.props

    const linked = Link.all(this, 'pinCode', 'mnemonic')



    return (
      <Modal name={name} title={`${intl.formatMessage(langs.title)}`}>
        <div styleName="confirmPINModalHolder">
          {!useMnemonic && (
            <Fragment>
              <p styleName="centerInfoBlock">
                <strong>
                  <FormattedMessage { ...langs.upMessage } />
                </strong>
                <br />
              </p>
              <div styleName="highLevel" className="ym-hide-content">
                <FieldLabel label>
                  <FormattedMessage id="registerPinModalPinCode" defaultMessage="Your PIN-code:" />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25"
                  valueLink={linked.pinCode}
                  type="password"
                  placeholder={`${intl.formatMessage(langs.pinCodePlaceHolder)}`}
                  focusOnInit
                />
              </div>
              <div styleName="buttonsHolder">
                <Button blue disabled={isShipped} onClick={this.handleSend}>
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
                <Button blue disabled={isShipped} onClick={this.handleCancel}>
                  <FormattedMessage {...langs.cancelButton} />
                </Button>
              </div>
              <Button blue fullWidth disabled={isShipped} onClick={this.useMnemonic}>
                <FormattedMessage {...langs.useMnemonic} />
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
    )
  }
}
