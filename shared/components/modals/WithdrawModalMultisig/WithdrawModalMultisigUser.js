import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './WithdrawModalMultisigUser.scss'

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
// import { isCoinAddress } from 'swap.app/util/typeforce'
import minAmount from 'helpers/constants/minAmount'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import links from 'helpers/links'
import CopyToClipboard from 'react-copy-to-clipboard'


@injectIntl
@connect(
  ({
    currencies,
    user: { ethData, btcData, btcMultisigUserData, bchData, tokensData, eosData, telosData, nimData, ltcData /* usdtOmniData, nimData */ },
  }) => ({
    currencies: currencies.items,
    items: [ ethData, btcData, btcMultisigUserData, eosData, telosData, bchData, ltcData /* usdtOmniData, nimData */ ],
    tokenItems: [ ...Object.keys(tokensData).map(k => (tokensData[k])) ],
  })
)
@cssModules( { ...styles, ...ownStyle }, { allowMultiple: true })
export default class WithdrawModalMultisigUser extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(data) {
    super()

    const { data: { currency }, items, tokenItems } = data

    const currentDecimals = constants.tokenDecimals.btcmultisig
    const allCurrencyies = items.concat(tokenItems)
    const selectedItem = allCurrencyies.filter(item => item.currency === currency)[0]

    this.state = {
      step: 'fillform',
      isShipped: false,
      address: '',
      amount: '',
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

  componentWillUpdate(nextProps, nextState) {
    nextState.amount = this.fixDecimalCountETH(nextState.amount)
  }

  fixDecimalCountETH = (amount) => {
    if (this.props.data.currency === 'ETH' && BigNumber(amount).dp() > 18) {
      const amountInt = BigNumber(amount).integerValue()
      const amountDecimal = BigNumber(amount).mod(1)

      const amountIntStr = amountInt.toString()
      const amountDecimalStr = BigNumber(BigNumber(amountDecimal).toPrecision(15)).toString().substring(1)
      const regexr = /[e+-]/g

      const result = amountIntStr + amountDecimalStr

      console.warn("To avoid [ethjs-unit]error: while converting number with more then 18 decimals to wei - you can't afford yourself add more than 18 decimals") // eslint-disable-line
      if (regexr.test(result)) {
        console.warn('And ofcourse you can not write number which can not be saved without an exponential notation in JS')
        return 0
      }
      return result
    }
    return amount
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
    const { data: { currency } } = this.props
    const { isEthToken } = this.state

    const currentCoin = currency.toLowerCase()

    if (isEthToken) {
      minAmount[currentCoin] = this.getMinAmountForEthToken()
      minAmount.eth = await helpers.eth.estimateFeeValue({ method: 'send', speed: 'fast' })
    }

    if (constants.coinsWithDynamicFee.includes(currentCoin)) {
      minAmount[currentCoin] = await helpers[currentCoin].estimateFeeValue({ method: 'send', speed: 'fast' })
    }
  }

  setBalanceOnState = async (currency) => {
    const { data: { unconfirmedBalance } } = this.props

    const balance = await actions.btcmultisig.getBalanceUser()

    const finalBalance = unconfirmedBalance !== undefined && unconfirmedBalance < 0
      ? new BigNumber(balance).plus(unconfirmedBalance).toString()
      : balance
    const ethBalance = await actions.eth.getBalance()

    this.setState(() => ({
      balance: finalBalance,
      ethBalance,
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

  handleConfirmSMS = async () => {
    const { code } = this.state
    const { address: to, amount } = this.state
    const { data: { currency, address, balance }, name } = this.props
    
    const result = await actions.btcmultisig.confirmSMSProtected(code)
    if (result && result.txid) {
      actions.loader.hide()

      actions.notifications.show(constants.notifications.SuccessWithdraw, {
        amount,
        currency,
        address: to,
      })
      
      actions.modals.close(name)
    } else {
      if (result
        && result.error
        && (result.error=='Fail broadcast')
        && result.rawTX
      ) {
        const resBroatcast = await actions.btcmultisig.broadcastTx(result.rawTX)
        actions.loader.hide()

        actions.notifications.show(constants.notifications.SuccessWithdraw, {
          amount,
          currency,
          address: to,
        })
        
        actions.modals.close(name)
      }
    }
  }

  handleSubmit = async () => {
    const { address: to, amount } = this.state
    const { data: { currency, address, balance }, name } = this.props

    this.setState(() => ({ isShipped: true }))

    this.setBalanceOnState(currency)

    let sendOptions = {
      to,
      amount,
      speed: 'fast',
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
    
    this.setState({
      step: 'rawlink',
      txRaw: result,
      isShipped: false,
    })
  }

    sellAllBalance = async () => {
      const { amount, balance, currency, isEthToken } = this.state
      const { data } = this.props

      const minFee = minAmount.btc

      const balanceMiner = balance
        ? balance !== 0
          ? new BigNumber(balance).minus(minFee).toString()
          : balance
        : 'Wait please. Loading...'

      this.setState({
        amount: balanceMiner,
      })
    }

    isEthOrERC20() {
      const { name, data, tokenItems }  = this.props
      const { currency, ethBalance, isEthToken } = this.state
      return (
        (isEthToken === true && ethBalance < minAmount.eth) ? ethBalance < minAmount.eth : false
      )
    }

    addressIsCorrect() {
      const { data: { currency } } = this.props
      const { address, isEthToken } = this.state

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
    render() {
      const { address, amount, code, balance, isShipped, minus, ethBalance,
        isEthToken, exCurrencyRate, currentDecimals, error, step, txRaw,
        isLinkCopied } = this.state
      const { name, data: { currency }, tokenItems, items, intl } = this.props

      const txConfirmLink = `${location.origin}${links.multisign}/btc/confirm/${txRaw}`
      const linked = Link.all(this, 'address', 'amount', 'code')

      const min = minAmount.btcmultisig
      const dataCurrency = isEthToken ? 'ETH' : currency.toUpperCase()

      const isDisabled =
        !address || !amount || isShipped
        || !this.addressIsCorrect()
        || BigNumber(amount).isGreaterThan(balance)
        || BigNumber(amount).dp() > currentDecimals
        || this.isEthOrERC20()
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

      const title = defineMessages({
        withdrowModal: {
          id: 'withdrowTitle271',
          defaultMessage: `Withdraw`,
        },
      })

      return (
        <Modal name={name} title={`${intl.formatMessage(title.withdrowModal)}${' '}${currency.toUpperCase()}`}>
          { step==='fillform' && 
            <Fragment>
              <p styleName={isEthToken ? 'rednotes' : 'notice'}>
                <FormattedMessage
                  id="Withdrow213"
                  defaultMessage="Please note: Miners fee is {minAmount} {data}.{br}Your balance must exceed this sum to perform transaction"
                  values={{ minAmount: `${isEthToken ? minAmount.eth : min}`, br: <br />, data: `${dataCurrency}` }} />
              </p>
              <div styleName="highLevel">
                <FieldLabel inRow>
                  <span style={{ fontSize: '16px' }}>
                    <FormattedMessage id="Withdrow1194" defaultMessage="Address " />
                  </span>
                  {' '}
                  <Tooltip id="WtH203" >
                    <div style={{ textAlign: 'center' }}>
                      <FormattedMessage
                        id="WTH275"
                        defaultMessage="Make sure the wallet you{br}are sending the funds to supports {currency}"
                        values={{ br: <br />, currency: `${currency.toUpperCase()}` }}
                      />
                    </div>
                  </Tooltip>
                </FieldLabel>
                <Input valueLink={linked.address} focusOnInit pattern="0-9a-zA-Z:" placeholder={`Enter ${currency.toUpperCase()} address to transfer`} />
                {address && !this.addressIsCorrect() && (
                  <div styleName="rednote">
                    <FormattedMessage
                      id="WithdrawIncorectAddress"
                      defaultMessage="Your address not correct" />
                  </div>
                )}
              </div>
              <div styleName="lowLevel">
                <div styleName="groupField">
                  <p styleName="balance">
                    {balance}
                    {' '}
                    {currency.toUpperCase()}
                  </p>
                  <div styleName="downLabel">
                    <FieldLabel inRow>
                      <span styleName="mobileFont">
                        <FormattedMessage id="Withdrow118" defaultMessage="Amount " />
                      </span>
                    </FieldLabel>
                  </div>
                </div>
                <div styleName="group">
                  <Input
                    styleName="input"
                    valueLink={linked.amount}
                    pattern="0-9\."
                    placeholder="Enter the amount"
                    usd={getUsd.toFixed(2)}
                    onKeyDown={inputReplaceCommaWithDot}
                  />
                  <button styleName="button" onClick={this.sellAllBalance} data-tip data-for="Withdrow134">
                    <FormattedMessage id="Select210" defaultMessage="MAX" />
                  </button>
                  {!isMobile &&
                    <ReactTooltip id="Withdrow134" type="light" effect="solid" styleName="r-tooltip">
                      <FormattedMessage
                        id="WithdrawButton32"
                        defaultMessage="when you click this button, in the field, an amount equal to your balance minus the miners commission will appear" />
                    </ReactTooltip>
                  }
                </div>
                {
                  !linked.amount.error && (
                    <div styleName={minus ? 'rednote' : 'note'}>
                      <FormattedMessage id="WithdrawModal256" defaultMessage="No less than {minAmount}" values={{ minAmount: `${min}` }} />
                    </div>
                  )
                }
                {
                  this.isEthOrERC20() && (
                    <div styleName="rednote">
                      <FormattedMessage id="WithdrawModal263" defaultMessage="You need {minAmount} ETH on your balance" values={{ minAmount: `${minAmount.eth}` }} />
                    </div>
                  )
                }
              </div>
              <Button styleName="buttonFull" brand fullWidth disabled={isDisabled} onClick={this.handleSubmit}>
                { isShipped
                  ? (
                    <Fragment>
                      <FormattedMessage id="WithdrawModal11212" defaultMessage="Processing ..." />
                    </Fragment>
                  )
                  : (
                    <Fragment>
                      <FormattedMessage id="WithdrawModal111" defaultMessage="Withdraw" />
                      {' '}
                      {`${currency.toUpperCase()}`}
                    </Fragment>
                  )
                }
              </Button>
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
            </Fragment>
          }
          { step==='rawlink' && 
            <Fragment>
              <CopyToClipboard
                text={txConfirmLink}
                onCopy={this.handleCopyLink}
              >
                <div styleName="highLevel">
                  <a styleName="link" onClick={e => e.preventDefault()}>
                    <FormattedMessage id="WithdrawMSUserReady" defaultMessage="TX confirm link" />
                  </a>
                  <div styleName="groupField">
                    <FormattedMessage id="WithdrawMSUserMessage" defaultMessage="Send this link to other wallet owner" />
                  </div>
                  <div styleName="multisignConfirmTxLink">
                    {txConfirmLink}
                  </div>
                  <div styleName="centerAlign">
                    <Button
                      styleName="buttonFull"
                      brand
                      onClick={() => {}}
                      disabled={isLinkCopied}
                    >
                      { isLinkCopied ?
                        <FormattedMessage id="WithdrawMSLinkCopied" defaultMessage="Link copied to clipboard" />
                        :
                        <FormattedMessage id="WithdrawMSLinkCopy" defaultMessage="Copy to clipboard" />
                      }
                    </Button>
                  </div>
                </div>
              </CopyToClipboard>
              <div styleName="centerAlign">
                <Button styleName="buttonFull" brand onClick={this.handleReady}>
                  <FormattedMessage id="WithdrawMSUserFinish" defaultMessage="Ready" />
                </Button>
              </div>
            </Fragment>
          }
        </Modal>
      )
    }
}
