import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from '../WithdrawModal/WithdrawModal.scss'
import ownStyle from './WithdrawModalMultisigUser.scss'

import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import { ShareLink } from 'components/controls'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { isMobile } from 'react-device-detect'
import InvoiceInfoBlock from 'components/InvoiceInfoBlock/InvoiceInfoBlock'

import typeforce from 'swap.app/util/typeforce'
// import { isCoinAddress } from 'swap.app/util/typeforce'
import minAmount from 'helpers/constants/minAmount'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import links from 'helpers/links'
import CopyToClipboard from 'react-copy-to-clipboard'
import QrReader from "components/QrReader"
import { getFullOrigin } from 'helpers/links'


@injectIntl
@connect(
  ({
    currencies,
    user: { ethData, btcData, btcMultisigUserData, tokensData, nimData /* usdtOmniData, nimData */ },
  }) => ({
    currencies: currencies.items,
    items: [ethData, btcData, btcMultisigUserData /* usdtOmniData, nimData */],
    tokenItems: [...Object.keys(tokensData).map(k => (tokensData[k]))],
  })
)
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
export default class WithdrawModalMultisigUser extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(data) {
    super()

    console.log('WithdrawModalMultisigUser', data)
    const {
      data: {
        currency,
        amount,
        toAddress,
        address,
      },
      items,
      tokenItems,
    } = data

    const currentDecimals = constants.tokenDecimals.btcmultisig
    const allCurrencyies = items.concat(tokenItems)
    const selectedItem = allCurrencyies.filter(item => item.currency === currency)[0]

    this.broadcastCancelFunc = false

    this.state = {
      step: 'fillform',
      isShipped: false,
      address: (toAddress) ? toAddress : '',
      amount: (amount) ? amount : '',
      code: '',
      minus: '',
      balance: selectedItem.balance || 0,
      ethBalance: null,
      isEthToken: helpers.ethToken.isEthToken({ name: currency.toLowerCase() }),
      currentDecimals,
      getUsd: 0,
      error: false,
      smsConfirmed: false,
      txRaw: '',
      isLinkCopied: false,
      ownTx: '',
      minAmount: minAmount['btc_multisig_2n2'],
    }
  }

  componentDidMount() {
    const { exCurrencyRate } = this.state
    const { data: { currency } } = this.props

    this.setBalanceOnState(currency)

    this.usdRates = {}
    this.getUsdBalance()
    this.actualyMinAmount()
  }

  componentWillUnmount() {
    if (this.broadcastCancelFunc) this.broadcastCancelFunc()
  }

  getMinAmountForEthToken = () => {
    const { data: { currency } } = this.props
    const { currentDecimals } = this.state

    let ethTokenMinAmount = '0.'

    for (let a = 0; a < currentDecimals - 1; a++) {
      ethTokenMinAmount += '0'
    }

    return ethTokenMinAmount += '1'
  }

  actualyMinAmount = async () => {
    if (constants.coinsWithDynamicFee.includes('btc')) {
      minAmount['btc_multisig_2n2'] = await helpers['btc'].estimateFeeValue({ method: 'send_multisig', speed: 'fast' })
      this.setState({
        minAmount: minAmount['btc_multisig_2n2'],
      })
    }
  }

  setBalanceOnState = async (currency) => {
    const { data: { unconfirmedBalance } } = this.props

    const balance = await actions.btcmultisig.getBalanceUser()

    const finalBalance = unconfirmedBalance !== undefined && unconfirmedBalance < 0
      ? new BigNumber(balance).plus(unconfirmedBalance).toString()
      : balance

    this.setState(() => ({
      balance: finalBalance,
    }))
  }

  getUsdBalance = async () => {
    const { data: { currency } } = this.props

    const exCurrencyRate = await actions.user.getExchangeRate(currency, 'usd')

    this.usdRates[currency] = exCurrencyRate

    this.setState(() => ({
      exCurrencyRate,
    }))
  }

  handleSubmit = async () => {
    const { address: to, amount, ownTx } = this.state
    const { data: { currency, address, balance, invoice, onReady }, name } = this.props

    this.setState(() => ({ isShipped: true }))

    this.setBalanceOnState(currency)

    let sendOptions = {
      to,
      amount,
      speed: 'fast',
    }

    if (invoice && ownTx) {
      await actions.invoices.markInvoice(invoice.id, 'ready', ownTx)
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

    if (helpers.ethToken.isEthToken({ name: currency.toLowerCase() })) {
      sendOptions = {
        ...sendOptions,
        name: currency.toLowerCase(),
      }
    } else {
      sendOptions = {
        ...sendOptions,
        from: address,
      }
    }

    const result = await actions.btcmultisig.send(sendOptions)

    this.broadcastCancelFunc = actions.btcmultisig.broadcastTX2Room(
      {
        txRaw: result,
        address: to,
        amount,
        currency: 'BTC',
        invoice,
      },
      () => {
        this.setState({
          step: 'rawlink',
          txRaw: result,
          isShipped: false,
        })
      },
      () => {
        this.setState({
          step: 'rawlink',
          txRaw: result,
          isShipped: false,
        })
      }
    )
  }

  sellAllBalance = async () => {
    const { amount, balance, currency } = this.state
    const { data } = this.props

    const minFee = minAmount.btc_multisig_2n2

    const balanceMiner = balance
      ? balance !== 0
        ? new BigNumber(balance).minus(minFee).toString()
        : balance
      : 'Wait please. Loading...'

    this.setState({
      amount: balanceMiner,
    })
  }

  addressIsCorrect() {
    const { data: { currency } } = this.props
    const { address } = this.state

    return typeforce.isCoinAddress.BTC(address)
  }

  handleCopyLink = () => {
    this.setState({
      isLinkCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isLinkCopied: false,
        })
      }, 500)
    })
  }

  handleReady = () => {
    const { name } = this.props
    actions.modals.close(name);
  }

  openScan = () => {
    const { openScanCam } = this.state;

    this.setState(() => ({
      openScanCam: !openScanCam
    }));
  };

  handleError = err => {
    console.error(err);
  };

  handleScan = data => {
    if (data) {
      const address = data.split(":")[1].split("?")[0];
      const amount = data.split("=")[1];
      this.setState(() => ({
        address,
        amount
      }));
      this.openScan();
    }
  };

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
      exCurrencyRate,
      currentDecimals,
      error,
      step,
      txRaw,
      isLinkCopied,
      ownTx,
      openScanCam,
      minAmount: min,
    } = this.state

    const {
      name,
      data: {
        currency,
        invoice,
      },
      tokenItems,
      items,
      intl,
    } = this.props

    let txConfirmLink = `${getFullOrigin()}${links.multisign}/btc/confirm/${txRaw}`
    if (invoice) {
      txConfirmLink = `${getFullOrigin()}${links.multisign}/btc/confirminvoice/${invoice.id}|${txRaw}`
    }
    const linked = Link.all(this, 'address', 'amount', 'code', 'ownTx')

    const dataCurrency = currency.toUpperCase()

    const isDisabled =
      !address || !amount || isShipped || ownTx
      || !this.addressIsCorrect()
      || BigNumber(amount).isGreaterThan(balance)
      || BigNumber(amount).dp() > currentDecimals

    const NanReplacement = balance || '...'
    const getUsd = amount * exCurrencyRate

    if (new BigNumber(amount).isGreaterThan(0)) {
      linked.amount.check((value) => new BigNumber(value).isLessThanOrEqualTo(balance), (
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
      ))
    }

    if (this.state.amount < 0) {
      this.setState({
        amount: '',
        minus: true,
      })
    }

    const labels = defineMessages({
      withdrowModal: {
        id: 'withdrowTitle271',
        defaultMessage: `Send`,
      },
      ownTxPlaceholder: {
        id: 'withdrawOwnTxPlaceholder',
        defaultMessage: 'Если оплатили с другого источника'
      },
    })

    return (
      <Modal name={name} title={`${intl.formatMessage(labels.withdrowModal)}${' '}${currency.toUpperCase()}`}>
        {openScanCam && (
          <QrReader openScan={this.openScan} handleError={this.handleError} handleScan={this.handleScan} />
        )}
        {invoice &&
          <InvoiceInfoBlock invoiceData={invoice} />
        }
        {step === 'fillform' &&
          <Fragment>
            <p styleName="notice">
              <FormattedMessage
                id="Withdrow213"
                defaultMessage="Please note: Fee is {minAmount} {data}.{br}Your balance must exceed this sum to perform transaction"
                values={{ minAmount: <span>{min}</span>, br: <br />, data: `${dataCurrency}` }}
              />
            </p>
            <div styleName="highLevel" style={{ marginBottom: "20px" }}>
              <FieldLabel>
                <FormattedMessage id="Withdrow1194" defaultMessage="Address " />{" "}
                <Tooltip id="WtH203">
                  <div style={{ textAlign: "center" }}>
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
                  <FormattedMessage id="WithdrawIncorectAddress" defaultMessage="Your address not correct" />
                </div>
              )}
            </div>
            <div styleName="lowLevel" style={{ marginBottom: "50px" }}>
              <p styleName="balance">
                {balance} {currency.toUpperCase()}
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
                  usd={getUsd.toFixed(2)}
                  onKeyDown={inputReplaceCommaWithDot}
                />
                <div style={{ marginLeft: "15px" }}>
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
                  <div styleName={minus ? "rednote" : "note"}>
                    <FormattedMessage
                      id="WithdrawModal256"
                      defaultMessage="No less than {minAmount}"
                      values={{ minAmount: `${min}` }}
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
                        <FormattedMessage id="WithdrawModal111" defaultMessage="Withdraw" /> {`${currency.toUpperCase()}`}
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
            {
              error && (
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
              )
            }
            {invoice &&
              <Fragment>
                <hr />
                <div styleName="lowLevel" style={{ marginBottom: "50px" }}>
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
                <Button styleName="buttonFull" blue big fullWidth disabled={(!(ownTx) || isShipped)} onClick={this.handleSubmit}>
                  {isShipped
                    ? (
                      <Fragment>
                        <FormattedMessage id="WithdrawModal11212" defaultMessage="Processing ..." />
                      </Fragment>
                    )
                    : (
                      <FormattedMessage id="WithdrawModalInvoiceSaveTx" defaultMessage="Отметить как оплаченный" />
                    )
                  }
                </Button>
              </Fragment>
            }
          </Fragment>
        }
        {step === 'rawlink' &&
          <Fragment>
            <p styleName="notice">
              <FormattedMessage id="WithdrawMSUserReady" defaultMessage="TX confirm link" />
              <br />
              <FormattedMessage id="WithdrawMSUserMessage" defaultMessage="Send this link to other wallet owner" />
            </p>
            <div styleName="highLevel">
              <div styleName="groupField">

              </div>
              <div>
                <ShareLink link={txConfirmLink} />
              </div>
            </div>
            <div styleName="centerAlign">
              <Button styleName="buttonFull" big blue fullWidth onClick={this.handleReady}>
                <FormattedMessage id="WithdrawMSUserFinish" defaultMessage="Ready" />
              </Button>
            </div>
          </Fragment>
        }
      </Modal>
    )
  }
}
