import React, { Fragment } from 'react'
import cx from 'classnames'
import cssModules from 'react-css-modules'
import styles from './WithdrawModal.scss'

import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'
import typeforce from 'swap.app/util/typeforce'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import { isMobile } from 'react-device-detect'

import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import { localisedUrl } from 'helpers/locale'
import minAmount from 'helpers/constants/minAmount'
import redirectTo from 'helpers/redirectTo'
import getCurrencyKey from 'helpers/getCurrencyKey'
import lsDataCache from 'helpers/lsDataCache'
import helpers, {
  constants,
  links,
  adminFee,
  feedback,
  metamask,
} from 'helpers'

import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import QrReader from 'components/QrReader'
import InvoiceInfoBlock from 'components/InvoiceInfoBlock/InvoiceInfoBlock'
import AdminFeeInfoBlock from 'components/AdminFeeInfoBlock/AdminFeeInfoBlock'
import CurrencyList from './components/CurrencyList'
import FeeInfoBlock from './components/FeeInfoBlock'

const isDark = localStorage.getItem(constants.localStorage.isDark)

type Currency = {
  addAssets: boolean
  fullTitle: string
  icon: string
  name: string
  title: string
  value: string
}

type WithdrawModalProps = {
  name: 'WithdrawModal'
  activeFiat: string
  activeCurrency: string
  dashboardView: boolean
  isBalanceFetching: boolean
  currencies: Currency[]

  intl: IUniversalObj
  history: IUniversalObj
  data: IUniversalObj
  tokenItems: IUniversalObj[]
  items: IUniversalObj[]

  portalUI?: any
}

type WithdrawModalState = {
  isShipped: boolean
  isEthToken: boolean
  fetchFee: boolean
  isInvoicePay?: boolean
  
  devErrorMessage: string
  openScanCam: string
  address: string
  comment?: string
  ownTx: string
  selectedValue: string
  
  currentDecimals: number
  exCurrencyRate?: number
  fiatAmount?: number
  btcFeeRate: number
  amount: number

  ethBalance: null | number
  txSize: null | number
  maxFeeSize: null | number

  fees: {
    miner: BigNumber
    service: BigNumber
    total: BigNumber
    adminFeeSize: BigNumber
  }
  usedAdminFee: {
    address: string
    fee: number
    min: number
  }
  balances: {
    balance: BigNumber
    allowedCurrency: BigNumber
    allowedFiat: BigNumber
  }

  hiddenCoinsList: string[]
  error: IUniversalObj | false
  currentActiveAsset: IUniversalObj
  allCurrencyies: IUniversalObj[]
  selectedItem: IUniversalObj
}

@injectIntl
@connect(
  ({
    currencies,
    user: {
      ethData,
      btcData,
      ghostData,
      nextData,
      tokensData,
      activeFiat,
      isBalanceFetching,
      activeCurrency,
    },
    ui: { dashboardModalsAllowed },
  }) => ({
    activeFiat,
    activeCurrency,
    currencies: currencies.items,
    items: [ethData, btcData, ghostData, nextData],
    tokenItems: [...Object.keys(tokensData).map((k) => tokensData[k])],
    dashboardView: dashboardModalsAllowed,
    isBalanceFetching,
  })
)
@cssModules(styles, { allowMultiple: true })
export default class WithdrawModal extends React.Component<any, any> {
  /**
   * @method reportError
   * @method fixDecimalCountETH
   * @method addressIsCorrect
   * @method getFiatBalance
   * @method openScan
   * @method amountInputKeyDownCallback
   * @method updateServiceAndTotalFee
   * 
   * @method setCurrenctActiveAsset
   * @method setBalanceOnState
   * @method setCommissions
   * @method setBtcFeeRate
   * @method setMaxBalance
   * 
   * @method handleBuyCurrencySelect
   * @method handleAmount
   * @method handleSubmit
   * @method handleClose
   * @method handleScan
   */

  props: WithdrawModalProps
  state: WithdrawModalState

  mounted = true
  btcFeeTimer: ReturnType<typeof setTimeout> | null = null

  constructor(props) {
    super(props)

    const {
      data: { amount, toAddress, currency, address: withdrawWallet },
    } = props

    const currentActiveAsset = props.data

    const currentDecimals = constants.tokenDecimals[getCurrencyKey(currency, true).toLowerCase()]
    const allCurrencyies = actions.core.getWallets({}) //items.concat(tokenItems)
    const selectedItem = actions.user.getWithdrawWallet(currency, withdrawWallet)
    const usedAdminFee = adminFee.isEnabled(selectedItem.currency)

    this.state = {
      isShipped: false,
      usedAdminFee,
      openScanCam: '',
      address: toAddress ? toAddress : '',
      amount: amount ? amount : '',
      selectedItem,
      ethBalance: null,
      isEthToken: helpers.ethToken.isEthToken({ name: currency.toLowerCase() }),
      currentDecimals,
      selectedValue: currency,
      ownTx: '',
      hiddenCoinsList: actions.core.getHiddenCoins(),
      currentActiveAsset,
      allCurrencyies,
      error: false,
      devErrorMessage: '',
      fees: {
        miner: new BigNumber(0),
        service: new BigNumber(0),
        total: new BigNumber(0),
        adminFeeSize: new BigNumber(0),
      },
      balances: {
        balance: new BigNumber(selectedItem.balance || 0),
        allowedCurrency: new BigNumber(0),
        allowedFiat: new BigNumber(0),
      },
      maxFeeSize: null,
      btcFeeRate: null,
      fetchFee: true,
      txSize: null,
      isInvoicePay: !!(currentActiveAsset.invoice),
    }
  }

  componentWillUnmount() {
    this.mounted = false
    clearTimeout(this.btcFeeTimer)
  }

  componentDidMount() {
    this.getFiatBalance()
    this.setCommissions()
    this.setBalanceOnState()
    feedback.withdraw.entered()
  }

  componentDidUpdate(prevProps, prevState) {
    // ! delete
    console.log('FORM PROPS: ', this.props)
    console.log('FORM STATE: ', this.state)

    const { 
      data: prevData, 
      items: prevItems,
      isBalanceFetching: prevIsBalanceFetching,
    } = prevProps
    const { 
      data, 
      items,
      isBalanceFetching,
    } = this.props
    const {
      amount: prevAmount,
      fiatAmount: prevFiatAmount,
    } = prevState
    const {
      amount,
      fiatAmount,
    } = this.state

    if (prevData !== data || prevItems !== items) {
      this.setCurrenctActiveAsset()
    }
    if (prevIsBalanceFetching != isBalanceFetching && prevIsBalanceFetching === true) {
      this.setBalanceOnState()
    }
    if (prevAmount !== amount || prevFiatAmount !== fiatAmount) {
      this.updateServiceAndTotalFee()
    }
  }

  componentWillUpdate(nextProps, nextState) {
    nextState.amount = this.fixDecimalCountETH(nextState.amount)
  }

  reportError = (error: IUniversalObj, details: string = '-') => {
    feedback.withdraw.failed(`details(${details}) : error message(${error.message})`)
    console.error(`Send form. details(${details}) : error(${error})`)
    this.setState({ 
      devErrorMessage: error.message,
      error: {
        name: error.name,
        message: error.message,
      },
    })
  }

  setCurrenctActiveAsset = () => {
    const { items, tokenItems, data } = this.props
    const allCurrencyies = items.concat(tokenItems)
    this.setState({
      currentActiveAsset: data,
      allCurrencyies,
    })
  }

  fixDecimalCountETH = (amount) => {
    if (this.props.data.currency === 'ETH' && new BigNumber(amount).dp() > 18) {
      const amountInt = new BigNumber(amount).integerValue()
      const amountDecimal = new BigNumber(amount).mod(1)

      const amountIntStr = amountInt.toString()
      const amountDecimalStr = new BigNumber(new BigNumber(amountDecimal).toPrecision(15))
        .toString()
        .substring(1)
      const regexr = /[e+-]/g

      const result = amountIntStr + amountDecimalStr

      console.warn(
        'To avoid [ethjs-unit]error: while converting number with more then 18 decimals to wei - you can`t afford yourself add more than 18 decimals'
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

  setBtcFeeRate = async () => {
    const {
      selectedItem: {
        address,
        isUserProtected,
        isSmsProtected,
        isPinProtected,
      },
      amount,
    } = this.state

    let method = `send`
    if (isUserProtected) method = `send_multisig`
    if (isSmsProtected || isPinProtected) method = `send_2fa`

    const BYTE_IN_KB = 1024

    try {
      const { feeRate, txSize, fee } = await helpers.btc.estimateFeeValue({
        method,
        speed: 'fast',
        address,
        amount,
        moreInfo: true,
      })
      const feeSatByte = new BigNumber(feeRate).dividedBy(BYTE_IN_KB).dp(0, BigNumber.ROUND_CEIL).toNumber()

      if (!this.mounted) return

      this.setState((state) => ({
        btcFeeRate: feeSatByte,
        txSize,
        fees: {
          ...state.fees,
          miner: new BigNumber(fee),
        },
      }))
    } catch (error) {
      this.reportError(error)
    }
  }

  setCommissions = async () => {
    const {
      data: { currency },
    } = this.props
    const {
      isEthToken,
      selectedItem,
      usedAdminFee,
      amount,
      maxFeeSize,
      currentDecimals,
    } = this.state

    const currentCoin = getCurrencyKey(currency, true).toLowerCase()
    const adminFeeSize = usedAdminFee ? adminFee.calc(currency, amount) : 0
    let newMinerFee = new BigNumber(0)

    if (!this.mounted) return
    this.setState({ fetchFee: true })

    try {
      if (isEthToken) {
        // if decimals < 7 then equal 0.0...1
        // if decimals >= 7 then equal 1e-<decimals>
        minAmount[currentCoin] = 10 ** -currentDecimals
        minAmount.eth = await helpers.eth.estimateFeeValue({
          method: 'send',
          speed: 'fast',
        })

        newMinerFee = new BigNumber(await helpers.ethToken.estimateFeeValue({
          method: 'send',
          speed: 'fast',
        }))
      }

      if (constants.coinsWithDynamicFee.includes(currentCoin)) {
        let method = 'send'
        if (selectedItem.isUserProtected) method = 'send_multisig'
        if (selectedItem.isPinProtected || selectedItem.isSmsProtected) method = 'send_2fa'

        newMinerFee = new BigNumber(await helpers[currentCoin].estimateFeeValue({
          method,
          speed: 'fast',
          address: selectedItem.address,
          amount,
        }))

        minAmount[currentCoin] = newMinerFee.toNumber()

        if (selectedItem.isBTC) {
          this.setBtcFeeRate()
        }

        this.setState((state) => ({
          maxFeeSize: (amount) ? maxFeeSize : newMinerFee.toNumber(),
        }))
      }

      this.setState((state) => ({
        fees: {
          ...state.fees,
          miner: newMinerFee,
          service: new BigNumber(adminFeeSize),
          total: newMinerFee.plus(adminFeeSize),
          adminFeeSize: new BigNumber(adminFeeSize),
        },
      }))
    } catch (error) {
      this.reportError(error)
    } finally {
      this.setState({ fetchFee: false })
    }
  }

  setBalanceOnState = async () => {
    const {
      selectedItem: { currency, address },
      currentActiveAsset,
    } = this.state

    const wallet = actions.user.getWithdrawWallet(currency, address)

    const { unconfirmedBalance } = wallet
    const balance = await actions.core.fetchWalletBalance(wallet)
    wallet.balance = balance

    const finalBalance =
      unconfirmedBalance !== undefined && unconfirmedBalance < 0
        ? new BigNumber(balance).plus(unconfirmedBalance).toString()
        : balance

    const ethBalance =
      metamask.isEnabled() && metamask.isConnected()
        ? metamask.getBalance()
        : await actions.eth.getBalance()


    this.setState((state) => ({
      ethBalance,
      selectedItem: wallet,
      balances: {
        ...state.balances,
        balance: new BigNumber(finalBalance),
      },
      currentActiveAsset: {
        ...currentActiveAsset,
        ...wallet,
      },
    }))
    this.setAlowedBalances()
  }

  getFiatBalance = async () => {
    const {
      data: { currency },
      activeFiat,
    } = this.props
    const {
      amount,
      fiatAmount,
    } = this.state

    const exCurrencyRate = await actions.user.getExchangeRate(currency, activeFiat.toLowerCase())

    this.setState({
      exCurrencyRate,
      fiatAmount: (amount) ? new BigNumber(amount).multipliedBy(exCurrencyRate).toFixed(2) : fiatAmount,
    })
  }

  handleSubmit = async () => {
    feedback.withdraw.started()

    const {
      address: to,
      amount,
      ownTx,
      fees,
      selectedItem,
      isEthToken,
      comment = ''
    } = this.state

    const {
      data: { currency, address, invoice, onReady },
      name,
    } = this.props

    this.setState(() => ({
      isShipped: true,
      error: false,
      devErrorMessage: '',
    }))

    this.setBalanceOnState()

    let sendOptions = {
      from: address,
      to,
      amount,
      speed: 'fast',
      name: isEthToken ? currency.toLowerCase() : '',
    }

    // ? is it need ?
    // Опрашиваем балансы отправителя и получателя на момент выполнения транзакции
    // Нужно для расчета final balance получателя и отправителя
    let beforeBalances = false
    // try {
    //   // beforeBalances = await helpers.transactions.getTxBalances(currency, address, to)
    // } catch (error) {
    //   this.reportError(error, 'Fail fetch balances - may be destination is segwit')
    // }

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

    if (selectedItem.isPinProtected || selectedItem.isSmsProtected || selectedItem.isUserProtected) {
      let nextStepModal = constants.modals.WithdrawBtcPin
      if (selectedItem.isSmsProtected) nextStepModal = constants.modals.WithdrawBtcSms
      if (selectedItem.isUserProtected) nextStepModal = constants.modals.WithdrawBtcMultisig

      actions.modals.close(name)
      actions.modals.open(nextStepModal, {
        wallet: selectedItem,
        invoice,
        sendOptions,
        beforeBalances,
        onReady,
        adminFee: fees.adminFeeSize,
      })
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
        this.setBalanceOnState()

        this.setState(() => ({
          isShipped: false,
          error: false,
        }))

        if (onReady instanceof Function) {
          onReady()
        }

        // Redirect to tx
        const txInfo = helpers.transactions.getInfo(currency.toLowerCase(), txRaw)
        const { tx: txId } = txInfo

        // Не используем await. Сбрасываем статистику по транзакции (final balance)
        // Без блокировки клиента
        // Результат и успешность запроса критического значения не имеют
        helpers.transactions.pullTxBalances(txId, amount, beforeBalances, adminFee)

        // Сохраняем транзакцию в кеш
        const txInfoCache = {
          amount,
          senderAddress: address,
          receiverAddress: to,
          confirmed: false,
          adminFee: fees.adminFeeSize,
        }

        lsDataCache.push({
          key: `TxInfo_${currency.toLowerCase()}_${txId}`,
          time: 3600,
          data: txInfoCache,
        })
        feedback.withdraw.finished()

        if (comment) {
          actions.comments.setComment({
            key: txId,
            comment: comment
          })
        }

        const txInfoUrl = helpers.transactions.getTxRouter(currency.toLowerCase(), txId)
        redirectTo(txInfoUrl)
      })
      .then(() => {
        actions.modals.close(name)
      })
      .catch((error) => {
        const { selectedItem } = this.state
        const errorText = error.res ? error.res.text : ''
        const customError = {
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
          customError.message = {
            id: 'Withdraw232',
            defaultMessage: 'There is not enough confirmation of the last transaction. Try later.',
          }
        }

        this.reportError(error, `
          selected item: ${selectedItem.fullName} 
          custom message: ${customError.name.defaultMessage}
        `)
        this.setState(() => ({
          error: customError,
          isShipped: false,
        }))
      })
  }

  addressIsCorrect() {
    const {
      data: { currency },
    } = this.props
    const { address, isEthToken } = this.state

    if (getCurrencyKey(currency, false).toLowerCase() === `btc`) {
      if (!typeforce.isCoinAddress.BTC(address)) {
        return actions.btc.addressIsCorrect(address)
      }
      return true
    }

    if (isEthToken) {
      return typeforce.isCoinAddress.ETH(address)
    }

    return typeforce.isCoinAddress[getCurrencyKey(currency, false).toUpperCase()](address)
  }

  openScan = () => {
    const { openScanCam } = this.state

    this.setState(() => ({
      openScanCam: !openScanCam,
    }))
  }

  handleScan = (data) => {
    if (data) {
      const address = data.split(':')[1].split('?')[0]
      const amount = data.split('=')[1]

      this.setState(() => ({ address, amount }))
      this.openScan()
    }
  }

  handleAmount = (value) => {
    const {
      currentActiveAsset,
      currentDecimals,
      exCurrencyRate,
      selectedValue,
      selectedItem: {
        isBTC,
      },
    } = this.state

    if (isBTC) {
      clearTimeout(this.btcFeeTimer)
      this.btcFeeTimer = setTimeout(() => {
        this.setBtcFeeRate()
      }, 2000)
    }

    if (selectedValue === currentActiveAsset.currency) {
      this.setState({
        fiatAmount: value ? (value * exCurrencyRate).toFixed(2) : '',
        amount: value,
      })
    } else {
      this.setState({
        fiatAmount: value,
        amount: value ? (value / exCurrencyRate).toFixed(currentDecimals) : '',
      })
    }
  }

  handleClose = () => {
    const {
      history,
      intl: { locale },
    } = this.props
    const { name } = this.props

    history.push(localisedUrl(locale, links.home))
    actions.modals.close(name)
  }

  handleBuyCurrencySelect = (value) => {
    this.setState({
      selectedValue: value,
    })
  }

  setAlowedBalances = () => {
    const {
      isEthToken,
      usedAdminFee,
      currentDecimals,
      exCurrencyRate,
      balances,
      fees,
    } = this.state

    const ONE_HUNDRED_PERCENT = 100
    const minerFee = isEthToken ? new BigNumber(0) : fees.miner
    const maxService = usedAdminFee
        ? new BigNumber(usedAdminFee.fee).dividedBy(ONE_HUNDRED_PERCENT).multipliedBy(balances.balance)
        : new BigNumber(0)
    const maxAmount = balances.balance.minus(minerFee).minus(maxService).dp(currentDecimals, BigNumber.ROUND_FLOOR)
    const maxFiatAmount = maxAmount.multipliedBy(exCurrencyRate).dp(2, BigNumber.ROUND_FLOOR)

    if (maxAmount.isGreaterThan(balances.balance)) {
      this.setState({
        amount: 0,
        fiatAmount: 0,
      })
    } else {
      this.setState((state) => ({
        balances: {
          ...state.balances,
          allowedCurrency: maxAmount,
          allowedFiat: maxFiatAmount,
        },
      }))
    }
  }

  setMaxBalance = () => {
    const { balances } = this.state

    this.setAlowedBalances()
    this.setState({
      amount: balances.allowedCurrency.toNumber(),
      fiatAmount: balances.allowedFiat.toNumber(),
    })
  }

  updateServiceAndTotalFee = () => {
    const { usedAdminFee, amount, fees } = this.state
    const ONE_HUNDRED_PERCENT = 100

    let newServiceFeeSize = usedAdminFee
      ? new BigNumber(usedAdminFee.fee).dividedBy(ONE_HUNDRED_PERCENT).multipliedBy(amount)
      : new BigNumber(0)

    newServiceFeeSize = amount > 0 && newServiceFeeSize.isGreaterThan(fees.adminFeeSize)
      ? newServiceFeeSize
      : fees.adminFeeSize
    
    this.setState((state) => ({
      fees: {
        ...state.fees,
        service: newServiceFeeSize,
        total: fees.miner.plus(newServiceFeeSize),
      },
    }))
  }

  amountInputKeyDownCallback = (event) => {
    const { currentDecimals, currentActiveAsset, selectedValue } = this.state
    // key codes
    const BACKSPACE = 8
    const LEFT_ARROW = 37
    const RIGHT_ARROW = 39
    const DELETE = 46
    const isNumber = +event.key >= 0 && +event.key <= 9
    const amountValue = event.target.value
    // ! doesn't work
    if (event.key === ',') {
      inputReplaceCommaWithDot(event)
    }
    
    if (
      !(isNumber ||
        event.keyCode === BACKSPACE ||
        event.keyCode === LEFT_ARROW ||
        event.keyCode === RIGHT_ARROW ||
        event.keyCode === DELETE ||
        event.key === '.' ||
        event.key === ','
      )
    ) {
      event.preventDefault()
    } else if (amountValue.includes('.')) {
      // block number input if quantity decimal places
      // more than allowed (crypto: currentDecimals | fiat: 2)
      const maxQuantityDecimals = selectedValue === currentActiveAsset.currency
        ? amountValue.split('.')[1].length === currentDecimals
        : amountValue.split('.')[1].length === 2

      maxQuantityDecimals && isNumber && event.preventDefault()
    }
  }

  render() {
    const {
      error,
      ownTx,
      amount,
      address,
      balances,
      isShipped,
      fiatAmount,
      isEthToken,
      openScanCam,
      exCurrencyRate,
      currentDecimals,
      hiddenCoinsList,
      currentActiveAsset,
      selectedValue,
      usedAdminFee,
      devErrorMessage,
      fees,
      fetchFee,
      txSize,
      btcFeeRate,
      selectedItem: {
        isBTC: isBTCWallet,
      },
    } = this.state

    const { name, intl, portalUI, activeFiat, dashboardView } = this.props
    const linked = Link.all(this, 'address', 'amount', 'ownTx', 'fiatAmount', 'amountRUB', 'comment')

    const {
      currency,
      address: currentAddress,
      balance: currentBalance,
      invoice,
    } = currentActiveAsset

    let tableRows = actions.core.getWallets({}).filter(({ currency, address, balance }) => {
      // @ToDo - В будущем нужно убрать проверку только по типу монеты.
      // Старую проверку оставил, чтобы у старых пользователей не вывалились скрытые кошельки

      return (
        (!hiddenCoinsList.includes(currency) &&
          !hiddenCoinsList.includes(`${currency}:${address}`)) ||
        balance > 0
      )
    })

    const activeCriptoCurrency = getCurrencyKey(currentActiveAsset.currency, true).toUpperCase()
    const selectedValueView = getCurrencyKey(selectedValue, true).toUpperCase()
    const criptoCurrencyHaveInfoPrice = returnHaveInfoPrice();

    function returnHaveInfoPrice(): boolean {
      let result = true

      tableRows.forEach(item => {
        if (item.currency === activeCriptoCurrency) {
          result = item.infoAboutCurrency && item.infoAboutCurrency.price_fiat
        }
      })

      return result
    }

    const isDisabled =
      !address ||
      !+amount ||
      isShipped ||
      !!ownTx ||
      !this.addressIsCorrect() ||
      new BigNumber(amount).isGreaterThan(balances.balance) ||
      new BigNumber(amount).dp() > currentDecimals ||
      new BigNumber(amount).isGreaterThan(
        selectedValue === currentActiveAsset.currency
          ? balances.allowedCurrency
          : balances.allowedFiat
      )

    const labels = defineMessages({
      withdrowModal: {
        id: 'withdrowTitle271',
        defaultMessage: `Send`,
      },
      balanceFiatMobile: {
        id: 'Withdraw_FiatBalanceMobile',
        defaultMessage: '~{amount} {currency}',
      },
      balanceFiatDesktop: {
        id: 'Withdraw_FiatBalanceDesktop',
        defaultMessage: 'это ~{amount} {currency}',
      },
      balanceMobile: {
        id: 'Withdraw_BalanceMobile',
        defaultMessage: '{amount} {currency}',
      },
      balanceDesktop: {
        id: 'Withdraw_BalanceDesktop',
        defaultMessage: '{amount} {currency} будет отправленно',
      },
      ownTxPlaceholder: {
        id: 'withdrawOwnTxPlaceholder',
        defaultMessage: 'Если оплатили с другого источника',
      },
    })

    const dataCurrency = isEthToken ? 'ETH' : currency.toUpperCase()

    const formRender = (
      <Fragment>
        {openScanCam && (
          <QrReader
            openScan={this.openScan}
            handleError={this.reportError}
            handleScan={this.handleScan}
          />
        )}
        {invoice && <InvoiceInfoBlock invoiceData={invoice} />}
        {!dashboardView && (
          <p styleName={isEthToken ? 'rednotes' : 'notice'}>
            <FormattedMessage
              id="Withdrow213"
              defaultMessage="Please note: Fee is {minAmount} {data}.{br}Your balance must exceed this sum to perform transaction"
              values={{
                minAmount: <span>{isEthToken ? minAmount.eth : fees.total}</span>,
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
            <CurrencyList
              {...this.props}
              currentActiveAsset={currentActiveAsset}
              currentBalance={currentBalance}
              currency={currency}
              exCurrencyRate={exCurrencyRate}
              activeFiat={activeFiat}
              tableRows={tableRows}
              currentAddress={currentAddress}
            />
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
            qr={isMobile}
            withMargin
            openScan={this.openScan}
          />
          {/* show invalid value warning in address input */}
          {address && !this.addressIsCorrect() && (
            <div styleName="rednote bottom0">
              <FormattedMessage
                id="WithdrawIncorectAddress"
                defaultMessage="Your address not correct"
              />
            </div>
          )}
        </div>
        <div styleName={`lowLevel ${isDark ? 'dark' : ''}`} style={{ marginBottom: '30px' }}>
          <div styleName="additionalСurrencies">
            {criptoCurrencyHaveInfoPrice
              ? (
                <>
                  <span
                    styleName={cx('additionalСurrenciesItem', {
                      additionalСurrenciesItemActive: selectedValue.toUpperCase() === activeFiat,
                    })}
                    onClick={() => this.handleBuyCurrencySelect(activeFiat)}
                  >
                    {activeFiat}
                  </span>
                  <span styleName="delimiter"></span>
                </>
              )
              : null
            }
            <span
              styleName={cx('additionalСurrenciesItem', {
                additionalСurrenciesItemActive:
                  selectedValueView === activeCriptoCurrency,
              })}
              onClick={() => this.handleBuyCurrencySelect(currentActiveAsset.currency)}
            >
              {activeCriptoCurrency}
            </span>
          </div>
          <p styleName="balance">
            {amount > 0 && criptoCurrencyHaveInfoPrice && (
              <FormattedMessage
                {...labels[
                  selectedValue !== activeFiat
                    ? isMobile
                      ? `balanceFiatMobile`
                      : `balanceFiatDesktop`
                    : isMobile
                    ? `balanceMobile`
                    : `balanceDesktop`
                ]}
                values={{
                  amount:
                    selectedValue !== activeFiat
                      ? new BigNumber(fiatAmount).dp(2, BigNumber.ROUND_FLOOR).toNumber()
                      : new BigNumber(amount).dp(6, BigNumber.ROUND_FLOOR).toNumber(),
                  currency: selectedValue !== activeFiat ? activeFiat : activeCriptoCurrency.toUpperCase(),
                }}
              />
            )}
          </p>

          <FieldLabel>
            <FormattedMessage id="Withdrow118" defaultMessage="Amount" />
          </FieldLabel>
          <div styleName="group">
            <Input
              type="number"
              pattern="0-9\.:"
              onKeyDown={this.amountInputKeyDownCallback}
              valueLink={selectedValue === currentActiveAsset.currency
                ? linked.amount.pipe(this.handleAmount)
                : linked.fiatAmount.pipe(this.handleAmount)
              }
            />
            <div style={{ marginLeft: '15px' }}>
              <Button disabled={fetchFee} blue big onClick={this.setMaxBalance} id="Withdrow134">
                <FormattedMessage id="Select210" defaultMessage="MAX" />
              </Button>
            </div>
            {!isMobile && (
              <Tooltip id="Withdrow134" place="top" mark={false}>
                <FormattedMessage
                  id="WithdrawButton32"
                  defaultMessage="When you click this button, in the field, an amount{br}equal to your balance minus the miners commission will appear"
                  values={{
                    br: <br />,
                  }}
                />
              </Tooltip>
            )}
          </div>
          {/* hint about maximum possible amount */}
          {dashboardView && (
            <div styleName={'prompt'}>
              <FormattedMessage
                id="Withdrow170"
                defaultMessage="Maximum amount you can send is {allowedBalance} {currency}"
                values={{
                  allowedBalance: selectedValue === currentActiveAsset.currency
                    ? balances.allowedCurrency.toNumber()
                    : balances.allowedFiat.toNumber(),
                  currency: selectedValue === currentActiveAsset.currency 
                    ? activeCriptoCurrency
                    : activeFiat,
                }}
              />{' '}
              <Tooltip id="WtH204">
                <div style={{ maxWidth: '24em', textAlign: 'center' }}>
                  <FormattedMessage
                    id="WTH276"
                    defaultMessage="The amount should not exceed your{br} current balance minus mining fee"
                    values={{
                      br: <br />,
                    }}
                  />
                </div>
              </Tooltip>
            </div>
          )}
        </div>
        <div styleName="commentFormWrapper" >
          <FieldLabel>
            <FormattedMessage id="Comment" defaultMessage="Comment" />
          </FieldLabel>
          <div styleName="group">
            <Input
              valueLink={linked.comment}
              placeholder={
                intl.formatMessage({
                  id: 'Comment',
                  defaultMessage: 'Comment',
                })
              }
            />
          </div>
        </div>
        <div styleName="sendBtnsWrapper">
          <div styleName="actionBtn">
            <Button big fill gray onClick={this.handleClose}>
              <Fragment>
                <FormattedMessage id="WithdrawModalCancelBtn" defaultMessage="Cancel" />
              </Fragment>
            </Button>
          </div>
          <div styleName="actionBtn">
            <Button blue big fill disabled={isDisabled} onClick={this.handleSubmit}>
              {isShipped ? (
                <Fragment>
                  <FormattedMessage id="WithdrawModal11212" defaultMessage="Processing ..." />
                </Fragment>
              ) : (
                <Fragment>
                  <FormattedMessage id="WithdrawModal111" defaultMessage="Send" />{' '}
                  {`${currency.toUpperCase()}`}
                </Fragment>
              )}
            </Button>
          </div>
        </div>
        {usedAdminFee && isEthToken && (
          <AdminFeeInfoBlock {...usedAdminFee} currency={currency} />
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
        {dashboardView && (
          <>
            <div style={{ paddingTop: '2em' }}>
              <FeeInfoBlock
                isEthToken={isEthToken}
                currency={currency}
                activeFiat={activeFiat}
                dataCurrency={dataCurrency}
                exCurrencyRate={exCurrencyRate}
                feeCurrentCurrency={btcFeeRate}
                isLoading={fetchFee}
                usedAdminFee={usedAdminFee}
                hasTxSize={isBTCWallet}
                txSize={txSize}
                minerFee={fees.miner}
                serviceFee={fees.service}
                totalFee={fees.total}
              />
            </div>
            {error && (
                <div styleName="errorBlock">
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
                  <br />
                  {devErrorMessage && <span>Dev info: {devErrorMessage}</span>}
                </div>
              )
            }
          </>
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