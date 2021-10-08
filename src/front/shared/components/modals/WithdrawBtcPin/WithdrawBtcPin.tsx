import React, { Fragment } from 'react'
import helpers from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'

import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './WithdrawBtcPin.scss'

import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import * as mnemonicUtils from 'common/utils/mnemonic'
import { routing } from 'helpers'
import lsDataCache from 'helpers/lsDataCache'
import MnemonicInput from 'components/forms/MnemonicInput/MnemonicInput'

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
  upMessageMnemonic: {
    id: `${langPrefix}_UpMessageMnemonic`,
    defaultMessage: `Для подтверждения транзакции введите секретную фразу (12 слов)`,
  },
  labelYourPin: {
    id: `${langPrefix}_LabelYourPin`,
    defaultMessage: `Your Pin-code`,
  },
  labelYourMnemonic: {
    id: `${langPrefix}_LabelYourMnemonic`,
    defaultMessage: `Your secret phrase`,
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
  mnemonicNote: {
    id: `${langPrefix}_MnemonicUseNote`,
    defaultMessage: `В случае не доступности сервера авторизации, или если вы забыли пароль, Вы можете воспользоваться секретной фразой`,
  },
  serverIsOffline: {
    id: `${langPrefix}_ServerOffline`,
    defaultMessage: `Сервер авторизации не доступен. Попробуйте позже или используйте секретной фразу`,
  },
  mnemonicPlaceHolder: {
    id: `${langPrefix}_MnemonicPlaceholder`,
    defaultMessage: `Enter secret phrase (12 words)`,
  },
  pincodeNote: {
    id: `${langPrefix}_PincodeNote`,
    defaultMessage: `Так-же вы можете подтвердить транзакцию введя пароль`,
  },
  usePinCode: {
    id: `${langPrefix}_ButtonUsePin`,
    defaultMessage: `Использовать пароль`,
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

type ComponentProps = {
  name: string
  data: IUniversalObj
  intl: IUniversalObj
  onClose?: () => void
}

type ComponentState = {
  pinCode: string
  mnemonic: string
  isShipped: boolean
  isMnemonicValid: boolean
  serverOffline: boolean
  useMnemonic: boolean
  error: false | JSX.Element
}

@connect(({ user: { btcData, btcMultisigPinData } }) => ({
  btcData,
  btcMultisigPinData,
}))
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
class WithdrawBtcPin extends React.Component<ComponentProps, ComponentState> {
  constructor(props) {
    super(props)

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

  handleCancel = () => {
    window.history.back()
  }

  handleSendMnemonic = async () => {
    const { mnemonic } = this.state

    const {
      data: { sendOptions },
    } = this.props

    this.setState(
      {
        isShipped: true,
        error: false,
      },
      async () => {
        if (!mnemonic || !mnemonicUtils.validateMnemonicWords(mnemonic)) {
          this.setState({
            error: <FormattedMessage {...langs.errorMnemonicInvalid} />,
            isShipped: false,
          })
          return
        }
        if (!actions.btcmultisig.checkPinMnemonic(mnemonic.trim())) {
          this.setState({
            error: <FormattedMessage {...langs.errorMnemonicIncorrect} />,
            isShipped: false,
          })
          return
        }

        const result = await actions.btcmultisig.sendPinProtected({
          ...sendOptions,
          mnemonic,
        })

        this.processSendResult(result)
      }
    )
  }

  handleSend = async () => {
    const { pinCode } = this.state

    const {
      data: { sendOptions },
    } = this.props

    if (!pinCode || pinCode.length < 4) {
      this.setState({
        error: <FormattedMessage {...langs.youNotEnterPin} />,
      })
      return
    }

    this.setState(
      {
        error: false,
        serverOffline: false,
        isShipped: true,
      },
      async () => {
        const result = await actions.btcmultisig.sendPinProtected({
          ...sendOptions,
          password: pinCode,
        })
        this.processSendResult(result)
      }
    )
  }

  processSendResult = async (result) => {
    const {
      data: {
        wallet,
        sendOptions: { amount, from, to },
        invoice,
        adminFee,
        beforeBalances,
        onReady,
      },
    } = this.props
    if (result && result.answer === 'ok') {
      const { txId } = result

      // Сохраняем транзакцию в кеш
      const txInfoCache = {
        amount,
        senderAddress: from,
        receiverAddress: to,
        confirmed: false,
      }

      lsDataCache.push({
        key: `TxInfo_btc_${txId}`,
        time: 3600,
        data: txInfoCache,
      })

      actions.loader.hide()
      actions.btcmultisig.getBalancePin()
      if (invoice) {
        await actions.invoices.markInvoice(invoice.id, 'ready', txId, wallet.address)
      }

      if (onReady instanceof Function) {
        onReady()
      }

      const txInfoUrl = helpers.transactions.getTxRouter('btc', txId)
      routing.redirectTo(txInfoUrl)
    } else {
      this.setState({
        isShipped: false,
        serverOffline: !result.error,
        error: result.error || `Unknown error`,
      })
    }
  }

  handleUseMnemonic = () => {
    this.setState({
      isShipped: false,
      error: false,
      useMnemonic: true,
      serverOffline: false,
      mnemonic: '',
    })
  }

  handleMnemonicChange = (mnemonic) => {
    this.setState({
      mnemonic,
    })
  }

  handleUsePassword = () => {
    this.setState({
      isShipped: false,
      error: false,
      useMnemonic: false,
      serverOffline: false,
      pinCode: '',
    })
  }

  render() {
    const {
      error,
      isShipped,
      serverOffline,
      useMnemonic,
    } = this.state

    const { name, intl } = this.props
    const linked = Link.all(this, 'pinCode')

    return (
      <Modal name={name} title={`${intl.formatMessage(langs.title)}`}>
        <div styleName="confirmPINModalHolder">
          {!useMnemonic && (
            <Fragment>
              <p styleName="centerInfoBlock">
                <strong>
                  <FormattedMessage {...langs.upMessage} />
                </strong>
                <br />
              </p>
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
              {error && <div styleName="error rednotes">{error}</div>}
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
              <div styleName="mnemonicButtonHolder">
                {serverOffline && (
                  <div styleName="error rednotes">
                    <FormattedMessage {...langs.serverIsOffline} />
                  </div>
                )}
                <p>
                  <FormattedMessage {...langs.mnemonicNote} />
                </p>
                <Button blue fullWidth disabled={isShipped} onClick={this.handleUseMnemonic}>
                  <FormattedMessage {...langs.useMnemonic} />
                </Button>
              </div>
            </Fragment>
          )}
          {useMnemonic && (
            <Fragment>
              <p styleName="centerInfoBlock">
                <strong>
                  <FormattedMessage {...langs.upMessageMnemonic} />
                </strong>
                <br />
              </p>
              <div styleName="highLevel" className="ym-hide-content">
                <FieldLabel>
                  <FormattedMessage {...langs.labelYourMnemonic} />
                </FieldLabel>
                <MnemonicInput onChange={this.handleMnemonicChange} fullWidth={true} />
              </div>
              {error && <div styleName="error rednotes">{error}</div>}
              <div styleName="buttonsHolder">
                <Button blue disabled={isShipped} onClick={this.handleSendMnemonic}>
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
              <div styleName="pinButtonHolder">
                <p>
                  <FormattedMessage {...langs.pincodeNote} />
                </p>
                <Button blue fullWidth disabled={isShipped} onClick={this.handleUsePassword}>
                  <FormattedMessage {...langs.usePinCode} />
                </Button>
              </div>
            </Fragment>
          )}
        </div>
      </Modal>
    )
  }
}

export default injectIntl(WithdrawBtcPin)
