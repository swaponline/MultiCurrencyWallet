import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'

import cssModules from 'react-css-modules'
import styles from '../WithdrawModal/WithdrawModal.scss'
import ownStyle from './WithdrawBtcSms.scss'

import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import InvoiceInfoBlock from 'components/InvoiceInfoBlock/InvoiceInfoBlock'
import * as mnemonicUtils from 'common/utils/mnemonic'
import { routing } from 'helpers'
import lsDataCache from 'helpers/lsDataCache'
import MnemonicInput from 'components/forms/MnemonicInput/MnemonicInput'

@connect(({ ui: { dashboardModalsAllowed } }) => ({
  dashboardView: dashboardModalsAllowed,
}))
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
class WithdrawModalMultisig extends React.Component<any, any> {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    const { wallet, invoice, sendOptions, beforeBalances } = props.data

    this.state = {
      step: 'confirm',
      isShipped: false,
      code: '',
      minus: '',
      error: false,
      smsConfirmed: false,
      mnemonic: '',
      broadcastError: false,
      sendSmsTimeout: 0,
      sendSmsTimeoutTimer: false,
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.sendSmsTimeoutTimer)
  }

  gotoSms = () => {
    this.setState({
      smsStatus: 'sended',
      step: 'confirm',
    })
  }

  componentDidMount() {
    this.setState(
      {
        isShipped: true,
        step: 'confirm',
        sendSmsStatus: 'sending',
      },
      async () => {
        const {
          data: { wallet, sendOptions, invoice, onReady },
        } = this.props

        const result = await actions.btcmultisig.sendSMSProtected(sendOptions)

        console.log('sendSMSProtected result', result)
        if (result && result.answer === 'ok') {
          this.setState({
            isShipped: false,
            rawTx: result.rawTx ? result.rawTx : null,
            sendSmsStatus: 'sended',
          })
        } else {
          this.setState({
            isShipped: false,
            sendSmsStatus: 'offline',
            rawTx: result.rawTx ? result.rawTx : null,
          })
        }
      }
    )
  }

  onFinishWithdraw = async (txId) => {
    const {
      data: {
        sendOptions: { to, amount },
        wallet: { address },
        invoice,
        onReady,
      },
      name,
    } = this.props

    actions.loader.hide()

    if (invoice) {
      await actions.invoices.markInvoice(invoice.id, 'ready', txId, address)
    }

    // Сохраняем транзакцию в кеш
    const txInfoCache = {
      amount,
      senderAddress: address,
      receiverAddress: to,
      confirmed: false,
    }

    lsDataCache.push({
      key: `TxInfo_btc_${txId}`,
      time: 3600,
      data: txInfoCache,
    })

    this.setState({
      isShipped: false,
      error: false,
    })

    if (onReady instanceof Function) {
      onReady()
    }

    const txInfoUrl = helpers.transactions.getTxRouter('btc', txId)
    routing.redirectTo(txInfoUrl)

    actions.modals.close(name)
  }

  handleConfirmSMS = async () => {
    this.setState(
      {
        isShipped: true,
        error: false,
        isConfirming: true,
      },
      async () => {
        const { code } = this.state

        const result = await actions.btcmultisig.confirmSMSProtected(code)
        if (result && result.txID) {
          this.onFinishWithdraw(result.txID)
        } else {
          console.log(result)
          if (result && result.error && result.error == 'Fail broadcast' && result.rawTX) {
            actions.btc.broadcastTx(result.rawTX).then(async ({ txid }) => {
              if (txid) {
                this.onFinishWithdraw(txid)
              } else {
                this.setState({
                  broadcastError: true,
                  rawTx: result.rawTX,
                  isShipped: false,
                  isConfirming: false,
                  error: (
                    <FormattedMessage
                      id="WithdrawSMS_BroadcastError"
                      defaultMessage="Не удалось отправить транзакцию в сеть ({errorText})"
                      values={{ errorText: `unknown` }}
                    />
                  ),
                })
              }
            })
          } else {
            if (result && result.error && result.error === `SMS code not valid`) {
              this.setState({
                isShipped: false,
                isConfirming: false,
                error: (
                  <FormattedMessage
                    id="WithdrawSMS_NotValidSmsCode"
                    defaultMessage="Вы ввели не верный проверочный код"
                  />
                ),
              })
            } else {
              this.setState({
                isShipped: false,
                isConfirming: false,
                error: (
                  <FormattedMessage
                    id="WithdrawSMS_UnknownError"
                    defaultMessage="Не известная ошибка. Попробуйте позже или используйте секретную фразу"
                  />
                ),
              })
            }
          }
        }
      }
    )
  }

  handleMnemonicSign = () => {
    const { mnemonic, rawTx } = this.state

    if (!mnemonic || !mnemonicUtils.validateMnemonicWords(mnemonic)) {
      this.setState({
        error: (
          <FormattedMessage
            id="WithdrawSMS_NotValidMnemonic"
            defaultMessage="Секретная фраза не валидна"
          />
        ),
      })
      return
    }
    if (!actions.btcmultisig.checkSmsMnemonic(mnemonic.trim())) {
      this.setState({
        error: (
          <FormattedMessage
            id="WithdrawSMS_WrongMnemonic"
            defaultMessage="Не правильная секретная фраза"
          />
        ),
      })
      return
    }

    this.setState(
      {
        isShipped: true,
        error: false,
        broadcastError: false,
      },
      () => {
        actions.btcmultisig
          .signSmsMnemonicAndBuild(rawTx, mnemonic.trim())
          .then(async (txHex) => {
            console.log('signed', txHex)
            this.setState({
              txHex,
            })
            actions.btc
              .broadcastTx(txHex)
              .then(async ({ txid }) => {
                if (txid) {
                  this.onFinishWithdraw(txid)
                } else {
                  this.setState({
                    broadcastError: true,
                    isShipped: false,
                    error: (
                      <FormattedMessage
                        id="WithdrawSMS_BroadcastError"
                        defaultMessage="Не удалось отправить транзакцию в сеть ({errorText})"
                        values={{ errorText: `unknown` }}
                      />
                    ),
                  })
                }
              })
              .catch((e) => {
                console.error(e)
                const errorText = e.res ? e.res.text : e.message
                this.setState({
                  broadcastError: true,
                  isShipped: false,
                  error: (
                    <FormattedMessage
                      id="WithdrawSMS_BroadcastError"
                      defaultMessage="Не удалось отправить транзакцию в сеть ({errorText})"
                      values={{ errorText }}
                    />
                  ),
                })
              })
          })
          .catch((e) => {
            console.log('fail sign tx by mnemonic')
            this.setState({
              isShipped: false,
              error: (
                <FormattedMessage
                  id="WithdrawSMS_FailSignByMnemonic"
                  defaultMessage="Не удалось подписать транзакцию"
                />
              ),
            })
          })
      }
    )
  }

  handleSwitchToMnemonic = () => {
    this.setState({
      step: 'mnemonicSign',
    })
  }

  handleSwitchToSms = () => {
    this.setState({
      step: 'confirm',
    })
  }

  handleError = (err) => {
    console.error(err)
  }

  handleClose = () => {
    const { name } = this.props

    actions.modals.close(name)
  }

  handleMnemonicChange = (mnemonic) => {
    this.setState({
      mnemonic,
    })
  }

  render() {
    const {
      code,
      isShipped,
      isConfirming,
      error,
      mnemonic,
      step,
      sendSmsTimeout,
      sendSmsStatus,
    } = this.state

    const {
      name,
      data: {
        wallet: { currency },
        invoice,
      },
      tokenItems,
      items,
      intl,
    } = this.props

    const linked = Link.all(this, 'code')

    const labels = defineMessages({
      withdrawModal: {
        id: 'withdrowTitle271',
        defaultMessage: `Send`,
      },
      smsPlaceholder: {
        id: 'withdrawSMSCodePlaceholder',
        defaultMessage: 'Enter SMS-code',
      },
      mnemonicPlaceholder: {
        id: 'registerSMSMPlaceHolder',
        defaultMessage: `12 слов`,
      },
    })

    const formRender = (
      <Fragment>
        {invoice && <InvoiceInfoBlock invoiceData={invoice} />}
        {step === 'mnemonicSign' && (
          <Fragment>
            <p styleName="notice dashboardViewNotice">
              <FormattedMessage
                id="WithdrawSMS_MnemonicSignCaption"
                defaultMessage="Подтверждение транзакции секретной фразой"
              />
            </p>
            <div styleName="highLevel" className="ym-hide-content">
              <FieldLabel>
                <FormattedMessage
                  id="registerSMSModalWords"
                  defaultMessage="Секретная фраза (12 слов):"
                />
              </FieldLabel>
              <MnemonicInput onChange={this.handleMnemonicChange} fullWidth={true} />
            </div>
            {error && <div styleName="rednotes">{error}</div>}
            <Button
              styleName="buttonFull"
              big
              blue
              fullWidth
              disabled={isShipped}
              onClick={this.handleMnemonicSign}
            >
              {isShipped ? (
                <FormattedMessage id="WithdrawModal11212" defaultMessage="Processing ..." />
              ) : (
                <FormattedMessage
                  id="btcSMSProtectedSignByMnemonic"
                  defaultMessage="Использовать секретную фразу"
                />
              )}
            </Button>
            <hr />
            <p styleName="notice mnemonicUseNote dashboardViewNotice">
              <FormattedMessage
                id="WithdrawSMS_UseSMSNote"
                defaultMessage="Так-же вы можете использовать смс-код, отправленный на привязанный номер телефона"
              />
            </p>
            <Button styleName="useAuthMethodButton" blue onClick={this.handleSwitchToSms}>
              <FormattedMessage id="WithdrawSMS_UseSMS" defaultMessage="Использовать смс-код" />
            </Button>
          </Fragment>
        )}

        {step === 'confirm' && (
          <Fragment>
            <div styleName="highLevel smsCodeHolder">
              <FieldLabel>
                <FormattedMessage id="Withdrow2223" defaultMessage="SMS code" />
              </FieldLabel>
              <Input
                styleName="input"
                valueLink={linked.code}
                pattern="0-9"
                placeholder={`${intl.formatMessage(labels.smsPlaceholder)}`}
              />
            </div>
            {error && <div styleName="smsServerStatus hasError">{error}</div>}
            {isConfirming && (
              <div styleName="smsServerStatus">
                <FormattedMessage
                  id="WithdrawSMS_SmsConfirming"
                  defaultMessage="Подтверждение транзакции"
                />
              </div>
            )}
            {!error && sendSmsStatus === 'sending' && (
              <div styleName="smsServerStatus">
                <FormattedMessage
                  id="WithdrawSMS_SmsSending"
                  defaultMessage="Отправка проверочного кода"
                />
              </div>
            )}
            {!error && !isShipped && sendSmsStatus === 'sended' && (
              <div styleName="smsServerStatus">
                <FormattedMessage id="WithdrawSMS_SmsSended" defaultMessage="Код отправлен" />
              </div>
            )}
            {!error && !isShipped && sendSmsStatus === 'offline' && (
              <div styleName="smsServerStatus hasError">
                <FormattedMessage
                  id="WithdrawSMS_ServerOffline"
                  defaultMessage="Сервер авторизации не доступен"
                />
              </div>
            )}
            {linked.code.error && (
              <div styleName="smsServerStatus hasError">
                <FormattedMessage
                  id="WithdrawModal2225"
                  defaultMessage="Something went wrong, enter your current code please"
                />
              </div>
            )}
            <Button
              styleName="buttonFull confirmSmsCode"
              fullWidth
              disabled={isShipped || sendSmsStatus === 'sending' || sendSmsStatus === 'offline'}
              big
              blue
              onClick={this.handleConfirmSMS}
            >
              <FormattedMessage id="Withdrow2224" defaultMessage="Confirm" />
            </Button>
            <hr styleName="marginHr" />
            <p styleName="notice mnemonicUseNote dashboardViewNotice">
              <FormattedMessage
                id="WithdrawSMS_MnemonicNote"
                defaultMessage="Если у вас нет доступа к телефону или не получается получить код, вы можете воспользовать секретной фразой"
              />
            </p>
            <Button styleName="useAuthMethodButton" blue onClick={this.handleSwitchToMnemonic}>
              <FormattedMessage
                id="WithdrawSMS_UseMnemonic"
                defaultMessage="Использовать секретную фразу"
              />
            </Button>
          </Fragment>
        )}
      </Fragment>
    )

    return (
      //@ts-ignore: strictNullChecks
      <Modal
        name={name}
        title={`${intl.formatMessage(labels.withdrawModal)}${' '}${currency.toUpperCase()}`}
      >
        {formRender}
      </Modal>
    )
  }
}

export default injectIntl(WithdrawModalMultisig)
