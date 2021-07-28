import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from '../WithdrawModal/WithdrawModal.scss'
import ownStyle from './WithdrawModalMultisig.scss'

import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { isMobile } from 'react-device-detect'
import InvoiceInfoBlock from 'components/InvoiceInfoBlock/InvoiceInfoBlock'

import typeforce from 'swap.app/util/typeforce'
import * as mnemonicUtils from 'common/utils/mnemonic'
import MIN_AMOUNT from 'common/helpers/constants/MIN_AMOUNT'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import QrReader from 'components/QrReader'

import { routing } from 'helpers'
import lsDataCache from 'helpers/lsDataCache'

@connect(
  ({
    currencies,
    user: { btcData, activeFiat, btcMultisigSMSData },
    ui: { dashboardModalsAllowed },
  }) => ({
    activeFiat,
    currencies: currencies.items,
    items: [btcData, btcMultisigSMSData],
    dashboardView: dashboardModalsAllowed,
  })
)
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
class WithdrawModalMultisig extends React.Component<any, any> {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  fiatRates: any

  constructor(props) {
    super(props)

    const {
      data: { amount, toAddress, currency },
      items,
    } = props

    //@ts-ignore
    const currentDecimals = constants.tokenDecimals.btcmultisig
    const selectedItem = items.filter((item) => item.currency === currency)[0]

    let usedAdminFee = false

    let min = MIN_AMOUNT['btc_multisig_2fa']

    if (config && config.opts && config.opts.fee && config.opts.fee.btc) {
      usedAdminFee = config.opts.fee.btc
      if (usedAdminFee) {
        // miner fee + minimal admin fee
        //@ts-ignore
        min = new BigNumber(min).plus(usedAdminFee.min).toNumber()
      }
    }

    this.state = {
      usedAdminFee,
      step: 'fillform',
      isShipped: false,
      address: toAddress ? toAddress : '',
      amount: amount ? amount : '',
      code: '',
      minus: '',
      balance: selectedItem.balance || 0,
      ethBalance: null,
      currentDecimals,
      getFiat: 0,
      error: false,
      smsConfirmed: false,
      ownTx: '',
      mnemonic: '',
      broadcastError: false,
      sendSmsTimeout: 0,
      sendSmsTimeoutTimer: false,
      min,
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
    const { exCurrencyRate } = this.state
    const {
      data: { currency },
    } = this.props

    this.setBalanceOnState(currency)

    this.fiatRates = {}
    this.getFiatBalance()
    this.actualyMinAmount()
    //this.gotoSms()
  }

  getMinAmountForEthToken = () => {
    const {
      data: { currency },
    } = this.props
    const { currentDecimals } = this.state

    let ethTokenMinAmount = '0.'

    for (let a = 0; a < currentDecimals - 1; a++) {
      ethTokenMinAmount += '0'
    }

    return (ethTokenMinAmount += '1')
  }

  actualyMinAmount = async () => {
    const { usedAdminFee } = this.state

    let min: any = await helpers['btc'].estimateFeeValue({ method: 'send_2fa', speed: 'fast' })
    MIN_AMOUNT['btc_multisig_2fa'] = min

    if (usedAdminFee) {
      min = new BigNumber(min).plus(usedAdminFee.min).toNumber()
    }

    this.setState({
      min,
    })
  }

  setBalanceOnState = async (currency) => {
    const {
      data: { unconfirmedBalance },
    } = this.props

    const balance: any = await actions.btcmultisig.getBalance()

    const finalBalance =
      unconfirmedBalance !== undefined && unconfirmedBalance < 0
        ? new BigNumber(balance).plus(unconfirmedBalance).toString()
        : balance
    const ethBalance = await actions.eth.getBalance()

    this.setState(() => ({
      balance: finalBalance,
      ethBalance,
    }))
  }

  getFiatBalance = async () => {
    const {
      data: { currency },
      activeFiat,
    } = this.props

    const exCurrencyRate = await actions.user.getExchangeRate(currency, activeFiat.toLowerCase())
    this.fiatRates[currency] = exCurrencyRate

    this.setState(() => ({
      exCurrencyRate,
    }))
  }

  onFinishWithdraw = async (txId) => {
    const { amount, address: to } = this.state

    const {
      data: { currency, address, balance, invoice, onReady },
      name,
    } = this.props

    actions.loader.hide()

    if (invoice) {
      await actions.invoices.markInvoice(invoice.id, 'ready', txId, address)
    }
    this.setBalanceOnState(currency)

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
    const { code } = this.state
    const { address: to, amount } = this.state
    const {
      data: { currency, address, balance, invoice, onReady },
      name,
    } = this.props

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
      }
    }
  }

  handleSubmit = async () => {
    const { address: to, amount, ownTx, rawTx } = this.state

    const {
      data: { currency, address, balance, invoice, onReady },
      name,
    } = this.props

    this.setState(() => ({
      isShipped: true,
      step: 'confirm',
    }))

    this.setBalanceOnState(currency)

    if (invoice && ownTx) {
      await actions.invoices.markInvoice(invoice.id, 'ready', ownTx, address)
      actions.loader.hide()
      actions.notifications.show(constants.notifications.SuccessWithdraw, {
        amount,
        currency,
        address: to,
      })
      this.setState(() => ({ isShipped: false, error: false }))
      actions.modals.close(name)
      if (onReady instanceof Function) {
        onReady()
      }
      return
    }

    let sendOptions = {
      to,
      amount,
      speed: 'fast',
      from: address,
    }

    this.setState({
      sendSmsStatus: 'sending',
    })
    //@ts-ignore
    const result = await actions.btcmultisig.sendSMSProtected(sendOptions)

    console.log('sendSMSProtected result', result)
    if (result && result.answer === 'ok') {
      this.setState({
        isShipped: false,
        rawTx: result.rawTx ? result.rawTx : rawTx,
        sendSmsStatus: 'sended',
      })
    } else {
      this.setState({
        isShipped: false,
        sendSmsStatus: 'offline',
        rawTx: result.rawTx ? result.rawTx : rawTx,
      })
    }
  }

  sellAllBalance = async () => {
    const { amount, balance, currency, min, usedAdminFee } = this.state

    const { data } = this.props

    let minFee = min

    if (usedAdminFee) {
      let feeFromAmount = new BigNumber(usedAdminFee.fee).dividedBy(100).multipliedBy(balance)
      minFee = new BigNumber(minFee).plus(feeFromAmount).toNumber()
    }

    const balanceMiner = balance
      ? balance !== 0
        ? new BigNumber(balance).minus(minFee).toString()
        : balance
      : 'Wait please. Loading...'

    this.setState({
      amount: balanceMiner,
    })
  }

  isEthOrERC20() {}

  openScan = () => {
    const { openScanCam } = this.state

    this.setState(() => ({
      openScanCam: !openScanCam,
    }))
  }

  handleMnemonicSign = () => {
    const { mnemonic, rawTx, balance, amount, to } = this.state

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

    this.setState({
      isShipped: true,
      error: false,
      broadcastError: false,
    })

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

  handleScan = (data) => {
    if (data) {
      const address = data.split(':')[1].split('?')[0]
      const amount = data.split('=')[1]
      this.setState(() => ({
        address,
        amount,
      }))
      this.openScan()
    }
  }

  addressIsCorrect() {
    const { address } = this.state

    if (!typeforce.isCoinAddress.BTC(address)) {
      return actions.btc.addressIsCorrect(address)
    } else return true
  }

  handleClose = () => {
    const { name } = this.props

    actions.modals.close(name)
  }

  render() {
    const {
      address,
      amount,
      code,
      balance,
      isShipped,
      minus,
      ethBalance,
      exCurrencyRate,
      currentDecimals,
      error,
      mnemonic,
      openScanCam,
      step,
      ownTx,
      sendSmsTimeout,
      sendSmsStatus,
      usedAdminFee,
    } = this.state

    const {
      name,
      data: { currency, invoice },
      tokenItems,
      items,
      intl,
    } = this.props

    let { min, min: defaultMin } = this.state

    if (usedAdminFee) {
      if (amount) {
        let feeFromAmount = new BigNumber(usedAdminFee.fee).dividedBy(100).multipliedBy(amount)
        if (new BigNumber(usedAdminFee.min).isGreaterThan(feeFromAmount))
          feeFromAmount = new BigNumber(usedAdminFee.min)

        min = new BigNumber(min).plus(feeFromAmount).toNumber() // Admin fee in satoshi
      }
    }

    const linked = Link.all(this, 'address', 'amount', 'code', 'ownTx', 'mnemonic')

    const dataCurrency = currency.toUpperCase()

    const isDisabled =
      !address ||
      !amount ||
      isShipped ||
      ownTx ||
      !this.addressIsCorrect() ||
      new BigNumber(amount).isGreaterThan(balance) ||
      new BigNumber(amount).dp() > currentDecimals

    const NanReplacement = balance || '...'
    const getFiat = amount * exCurrencyRate

    if (new BigNumber(amount).isGreaterThan(0)) {
      linked.amount.check(
        (value) => new BigNumber(value).isLessThanOrEqualTo(balance),
        <div style={{ width: '340px', fontSize: '12px' }}>
          <FormattedMessage
            id="Withdrow170"
            defaultMessage="The amount must be no more than your balance"
            values={{
              min,
              currency: `${currency}`,
            }}
          />
        </div>
      )
    }

    if (this.state.amount < 0) {
      this.setState({
        amount: '',
        minus: true,
      })
    }

    const labels = defineMessages({
      withdrawModal: {
        id: 'withdrowTitle271',
        defaultMessage: `Send`,
      },
      ownTxPlaceholder: {
        id: 'withdrawOwnTxPlaceholder',
        defaultMessage: 'Если оплатили с другого источника',
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
        {openScanCam && (
          <QrReader
            openScan={this.openScan}
            handleError={this.handleError}
            handleScan={this.handleScan}
          />
        )}
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
              <Input
                styleName="input"
                valueLink={linked.mnemonic}
                multiline={true}
                placeholder={`${intl.formatMessage(labels.mnemonicPlaceholder)}`}
              />
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
        {step === 'fillform' && (
          <Fragment>
            <p styleName="notice dashboardViewNotice">
              <FormattedMessage
                id="Withdrow213"
                defaultMessage="Please note: Fee is {minAmount} {data}.{br}Your balance must exceed this sum to perform transaction"
                values={{ minAmount: `${min}`, br: <br />, data: `${dataCurrency}` }}
              />
            </p>
            <div styleName="highLevel" style={{ marginBottom: '20px' }}>
              <FieldLabel inRow>
                <span style={{ fontSize: '16px' }}>
                  <FormattedMessage id="Withdrow1194" defaultMessage="Address " />
                </span>{' '}
                <Tooltip id="WtH203">
                  <div style={{ textAlign: 'center' }}>
                    <FormattedMessage
                      id="WTH275"
                      defaultMessage="Make sure the wallet you{br}are sending the funds to supports {currency}"
                      values={{ br: <br />, currency: `${currency.toUpperCase()}` }}
                    />
                  </div>
                </Tooltip>
              </FieldLabel>
              <Input
                valueLink={linked.address}
                focusOnInit
                pattern="0-9a-zA-Z:"
                placeholder={`Enter ${currency.toUpperCase()} address to transfer`}
                qr
                withMargin
                openScan={this.openScan}
              />
              {address && !this.addressIsCorrect() && (
                <div styleName="rednote">
                  <FormattedMessage
                    id="WithdrawIncorectAddress"
                    defaultMessage="Your address not correct"
                  />
                </div>
              )}
            </div>
            <div styleName="lowLevel" style={{ marginBottom: '50px' }}>
              <p styleName="balance">
                {balance} {`BTC`}
              </p>
              <FieldLabel>
                <FormattedMessage id="Withdrow118" defaultMessage="Amount " />
              </FieldLabel>

              <div styleName="group">
                <Input
                  styleName="input"
                  valueLink={linked.amount}
                  pattern="0-9\."
                  placeholder="Enter the amount"
                  fiat={getFiat.toFixed(2)}
                  onKeyDown={inputReplaceCommaWithDot}
                />
                <div style={{ marginLeft: '15px' }}>
                  <Button blue big onClick={this.sellAllBalance} data-tip data-for="Withdrow134">
                    <FormattedMessage id="Select210" defaultMessage="MAX" />
                  </Button>
                </div>
                {!isMobile && (
                  <ReactTooltip id="Withdrow134" type="light" effect="solid" styleName="r-tooltip">
                    <FormattedMessage
                      id="WithdrawButton32"
                      defaultMessage="when you click this button, in the field, an amount equal to your balance minus the miners commission will appear"
                    />
                  </ReactTooltip>
                )}
                {!linked.amount.error && (
                  <div styleName={minus ? 'rednote' : 'note'}>
                    <FormattedMessage
                      id="WithdrawModal256"
                      defaultMessage="No less than {minAmount}"
                      values={{ minAmount: `${defaultMin}` }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div styleName="sendBtnsWrapper">
              <div styleName="actionBtn">
                <Button blue big fill disabled={isDisabled} onClick={this.handleSubmit}>
                  {isShipped ? (
                    <Fragment>
                      <FormattedMessage id="WithdrawModal11212" defaultMessage="Processing ..." />
                    </Fragment>
                  ) : (
                    <Fragment>
                      <FormattedMessage id="WithdrawModal111" defaultMessage="Send" />
                    </Fragment>
                  )}
                </Button>
              </div>
              <div styleName="actionBtn">
                <Button big fill gray onClick={this.handleClose}>
                  <Fragment>
                    <FormattedMessage id="WithdrawModalCancelBtn" defaultMessage="Cancel" />
                  </Fragment>
                </Button>
              </div>
            </div>
            {error && (
              <div styleName="rednote">
                <FormattedMessage
                  id="WithdrawModalErrorSend"
                  defaultMessage="{errorName} {currency}:{br}{errorMessage}"
                  values={{
                    errorName: intl.formatMessage(error.name),
                    errorMessage: intl.formatMessage(error.message),
                    br: <br />,
                    currency: `${currency}`,
                  }}
                />
              </div>
            )}
            {invoice && (
              <Fragment>
                <hr />
                <div
                  styleName="lowLevel"
                  style={{ marginBottom: '50px' }}
                >
                  <div styleName="groupField">
                    <div styleName="downLabel">
                      <FieldLabel inRow>
                        <span styleName="mobileFont">
                          <FormattedMessage id="WithdrowOwnTX" defaultMessage="Или укажите TX" />
                        </span>
                      </FieldLabel>
                    </div>
                  </div>
                  <div styleName="group">
                    <Input
                      styleName="input"
                      valueLink={linked.ownTx}
                      placeholder={`${intl.formatMessage(labels.ownTxPlaceholder)}`}
                    />
                  </div>
                </div>
                <Button
                  styleName="buttonFull"
                  big
                  blue
                  fullWidth
                  disabled={!ownTx || isShipped}
                  onClick={this.handleSubmit}
                >
                  {isShipped ? (
                    <Fragment>
                      <FormattedMessage id="WithdrawModal11212" defaultMessage="Processing ..." />
                    </Fragment>
                  ) : (
                    <FormattedMessage
                      id="WithdrawModalInvoiceSaveTx"
                      defaultMessage="Отметить как оплаченный"
                    />
                  )}
                </Button>
              </Fragment>
            )}
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
            {sendSmsStatus === 'sending' && (
              <div styleName="smsServerStatus">
                <FormattedMessage
                  id="WithdrawSMS_SmsSending"
                  defaultMessage="Отправка проверочного кода"
                />
              </div>
            )}
            {sendSmsStatus === 'sended' && (
              <div styleName="smsServerStatus">
                <FormattedMessage id="WithdrawSMS_SmsSended" defaultMessage="Код отправлен" />
              </div>
            )}
            {sendSmsStatus === 'offline' && (
              <div styleName="rednotes smsServerStatus">
                <FormattedMessage
                  id="WithdrawSMS_ServerOffline"
                  defaultMessage="Сервер авторизации не доступен"
                />
              </div>
            )}
            {linked.code.error && (
              <div styleName="rednotes smsServerStatus">
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
