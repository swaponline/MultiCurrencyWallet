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

  intl: { [key: string]: any }
  history: { [key: string]: any }
  data: { [key: string]: any }
  tokenItems: { [key: string]: any }[]
  items: { [key: string]: any }[]

  portalUI?: any
}

type AdminFee = {
  address: string
  fee: number // present (%)
  min: number
}

type Fees = {
  miner: BigNumber
  service: BigNumber
  total: BigNumber
}

type WithdrawModalState = {
  isShipped: boolean
  isEthToken: boolean
  isEthOrEthToken: boolean
  fetchFee: boolean
  devErrorMessage: boolean
  isInvoicePay?: boolean

  openScanCam: string
  address: string
  comment?: null | string
  amount: number
  ownTx: string
  selectedValue: string

  balance: number
  getFiat: number
  currentDecimals: number
  exCurrencyRate?: number
  fiatAmount?: number
  btcFeeRate: number
  txSize: null | number
  ethBalance: null | number
  maxFeeSize: null | number
  
  allowedCurrencyBalance: BigNumber
  allowedFiatBalance: BigNumber
  usedAdminFee: AdminFee
  fees: Fees

  hiddenCoinsList: string[]

  error: { [key: string]: any } | false
  currentActiveAsset: { [key: string]: any }
  allCurrencyies: { [key: string]: any }[]
  selectedItem: { [key: string]: any }
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
export default class WithdrawModal extends React.PureComponent<any, any> {
  /**
   * @method fixDecimalCountETH
   * @method reportError
   * @method openScan
   * 
   * @method addressIsCorrect
   * @method formOptionsIsCorrect
   * 
   * @method getFiatBalance
   * 
   * @method setFeeRate
   * @method setTotalFee
   * @method setFeeValues
   * @method setCurrenctActiveAsset
   * @method setBalanceOnState
   * @method setBtcFeeRate
   * @method setMaxBalance
   * 
   * @method handleScan
   * @method handleSubmit
   * @method handleDollarValue
   * @method handleAmount
   * @method handleClose
   * @method handleBuyCurrencySelect
   */

  props: WithdrawModalProps
  state: WithdrawModalState

  mounted = true
  btcFeeTimer: any = 0

  constructor(props) {
    super(props)

    const {
      data: { amount, toAddress, currency, address: currencyAddress },
    } = props

    const currentActiveAsset = props.data
    const currentDecimals = constants.tokenDecimals[getCurrencyKey(currency, true).toLowerCase()]
    const allCurrencyies = actions.core.getWallets({}) //items.concat(tokenItems)
    const selectedItem = actions.user.getWithdrawWallet(currency, currencyAddress)
    const usedAdminFee = adminFee.isEnabled(selectedItem.currency)

    this.state = {
      isShipped: false,
      openScanCam: '',
      address: toAddress ? toAddress : '',
      amount: amount ? amount : '',
      balance: selectedItem.balance || 0,
      selectedItem,
      ethBalance: null,
      isEthToken: helpers.ethToken.isEthToken({ name: currency.toLowerCase() }),
      isEthOrEthToken: helpers.ethToken.isEthOrEthToken({ name: currency.toLowerCase() }),
      currentDecimals,
      selectedValue: currency,
      getFiat: 0,
      error: false,
      ownTx: '',
      hiddenCoinsList: actions.core.getHiddenCoins(),
      currentActiveAsset,
      allCurrencyies,
      devErrorMessage: false,
      allowedCurrencyBalance: new BigNumber(0),
      allowedFiatBalance: new BigNumber(0),
      usedAdminFee: usedAdminFee,
      fees: {
        miner: new BigNumber(0),
        service: new BigNumber(0),
        total: new BigNumber(0),
      },
      fetchFee: true,
      txSize: null,
      maxFeeSize: null,
      btcFeeRate: null,
      isInvoicePay: !!(currentActiveAsset.invoice),
    }
  }

  componentWillUnmount() {
    this.mounted = false
    clearTimeout(this.btcFeeTimer)
  }

  componentDidMount() {
    this.getFiatBalance()
    this.setFeeValues()
    this.setTotalFee()
    this.setBalanceOnState()
    feedback.withdraw.entered()

    console.log('SEND FORM -------------------')
    console.log('props: ', this.props)
    console.log('state: ', this.state)
  }

  componentDidUpdate(prevProps) {
    const { 
      data: prevData, 
      items: prevItems, 
      isBalanceFetching: prevIsBalanceFetching 
    } = prevProps
    const { 
      data, 
      items, 
      isBalanceFetching 
    } = this.props

    if (prevData !== data || prevItems !== items) {
      this.setCurrenctActiveAsset()
    }
    if (
      prevIsBalanceFetching != isBalanceFetching &&
      prevIsBalanceFetching === true
    ) {
      this.setBalanceOnState()
    }
    // this.setTotalFee()
  }

  reportError = (error: IUniversalObj, details?: string) => {
    feedback.withdraw.failed(`details(${details}) : error message(${error.message})`)
    console.error(`Send form. details(${details}) : error(${error})`)
    this.setState({ devErrorMessage: error.message })
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

  setFeeRate = () => {
    const {
      selectedItem,
      isEthOrEthToken,
    } = this.state

    if (selectedItem.isBTC) {
      this.setBtcFeeRate()
    } else if (isEthOrEthToken) {
      this.setEthFeeRate()
    }
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
    if (isSmsProtected) method = `send_2fa`
    if (isPinProtected) method = `send_2fa`

    const BYTE_IN_KB = 1024

    this.setState({ fetchFee: true })

    try {
      const feeData = await helpers.btc.estimateFeeValue({
        method,
        speed: 'fast',
        address,
        amount,
        moreInfo: true,
      })
  
      const {
        feeRate,
        txSize,
      } = feeData
      const feeSatByte = new BigNumber(feeRate).dividedBy(BYTE_IN_KB).dp(0, BigNumber.ROUND_CEIL)
  
      if (!this.mounted) return
  
      this.setState({
        fetchFee: false,
        btcFeeRate: feeSatByte.toNumber(),
        txSize,
        coinFee: feeData.fee,
        fees: {
          miner: feeSatByte,
        }
      })
    } catch (error) {
      this.reportError(error)
    }
  }

  setEthFeeRate = async () => {
    this.setState({ fetchFee: true })

    try {
      const estimateFeeRate = await helpers.eth.estimateGasPrice({ speed: 'fast' })
      // returned gas * 1e9 - need to divide
      const gweiRate = new BigNumber(estimateFeeRate).dividedBy(1e9)

      this.setState({
        fetchFee: false,
        fees: {
          miner: gweiRate,
        },
      })
    } catch (error) {
      this.reportError(error)
    }
  }

  setFeeValues = async () => {
    const {
      data: { currency },
    } = this.props
    const {
      amount,
      isEthToken,
      maxFeeSize,
      selectedItem,
      currentDecimals,
    } = this.state

    const currentCurrencyKey = getCurrencyKey(currency, true).toLowerCase()
    let estimateFeeValue = 0

    if (isEthToken) {
      // if currentDecimals < 7 then minAmount = 0.0...1
      // else minAmount = 1e-<currentDecimals>
      minAmount[currentCurrencyKey] = 10 ** -currentDecimals

      try {
        minAmount.eth = await helpers.eth.estimateFeeValue({
          method: 'send',
          speed: 'fast',
        })
        estimateFeeValue = await helpers.ethToken.estimateFeeValue({
          method: 'send',
          speed: 'fast',
        })
      } catch (error) {
        this.reportError(error)
      }
      if (!this.mounted) return
    }

    if (constants.coinsWithDynamicFee.includes(currentCurrencyKey)) {
      let method = 'send'
      if (selectedItem.isUserProtected) method = 'send_multisig'
      if (selectedItem.isPinProtected) method = 'send_2fa'
      if (selectedItem.isSmsProtected) method = 'send_2fa'

      try {
        estimateFeeValue = await helpers[currentCurrencyKey].estimateFeeValue({
          method,
          speed: 'fast',
          address: selectedItem.address,
          amount,
        })
      } catch (error) {
        this.reportError(error)
      }

      minAmount[currentCurrencyKey] = estimateFeeValue

      if (!this.mounted) return
      this.setState({
        maxFeeSize: (amount) ? maxFeeSize : estimateFeeValue,
      })
    }

    if (!this.mounted) return
    this.setFeeRate()
  }

  setTotalFee = async () => {
    const {
      fees,
      amount,
      balance,
      usedAdminFee,
      exCurrencyRate,
      selectedItem: {
        currency
      },
    } = this.state

    let newServiceFee = usedAdminFee 
      ? new BigNumber(usedAdminFee.fee).dividedBy(100).multipliedBy(amount)
      : new BigNumber(0)

    newServiceFee = 
      +amount > 0 && newServiceFee.isGreaterThan(fees.service)
        ? newServiceFee
        : fees.service
  
    const newTotalFee = fees.miner.plus(newServiceFee)

    let allowedCurrencyBalance: BigNumber = usedAdminFee
      ? new BigNumber(balance).minus(fees.total).minus(adminFee.calc(currency, balance))
      : new BigNumber(balance).minus(fees.total)

    allowedCurrencyBalance = allowedCurrencyBalance.isGreaterThan(0) 
      ? allowedCurrencyBalance 
      : new BigNumber(0)

    let allowedFiatBalance: BigNumber = 
      allowedCurrencyBalance.multipliedBy(exCurrencyRate).dp(2, BigNumber.ROUND_FLOOR)

    this.setState({
      allowedCurrencyBalance,
      allowedFiatBalance,
      fees: {
        service: newServiceFee,
        total: newTotalFee,
      }
    })
  }

  setBalanceOnState = async () => {
    const {
      selectedItem: { currency, address },
      currentActiveAsset,
    } = this.state

    try {
      const wallet = actions.user.getWithdrawWallet(currency, address)
      const balance = await actions.core.fetchWalletBalance(wallet)
      const { unconfirmedBalance } = wallet
      wallet.balance = balance
      
      const finalBalance =
        unconfirmedBalance !== undefined && unconfirmedBalance < 0
          ? new BigNumber(balance).plus(unconfirmedBalance).toString()
          : balance
  
      const ethBalance =
        metamask.isEnabled() && metamask.isConnected()
          ? metamask.getBalance()
          : await actions.eth.getBalance()
  
      this.setState(() => ({
        balance: finalBalance,
        ethBalance,
        selectedItem: wallet,
        currentActiveAsset: {
          ...currentActiveAsset,
          ...wallet,
        },
      }))
    } catch (error) {
      this.reportError(error)
    }
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

    try {
      const exCurrencyRate = await actions.user.getExchangeRate(currency, activeFiat.toLowerCase())

      this.setState({
        exCurrencyRate,
        fiatAmount: (amount) ? new BigNumber(amount).multipliedBy(exCurrencyRate).toFixed(2) : fiatAmount,
      })
    } catch (error) {
      this.reportError(error)
    }
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
      devErrorMessage: false,
    }))

    this.setBalanceOnState()

    const sendOptions = {
      from: address,
      to,
      amount,
      speed: 'fast',
      name: isEthToken ? currency.toLowerCase() : '',
    }

    // Опрашиваем балансы отправителя и получателя на момент выполнения транзакции
    // Нужно для расчета final balance получателя и отправителя
    let beforeBalances = false
    try {
      // beforeBalances = await helpers.transactions.getTxBalances(currency, address, to)
    } catch (error) {
      this.reportError(error)
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

    if (selectedItem.isPinProtected || selectedItem.isSmsProtected || selectedItem.isUserProtected) {
      let nextStepModal = constants.modals.WithdrawBtcPin
      if (selectedItem.isSmsProtected) nextStepModal = constants.modals.WithdrawBtcSms
      if (selectedItem.isUserProtected) nextStepModal = constants.modals.WithdrawBtcMultisig

      actions.modals.close(name)
      actions.modals.open(nextStepModal, {
        selectedItem,
        invoice,
        sendOptions,
        beforeBalances,
        onReady,
        adminFee: +fees.service,
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
        const { tx: txId } = helpers.transactions.getInfo(currency.toLowerCase(), txRaw)

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
          adminFee: fees.service.toNumber(),
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
        const errorObj = {
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
          errorObj.message = {
            id: 'Withdraw232',
            defaultMessage: 'There is not enough confirmation of the last transaction. Try later.',
          }
        }

        this.reportError(error, `${selectedItem.fullName} - ${errorObj.name.defaultMessage}`)
        this.setState(() => ({
          errorObj,
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
      } else return true
    }

    if (isEthToken) {
      return typeforce.isCoinAddress.ETH(address)
    }

    return typeforce.isCoinAddress[getCurrencyKey(currency, false).toUpperCase()](address)
  }

  formOptionsIsCorrect = (): boolean => {
    const {
      ownTx,
      amount,
      isShipped,
      currentDecimals,
      allowedCurrencyBalance,
    } = this.state

    const result = 
      !ownTx &&
      !isShipped &&
      this.addressIsCorrect() &&
      new BigNumber(amount).isGreaterThan(0) &&
      new BigNumber(amount).dp() <= currentDecimals &&
      new BigNumber(amount).isLessThanOrEqualTo(allowedCurrencyBalance)

    return result
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

  handleDollarValue = (value) => {
    const {
      selectedItem: {
        isBTC,
      },
      currentDecimals,
      exCurrencyRate,
    } = this.state

    if (isBTC) {
      clearTimeout(this.btcFeeTimer)
      this.btcFeeTimer = setTimeout(() => {
        this.setBtcFeeRate()
      }, 2000)
    }

    this.setState({
      fiatAmount: value,
      amount: value ? (value / exCurrencyRate).toFixed(currentDecimals) : '',
    })

  }

  handleAmount = (value) => {
    const {
      exCurrencyRate,
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

    this.setState({
      fiatAmount: value ? (value * exCurrencyRate).toFixed(2) : '',
      amount: value,
    })
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

  setMaxBalance = async () => {
    const {
      balance,
      isEthToken,
      usedAdminFee,
      currentDecimals,
      exCurrencyRate,
      maxFeeSize,
    } = this.state

    const {
      data: { currency },
    } = this.props

    let minFee = new BigNumber(isEthToken ? 0 : maxFeeSize)

    minFee = usedAdminFee ? new BigNumber(minFee).plus(adminFee.calc(currency, balance)) : minFee

    if (minFee.isGreaterThan(balance)) {
      this.setState({
        amount: 0,
        fiatAmount: 0,
      })
    } else {
      const balanceMiner = balance
        ? balance !== 0
          ? new BigNumber(balance).minus(minFee)
          : new BigNumber(balance)
        : new BigNumber(0)

      this.setState({
        amount: new BigNumber(balanceMiner.dp(currentDecimals, BigNumber.ROUND_FLOOR)),
        fiatAmount: balanceMiner.isGreaterThan(0) ? (balanceMiner.multipliedBy(exCurrencyRate)).toFixed(2) : '',
      })
    }
  }

  render() {
    const {
      error,
      ownTx,
      amount,
      address,
      isShipped,
      fiatAmount,
      isEthToken,
      openScanCam,
      exCurrencyRate,
      currentDecimals,
      hiddenCoinsList,
      currentActiveAsset,
      selectedValue,
      devErrorMessage,
      usedAdminFee,
      fees,
      fetchFee,
      txSize,
      btcFeeRate,
      selectedItem,
      allowedCurrencyBalance,
      allowedFiatBalance,
    } = this.state

    const { name, intl, portalUI, activeFiat, dashboardView } = this.props

    const linked = Link.all(this, 'address', 'amount', 'ownTx', 'fiatAmount', 'amountRUB', 'amount', 'comment')

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
    const currentCurrencyHaveInfoPrice = selectedItem.infoAboutCurrency && selectedItem.infoAboutCurrency.price_fiat
    const sendBtnisDisabled = this.formOptionsIsCorrect()

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

    const amountInputKeyDownCallback = (event) => {
      const BACKSPACE_CODE = 8
      const LEFT_ARROW = 37
      const RIGHT_ARROW = 39
      const DELETE_CODE = 46
      const isNumber = +event.key >= 0 && +event.key <= 9

      if (event.key === ',') {
        inputReplaceCommaWithDot(event)
      } else {
        /*
        * block number input if quantity decimal places
        * more than allowed (crypto: currentDecimals | usd: 2)
        */
        if (event.target.value.includes('.')) {
          const maxQuantityDecimals = selectedValue === currentActiveAsset.currency
            ? event.target.value.split('.')[1].length === currentDecimals
            : event.target.value.split('.')[1].length === 2

          maxQuantityDecimals && isNumber && event.preventDefault()
        } else if (
          !(
            isNumber ||
            event.keyCode === BACKSPACE_CODE ||
            event.keyCode === LEFT_ARROW ||
            event.keyCode === RIGHT_ARROW ||
            event.keyCode === DELETE_CODE ||
            event.key === '.'
          )
        ) {
          event.preventDefault()
        }
      }
    }

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
                minAmount: <span>{fees.total}</span>,
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
            {currentCurrencyHaveInfoPrice
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
            {amount > 0 && currentCurrencyHaveInfoPrice && (
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
            {selectedValue === currentActiveAsset.currency ? (
              <Input
                type="number"
                valueLink={linked.amount.pipe(this.handleAmount)}
                onKeyDown={amountInputKeyDownCallback}
                pattern="0-9\.:"
              />
            ) : (
              <Input
                type="number"
                valueLink={linked.fiatAmount.pipe(this.handleDollarValue)}
                onKeyDown={amountInputKeyDownCallback}
                pattern="0-9\.:"
              />
            )}
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
              {selectedValue === currentActiveAsset.currency ? (
                <FormattedMessage
                  id="Withdrow170"
                  defaultMessage="Maximum amount you can send is {allowedCriptoBalance} {currency}"
                  values={{
                    allowedCriptoBalance: `${allowedCurrencyBalance.dp(currentDecimals)}`,
                    currency: activeCriptoCurrency,
                  }}
                />
              ) : (
                <FormattedMessage
                  id="Withdrow171"
                  defaultMessage="Maximum amount you can send is {allowedUsdBalance} USD"
                  values={{
                    allowedUsdBalance: `${allowedFiatBalance.dp(2)}`,
                  }}
                />
              )}{' '}
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
            <Button blue big fill disabled={sendBtnisDisabled} onClick={this.handleSubmit}>
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
                hasTxSize={selectedItem.isBTC}
                txSize={txSize}
                usedAdminFee={usedAdminFee}
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
