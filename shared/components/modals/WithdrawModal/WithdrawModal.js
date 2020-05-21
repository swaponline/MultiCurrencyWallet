import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import helpers, { constants, links, request } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'helpers/externalConfig'
import { localisedUrl } from 'helpers/locale'

import cssModules from 'react-css-modules'
import styles from './WithdrawModal.scss'
import dropDownStyles from 'components/ui/DropDown/DropDown.scss'

import { BigNumber } from 'bignumber.js'
import Coin from 'components/Coin/Coin'
import PartOfAddress from '../../../pages/Wallet/components/PartOfAddress'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import ReactTooltip from 'react-tooltip'
import { isMobile, ConsoleView } from 'react-device-detect'
import QrReader from 'components/QrReader'
import InvoiceInfoBlock from 'components/InvoiceInfoBlock/InvoiceInfoBlock'

// import isCoinAddress from 'swap.app/util/typeforce'
import typeforce from 'swap.app/util/typeforce'
import minAmount from 'helpers/constants/minAmount'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'

import redirectTo from 'helpers/redirectTo'
import AdminFeeInfoBlock from 'components/AdminFeeInfoBlock/AdminFeeInfoBlock'

@injectIntl
@connect(
  ({
    currencies,
    user: { ethData, btcData, tokensData, activeFiat, isBalanceFetching },
    ui: { dashboardModalsAllowed },
  }) => ({
    activeFiat,
    currencies: currencies.items,
    items: [ethData, btcData],
    tokenItems: [...Object.keys(tokensData).map((k) => tokensData[k])],
    dashboardView: dashboardModalsAllowed,
    isBalanceFetching,
  })
)
@cssModules(styles, { allowMultiple: true })
export default class WithdrawModal extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(data) {
    super()

    const {
      data: { amount, toAddress, currency, hiddenCoinsList },
      items,
      tokenItems,
    } = data

    const currentDecimals = constants.tokenDecimals[currency.toLowerCase()]
    const allCurrencyies = items.concat(tokenItems)
    const selectedItem = allCurrencyies.filter((item) => item.currency === currency)[0]

    let usedAdminFee = false

    if (config && config.opts && config.opts.fee) {
      if (helpers.ethToken.isEthToken({ name: currency.toLowerCase() }) && config.opts.fee.erc20) {
        usedAdminFee = config.opts.fee.erc20
      } else {
        if (config.opts.fee[currency.toLowerCase()]) {
          usedAdminFee = config.opts.fee[currency.toLowerCase()]
        }
      }
    }

    this.getRubRates()

    const multiplier = data.data.infoAboutCurrency ? data.data.infoAboutCurrency.price_usd : 1

    this.state = {
      isShipped: false,
      usedAdminFee,
      openScanCam: '',
      address: toAddress ? toAddress : '',
      amount: amount ? amount : '',
      minus: '',
      balance: selectedItem.balance || 0,
      ethBalance: null,
      isEthToken: helpers.ethToken.isEthToken({ name: currency.toLowerCase() }),
      currentDecimals,
      selectedValue: localStorage.getItem(constants.localStorage.balanceActiveCurrency).toUpperCase() || data.data.currency,
      getFiat: 0,
      error: false,
      ownTx: '',
      isAssetsOpen: false,
      hiddenCoinsList,
      currentActiveAsset: data.data,
      allCurrencyies,
      multiplier,
    }
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

    //actions.user.getBalances()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data || prevProps.items !== this.props.items) {
      this.setCurrenctActiveAsset()
    }
  }

  setCurrenctActiveAsset = () => {
    const { items, tokenItems, data } = this.props
    const allCurrencyies = items.concat(tokenItems)
    this.setState({
      currentActiveAsset: data,
      allCurrencyies,
    })
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

      console.warn(
        "To avoid [ethjs-unit]error: while converting number with more then 18 decimals to wei - you can't afford yourself add more than 18 decimals"
      ) // eslint-disable-line
      if (regexr.test(result)) {
        console.warn(
          'And ofcourse you can not write number which can not be saved without an exponential notation in JS'
        )
        return 0
      }
      return result
    }
    return amount
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
    const {
      data: { currency },
    } = this.props
    const { isEthToken } = this.state

    const currentCoin = currency.toLowerCase()

    if (isEthToken) {
      minAmount[currentCoin] = this.getMinAmountForEthToken()
      minAmount.eth = await helpers.eth.estimateFeeValue({
        method: 'send',
        speed: 'fast',
      })
    }

    if (constants.coinsWithDynamicFee.includes(currentCoin)) {
      minAmount[currentCoin] = await helpers[currentCoin].estimateFeeValue({
        method: 'send',
        speed: 'fast',
      })
    }
  }

  setBalanceOnState = async (currency) => {
    const {
      data: { unconfirmedBalance },
    } = this.props

    // @ToDo - balance...
    const balance = await actions[currency.toLowerCase()].getBalance(currency.toLowerCase())

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

    this.setState(() => ({
      exCurrencyRate,
    }))
  }

  handleSubmit = async () => {
    const { address: to, amount, ownTx } = this.state
    const {
      data: { currency, address, balance, invoice, onReady },
      name,
      history,
      intl: { locale },
    } = this.props

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
        // from: address, // Need check eth
      }
    } else {
      sendOptions = {
        ...sendOptions,
        from: address,
      }
    }

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
    await actions[currency.toLowerCase()]
      .send(sendOptions)
      .then(async (txRaw) => {
        actions.loader.hide()
        actions[currency.toLowerCase()].getBalance(currency)
        if (invoice) {
          await actions.invoices.markInvoice(invoice.id, 'ready', txRaw, address)
        }
        this.setBalanceOnState(currency)

        /* actions.notifications.show(constants.notifications.SuccessWithdraw, {
           amount,
           currency,
           address: to
         });*/

        /*
        actions.modals.open(constants.modals.InfoPay, {
          amount,
          currency,
          balance,
          oldBalance: 0, // @Todo доделать old balance
          txRaw: txRaw,
          toAddress: to
        })
        */

        this.setState(() => ({ isShipped: false, error: false }))
        if (onReady instanceof Function) {
          onReady()
        }

        // Redirect to tx
        const txInfo = helpers.transactions.getInfo(currency.toLowerCase(), txRaw)
        const { tx: txId } = txInfo

        const txInfoUrl = helpers.transactions.getTxRouter(currency.toLowerCase(), txId)
        redirectTo(txInfoUrl)
      })
      .then(() => {
        actions.modals.close(name)
        // history.push('')
      })
      .catch((e) => {
        const errorText = e.res ? e.res.text : ''
        const error = {
          name: {
            id: 'Withdraw218',
            defaultMessage: 'Withdrawal error',
          },
          message: {
            id: 'ErrorNotification12',
            defaultMessage: 'Oops, looks like something went wrong!',
          },
        }

        if (/insufficient priority|bad-txns-inputs-duplicate/.test(errorText)) {
          error.message = {
            id: 'Withdraw232',
            defaultMessage: 'There is not enough confirmation of the last transaction. Try later.',
          }
        }

        console.error(error.name.defaultMessage, ':', e)

        this.setState(() => ({
          error,
          isShipped: false,
        }))
      })
  }

  sellAllBalance = async () => {
    const { amount, balance, isEthToken, usedAdminFee } = this.state

    const {
      data: { currency },
    } = this.props

    let minFee = isEthToken ? 0 : minAmount[currency.toLowerCase()]

    if (usedAdminFee) {
      let feeFromAmount = BigNumber(usedAdminFee.fee).dividedBy(100).multipliedBy(balance)
      minFee = BigNumber(minFee).plus(feeFromAmount).toNumber()
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

  isEthOrERC20() {
    const { name, data, tokenItems } = this.props
    const { currency, ethBalance, isEthToken } = this.state
    return isEthToken === true && ethBalance < minAmount.eth ? ethBalance < minAmount.eth : false
  }

  addressIsCorrect() {
    const {
      data: { currency },
    } = this.props
    const { address, isEthToken } = this.state

    // console.log(typeforce.isCoinAddress)
    if (isEthToken) {
      return typeforce.isCoinAddress.ETH(address)
    }

    return typeforce.isCoinAddress[currency.toUpperCase()](address)
  }

  openScan = () => {
    const { openScanCam } = this.state

    this.setState(() => ({
      openScanCam: !openScanCam,
    }))
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

  getRubRates() {
    request
      .get('https://www.cbr-xml-daily.ru/daily_json.js', {
        cacheResponse: 60 * 60 * 1000,
      })
      .then((rates) => {
        if (rates && rates.Valute && rates.Valute.USD) {
          const rubRates = rates.Valute.USD.Value
          this.setState({
            rubRates,
          })
        }
      })
  }

  handleDollarValue = (value) => {
    const { rubRates, currentDecimals, multiplier } = this.state

    this.setState({
      amountUSD: value,
      amountRUB: value ? (value * rubRates).toFixed(0) : '',
      amount: value ? (value / multiplier).toFixed(currentDecimals) : '',
    })
  }

  handleRubValue = (value) => {
    const { rubRates, currentDecimals, multiplier } = this.state

    this.setState({
      amountRUB: value,
      amountUSD: value ? (value / rubRates).toFixed(2) : '',
      amount: value ? (value / multiplier / rubRates).toFixed(currentDecimals) : '',
    })
  }

  handleAmount = (value) => {
    const { rubRates, multiplier } = this.state

    this.setState({
      amountRUB: value ? (value * multiplier * rubRates).toFixed(0) : '',
      amountUSD: value ? (value * multiplier).toFixed(2) : '',
      amount: value,
    })
  }

  handleClose = () => {
    const {
      history,
      intl: { locale },
    } = this.props
    const { name } = this.props
    history.push(localisedUrl(locale, links.wallet))
    actions.modals.close(name)
  }

  handleBuyCurrencySelect = (value) => {
    this.setState({
      selectedValue: value.name,
    })
  }

  openModal = (currency) => {
    const {
      history,
      intl: { locale },
    } = this.props
    const { Withdraw } = constants.modals

    const currentAsset = this.state.allCurrencyies.filter((item) => currency === item.currency)

    let targetCurrency = currentAsset[0].currency
    switch (currency.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (sms-protected)':
        targetCurrency = 'btc'
        break
    }

    const isToken = helpers.ethToken.isEthToken({ name: currency })

    history.push(
      localisedUrl(locale, (isToken ? '/token' : '') + `/${targetCurrency}/${currentAsset[0].address}/withdraw`)
    )
  }

  render() {
    const {
      address,
      amount,
      balance,
      isShipped,
      minus,
      ethBalance,
      openScanCam,
      isEthToken,
      exCurrencyRate,
      currentDecimals,
      error,
      hiddenCoinsList,
      ownTx,
      currentActiveAsset,
      isAssetsOpen,
      selectedValue,
      allCurrencyies,
      usedAdminFee,
    } = this.state

    const {
      name,
      data: { currency, invoice },
      tokenItems,
      items,
      intl,
      portalUI,
      isBalanceFetching,
      dashboardView,
    } = this.props

    const linked = Link.all(this, 'address', 'amount', 'ownTx', 'amountUSD', 'amountRUB', 'amount')

    let min = isEthToken ? 0 : minAmount[currency.toLowerCase()]
    let defaultMin = min

    let enabledCurrencies = allCurrencyies.filter(
      (x) => !hiddenCoinsList.map((item) => item.split(':')[0]).includes(x.currency)
    )

    if (usedAdminFee) {
      defaultMin = BigNumber(min).plus(usedAdminFee.min).toNumber()
      if (amount) {
        let feeFromAmount = BigNumber(usedAdminFee.fee).dividedBy(100).multipliedBy(amount)
        if (BigNumber(usedAdminFee.min).isGreaterThan(feeFromAmount)) feeFromAmount = BigNumber(usedAdminFee.min)

        min = BigNumber(min).plus(feeFromAmount).toNumber() // Admin fee in satoshi
      } else {
        min = defaultMin
      }
    }

    const dataCurrency = isEthToken ? 'ETH' : currency.toUpperCase()

    const isDisabled =
      !address ||
      !amount ||
      isShipped ||
      ownTx ||
      !this.addressIsCorrect() ||
      BigNumber(amount).isGreaterThan(balance) ||
      BigNumber(amount).dp() > currentDecimals ||
      this.isEthOrERC20()
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
      withdrowModal: {
        id: 'withdrowTitle271',
        defaultMessage: `Send`,
      },
      ownTxPlaceholder: {
        id: 'withdrawOwnTxPlaceholder',
        defaultMessage: 'Если оплатили с другого источника',
      },
    })

    const formRender = (
      <Fragment>
        {openScanCam && (
          <QrReader openScan={this.openScan} handleError={this.handleError} handleScan={this.handleScan} />
        )}
        {invoice && <InvoiceInfoBlock invoiceData={invoice} />}
        {!dashboardView && (
          <p styleName={isEthToken ? 'rednotes' : 'notice'}>
            <FormattedMessage
              id="Withdrow213"
              defaultMessage="Please note: Fee is {minAmount} {data}.{br}Your balance must exceed this sum to perform transaction"
              values={{
                minAmount: <span>{isEthToken ? minAmount.eth : min}</span>,
                br: <br />,
                data: `${dataCurrency}`,
              }}
            />
          </p>
        )}

        <div style={{ marginBottom: '40px' }}>
          <div styleName="customSelectContainer">
            <FieldLabel>
              <FormattedMessage id="Withdrow559" defaultMessage="Отправить с кошелька " />
            </FieldLabel>
            <div
              styleName="customSelectValue"
              onClick={() => this.setState({ isAssetsOpen: !this.state.isAssetsOpen })}
            >
              <div styleName="coin">
                <Coin name={currentActiveAsset.currency} />
              </div>
              <div>
                <a>{currentActiveAsset.currency}</a>
                <span styleName="address">{currentActiveAsset.address}</span>
                <span styleName="mobileAddress">
                  {isMobile ? <PartOfAddress address={currentActiveAsset.address} withoutLink /> : ''}
                </span>
              </div>
              <div styleName="amount">
                <span styleName="currency">
                  {currentActiveAsset.balance} {currentActiveAsset.currency}
                </span>
                <span styleName="usd">
                  {currentActiveAsset.infoAboutCurrency
                    ? (currentActiveAsset.balance * currentActiveAsset.infoAboutCurrency.price_usd).toFixed(2)
                    : (currentActiveAsset.balance * currentActiveAsset.currencyRate).toFixed(2)}{' '}
                  USD
                </span>
              </div>
              <div styleName={cx('customSelectArrow', { active: isAssetsOpen })}></div>
            </div>
            {isAssetsOpen && (
              <div styleName="customSelectList">
                {enabledCurrencies.map((item) => (
                  <div
                    styleName={cx('customSelectListItem customSelectValue', {
                      disabled: item.balance === 0,
                    })}
                    onClick={() => {
                      this.openModal(item.currency),
                        this.setState({
                          currentActiveAsset: item,
                          isAssetsOpen: false,
                        })
                    }}
                  >
                    <Coin name={item.currency} />
                    <div>
                      <a>{item.fullName}</a>
                      <span styleName="address">{item.address}</span>
                      <span styleName="mobileAddress">
                        {isMobile ? <PartOfAddress address={item.address} withoutLink /> : ''}
                      </span>
                    </div>
                    <div styleName="amount">
                      <span styleName="currency">
                        {item.balance} {item.currency}
                      </span>
                      <span styleName="usd">
                        {item.infoAboutCurrency
                          ? (item.balance * item.infoAboutCurrency.price_usd).toFixed(2)
                          : (item.balance * item.currencyRate).toFixed(2)}{' '}
                        USD
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div styleName="highLevel">
          <FieldLabel>
            <FormattedMessage id="Withdrow1194" defaultMessage="Address " />{' '}
            <Tooltip id="WtH203">
              <div style={{ textAlign: 'center' }}>
                <FormattedMessage
                  id="WTH275"
                  defaultMessage="Make sure the wallet you{br}are sending the funds to supports {currency}"
                  values={{
                    br: <br />,
                    currency: `${currency.toUpperCase()}`,
                  }}
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
        <div styleName="lowLevel" style={{ marginBottom: '50px' }}>
          <div styleName="additionalСurrencies">
            <span
              styleName={cx('additionalСurrenciesItem', { additionalСurrenciesItemActive: selectedValue === 'USD' })}
              onClick={() => {
                this.setState({ selectedValue: 'USD' })
                localStorage.setItem(constants.localStorage.balanceActiveCurrency, 'usd')
              }}
            >
              USD
            </span>
            <span styleName="delimiter"></span>
            <span
              styleName={cx('additionalСurrenciesItem', { additionalСurrenciesItemActive: selectedValue === currentActiveAsset.currency })}
              onClick={() => {
                this.setState({ selectedValue: currentActiveAsset.currency})
                localStorage.setItem(constants.localStorage.balanceActiveCurrency, currentActiveAsset.currency.toLowerCase())
              }}
            >
              {currentActiveAsset.currency}
            </span>
          </div>
          <p styleName="balance">
            {amount != ''
              ? `${BigNumber(amount).dp(5, BigNumber.ROUND_FLOOR)} ${currency.toUpperCase()} will be sent`
              : ''}
          </p>
          <FieldLabel>
            <FormattedMessage id="Withdrow118" defaultMessage="Amount " />
          </FieldLabel>

          <div styleName="group">
            {this.state.selectedValue === currentActiveAsset.currency ? (
              <Input
                withMargin
                valueLink={linked.amount.pipe(this.handleAmount)}
                pattern="0-9\."
                onKeyDown={inputReplaceCommaWithDot}
              />
            ) : (
              ''
            )}

            {this.state.selectedValue === 'USD' ? (
              <Input
                withMargin
                valueLink={linked.amountUSD.pipe(this.handleDollarValue)}
                pattern="0-9\."
                onKeyDown={inputReplaceCommaWithDot}
              />
            ) : (
              ''
            )}
            {/* <Input
              styleName="input"
              valueLink={linked.amount}
              pattern="0-9\."
              isPriceValueMask
              placeholder="Enter the amount"
              fiat={getFiat.toFixed(2)}
              onKeyDown={inputReplaceCommaWithDot}
            /> */}
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
            {/* {!linked.amount.error && (
              <div styleName={minus ? 'rednote' : 'note'}>
                <FormattedMessage
                  id="WithdrawModal256"
                  defaultMessage="No less than {minAmount}"
                  values={{ minAmount: `${defaultMin}` }}
                />
              </div>
            )} */}
          </div>
          {this.isEthOrERC20() && (
            <div styleName="rednote">
              <FormattedMessage
                id="WithdrawModal263"
                defaultMessage="You need {minAmount} ETH on your balance"
                values={{ minAmount: `${minAmount.eth}` }}
              />
            </div>
          )}
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
        {usedAdminFee && isEthToken && <AdminFeeInfoBlock {...usedAdminFee} amount={amount} currency={currency} />}
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
            <div styleName="lowLevel" style={{ marginBottom: '50px' }}>
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
              blue
              big
              fullWidth
              fullWidth
              disabled={!ownTx || isShipped}
              onClick={this.handleSubmit}
            >
              {isShipped ? (
                <Fragment>
                  <FormattedMessage id="WithdrawModal11212" defaultMessage="Processing ..." />
                </Fragment>
              ) : (
                <FormattedMessage id="WithdrawModalInvoiceSaveTx" defaultMessage="Отметить как оплаченный" />
              )}
            </Button>
          </Fragment>
        )}
        {dashboardView && (
          <p
            styleName={cx({
              notice: !isEthToken,
              rednotes: isEthToken,
              dashboardViewNotice: dashboardView,
            })}
          >
            <FormattedMessage
              id="Withdrow213"
              defaultMessage="Please note: Fee is {minAmount} {data}.{br}Your balance must exceed this sum to perform transaction"
              values={{
                minAmount: <span>{isEthToken ? minAmount.eth : min}</span>,
                br: <br />,
                data: `${dataCurrency}`,
              }}
            />
          </p>
        )}
      </Fragment>
    )
    return portalUI ? (
      formRender
    ) : (
      <Modal
        name={name}
        onClose={this.handleClose}
        title={`${intl.formatMessage(labels.withdrowModal)}${' '}${currency.toUpperCase()}`}
      >
        <div style={{ paddingBottom: '50px', paddingTop: '15px' }}>{formRender}</div>
      </Modal>
    )
  }
}
