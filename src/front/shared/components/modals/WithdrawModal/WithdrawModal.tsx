import React from 'react'
import cx from 'classnames'
import cssModules from 'react-css-modules'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'
import typeforce from 'swap.app/util/typeforce'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import { isMobile } from 'react-device-detect'

import MIN_AMOUNT from 'common/helpers/constants/MIN_AMOUNT'
import COINS_WITH_DYNAMIC_FEE from 'common/helpers/constants/COINS_WITH_DYNAMIC_FEE'

import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import { localisedUrl } from 'helpers/locale'
import getCurrencyKey from 'helpers/getCurrencyKey'
import lsDataCache from 'helpers/lsDataCache'
import helpers, {
  user,
  constants,
  links,
  adminFee,
  feedback,
  routing,
} from 'helpers'
import btcUtils from 'common/utils/coin/btc'
import erc20Like from 'common/erc20Like'
import ethLikeHelper from 'common/helpers/ethLikeHelper'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import QrReader from 'components/QrReader'
import InvoiceInfoBlock from 'components/InvoiceInfoBlock/InvoiceInfoBlock'
import AdminFeeInfoBlock from 'components/AdminFeeInfoBlock/AdminFeeInfoBlock'

import styles from './WithdrawModal.scss'
import CurrencyList from './components/CurrencyList'
import FeeInfoBlock from './components/FeeInfoBlock'

const NETWORK = process.env.MAINNET
  ? 'MAINNET'
  : 'TESTNET'

type WithdrawModalProps = {
  name: 'WithdrawModal'
  activeFiat: string
  dashboardView: boolean

  intl: IUniversalObj
  history: IUniversalObj
  data: IUniversalObj
  coinsData: IUniversalObj[]
}

type WithdrawModalState = {
  isShipped: boolean
  fetchFee: boolean
  isInvoicePay?: boolean
  openScanCam: boolean

  reduxActionName: string
  commissionCurrency: string
  address: string
  comment?: string
  ownTx: string
  selectedValue: string
  fiatAmount: string
  amount: string

  currentDecimals: number
  btcFeeRate: number | any
  txSize: undefined | number
  bitcoinFeeSpeedType: string
  bitcoinFees: {
    slow: number
    normal: number
    fast: number
    custom: number
  }

  walletForTokenFee: IUniversalObj
  exCurrencyRate: BigNumber
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
  selectedCurrency: IUniversalObj
  selectedItem: IUniversalObj
}

@connect(
  ({
    user: {
      ethData,
      bnbData,
      maticData,
      arbethData,
      aurethData,
      xdaiData,
      ftmData,
      avaxData,
      movrData,
      oneData,
      phi_v1Data,
      phiData,
      fkwData,
      phpxData,
      ameData,
      btcData,
      ghostData,
      nextData,
      activeFiat,
      metamaskData,
    },
    ui: { dashboardModalsAllowed },
  }) => ({
    activeFiat,
    coinsData: [
      ethData,
      bnbData,
      maticData,
      arbethData,
      aurethData,
      xdaiData,
      ftmData,
      avaxData,
      movrData,
      oneData,
      phi_v1Data,
      phiData,
      fkwData,
      phpxData,
      ameData,
      btcData,
      ghostData,
      nextData,
      metamaskData,
    ],
    dashboardView: dashboardModalsAllowed,
  }),
)
@cssModules(styles, { allowMultiple: true })
class WithdrawModal extends React.Component<WithdrawModalProps, WithdrawModalState> {
  mounted = true

  btcFeeTimer: ReturnType<typeof setTimeout> | null = null

  constructor(props) {
    super(props)

    const {
      coinsData,
      data: selectedCurrency,
    } = props

    const {
      toAddress,
      currency,
      address: walletAddressOwner,
      itemCurrency,
    } = selectedCurrency

    const currentDecimals = constants.tokenDecimals[getCurrencyKey(currency, true).toLowerCase()]
    const selectedItem = actions.user.getWithdrawWallet(
      itemCurrency?.tokenKey || currency,
      walletAddressOwner,
    )

    const usedAdminFee = adminFee.isEnabled(itemCurrency?.tokenKey || currency)

    const reduxActionName = selectedItem.standard || currency.toLowerCase()
    let commissionCurrency = currency.toUpperCase()

    // save wallet for token exchange's rate
    const walletForTokenFee = coinsData.find((wallet) => {
      if (TOKEN_STANDARDS[selectedItem.standard]) {
        const tokenCurrency =  TOKEN_STANDARDS[selectedItem.standard].currency.toUpperCase()
        commissionCurrency = tokenCurrency

        return wallet.currency.toUpperCase() === tokenCurrency
      }
    })

    const exCurrencyRate = selectedCurrency.infoAboutCurrency?.price_fiat
      ? new BigNumber(selectedCurrency.infoAboutCurrency.price_fiat)
      : new BigNumber(0)

    this.state = {
      isShipped: false,
      usedAdminFee,
      openScanCam: false,
      address: toAddress || '',
      fiatAmount: '',
      amount: '',
      selectedItem,
      reduxActionName,
      commissionCurrency,
      currentDecimals,
      selectedValue: currency,
      ownTx: '',
      hiddenCoinsList: actions.core.getHiddenCoins(),
      selectedCurrency,
      walletForTokenFee: walletForTokenFee || {},
      exCurrencyRate,
      bitcoinFees: {
        slow: 5 * 1024,
        normal: 15 * 1024,
        fast: 30 * 1024,
        custom: 50 * 1024,
      },
      bitcoinFeeSpeedType: '',
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
      btcFeeRate: null,
      fetchFee: true,
      txSize: undefined,
      isInvoicePay: !!(selectedCurrency.invoice),
    }
  }

  componentWillUnmount() {
    this.mounted = false

    if (this.btcFeeTimer) {
      clearTimeout(this.btcFeeTimer)
    }
  }

  componentDidMount() {
    this.setCommissions()
    feedback.withdraw.entered()
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      data: prevData,
    } = prevProps

    const {
      amount: prevAmount,
      fiatAmount: prevFiatAmount,
    } = prevState

    const {
      amount,
      fiatAmount,
      selectedCurrency,
    } = this.state

    const {
      coinsData,
      data,
    } = this.props

    const availableWallets = user.filterUserCurrencyData(actions.core.getWallets())
    const walletIndex = availableWallets.findIndex(wallet => wallet.currency === selectedCurrency.currency && wallet.address === selectedCurrency.address)
    if (walletIndex === -1) {
      this.handleHaveNotAvailableWallet(availableWallets)
    }

    const selectedCurrencyInProps = coinsData.find(coinData => coinData.currency === selectedCurrency.currency && coinData.address === selectedCurrency.address)
    if (selectedCurrencyInProps && selectedCurrencyInProps.balance !== selectedCurrency.balance) {
      this.setState(() => ({
        selectedCurrency: { ...selectedCurrency, balance: selectedCurrencyInProps.balance },
      }))
    }

    if (prevData !== data) {
      this.updateCurrencyData()
    }

    if (prevAmount !== amount || prevFiatAmount !== fiatAmount) {
      this.updateServiceAndTotalFee()
    }
  }

  reportError = (error: IError, details = '-') => {
    console.error(error)
    feedback.withdraw.failed(`details(${details}) : error message(${error.message})`)

    console.group('%c Withdraw', 'color: red;')
    console.error(`Withdraw. details(${details}) : error(${JSON.stringify(error)})`)
    console.groupEnd()

    actions.notifications.show(
      constants.notifications.ErrorNotification,
      { error: `name (${error.name}); message(${error.message}); details(${details})` },
    )
  }

  handleHaveNotAvailableWallet = (availableWallets) => {
    const {
      history,
      intl: { locale },
    } = this.props

    if (
      !Object.keys(availableWallets).length
      || (Object.keys(availableWallets).length === 1 && !user.isCorrectWalletToShow(availableWallets[0]))
    ) {
      actions.notifications.show(
        constants.notifications.Message,
        {
          message: (
            <FormattedMessage
              id="WalletEmptyBalance"
              defaultMessage="No wallets available"
            />
          ),
        },
      )

      return
    }

    const firstWallet = user.isCorrectWalletToShow(availableWallets[0]) ? availableWallets[0] : availableWallets[1]

    const { currency, address, tokenKey } = firstWallet
    let targetCurrency = currency

    switch (currency.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (pin-protected)':
        targetCurrency = 'btc'
    }

    const firstUrlPart = tokenKey ? `/token/${tokenKey}` : `/${targetCurrency}`

    history.push(
      localisedUrl(locale, `${firstUrlPart}/${address}/send`),
    )
  }

  updateCurrencyData = () => {
    const { data } = this.props

    this.setState(() => ({
      selectedCurrency: data,
    }))
  }

  fetchBtcFee = async () => {
    const {
      address: toAddress,
      selectedItem: {
        address,
        isUserProtected,
        isPinProtected,
      },
      currentDecimals,
      amount,
    } = this.state

    let method = `send`
    if (isUserProtected) method = `send_multisig`
    if (isPinProtected) method = `send_2fa`

    const numAmount = Number(amount) || 0

    try {
      const { txSize } = await helpers.btc.estimateFeeValue({
        method,
        speed: 'fast',
        address,
        toAddress,
        amount: numAmount,
        moreInfo: true,
      })

      const bitcoinFeesRate = await btcUtils.getFeesRateBlockcypher({ NETWORK })
      const feeInByte = new BigNumber(bitcoinFeesRate.fast).div(1024).dp(0, BigNumber.ROUND_HALF_EVEN)
      const fee = feeInByte.multipliedBy(txSize).multipliedBy(1e-8)
      if (!this.mounted) return
      this.setState((state) => ({
        bitcoinFeeSpeedType: 'fast',
        bitcoinFees: bitcoinFeesRate,
        btcFeeRate: feeInByte.toNumber(),
        txSize,
        fees: {
          ...state.fees,
          miner: fee,
          total: state.fees.service.plus(fee).dp(currentDecimals, BigNumber.ROUND_CEIL),
        },
      }))
    } catch (error) {
      this.reportError(error)
    }
  }

  setBtcUserFee = (speedType: string, customValue: number) => {
    const { bitcoinFees, txSize, currentDecimals } = this.state
    const feeInByte = speedType === 'custom'
      ? new BigNumber(customValue)
      : new BigNumber(bitcoinFees[speedType]).div(1024).dp(0, BigNumber.ROUND_HALF_EVEN)

    // @ts-ignore: strictNullChecks
    const fee = feeInByte.multipliedBy(txSize).multipliedBy(1e-8)

    if (this.mounted) {
      this.setState((state) => ({
        bitcoinFeeSpeedType: speedType,
        btcFeeRate: feeInByte.toNumber(),
        fees: {
          ...state.fees,
          miner: fee,
          total: state.fees.service.plus(fee).dp(currentDecimals, BigNumber.ROUND_CEIL),
        },
      }))
      this.setAllowedBalances()
    }
  }

  setCommissions = async () => {
    const {
      data: { currency },
    } = this.props
    const {
      selectedItem,
      usedAdminFee,
      amount,
      currentDecimals,
    } = this.state

    const currentCoin = getCurrencyKey(currency, true).toLowerCase()
    const adminFeeSize = usedAdminFee ? adminFee.calc(selectedItem.tokenKey || currency, amount) : 0
    let newMinerFee = new BigNumber(0)

    this.setState({ fetchFee: true })

    try {
      if (selectedItem.isToken) {
        const tokenBaseCurrency = selectedItem.baseCurrency
        const tokenStandard = selectedItem.standard
        // if decimals < 7 then equal 0.0...1
        // if decimals >= 7 then equal 1e-<decimals>
        MIN_AMOUNT[tokenBaseCurrency] = 10 ** -currentDecimals
        MIN_AMOUNT.eth = await ethLikeHelper[tokenBaseCurrency].estimateFeeValue({
          method: 'send',
        })

        newMinerFee = new BigNumber(await erc20Like[tokenStandard].estimateFeeValue({
          method: 'send',
        }))
      }

      else if (COINS_WITH_DYNAMIC_FEE.includes(currentCoin)) {
        let method = 'send'
        if (selectedItem.isUserProtected) method = 'send_multisig'
        if (selectedItem.isPinProtected) method = 'send_2fa'

        newMinerFee = new BigNumber(await helpers[currentCoin].estimateFeeValue({
          method,
          speed: 'fast',
          address: selectedItem.address,
          amount,
        }))

        MIN_AMOUNT[currentCoin] = newMinerFee.toNumber()

        if (selectedItem.isBTC) {
          this.fetchBtcFee()
        }
      }

      if (this.mounted) {
        this.setState((state) => ({
          fees: {
            ...state.fees,
            miner: newMinerFee,
            service: new BigNumber(adminFeeSize).dp(currentDecimals, BigNumber.ROUND_CEIL),
            total: newMinerFee.plus(adminFeeSize).dp(currentDecimals, BigNumber.ROUND_CEIL),
            adminFeeSize: new BigNumber(adminFeeSize),
          },
        }))
        this.setAllowedBalances()
      }
    } catch (error) {
      this.reportError(error)
    } finally {
      this.setState({ fetchFee: false })
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
      reduxActionName,
      comment = '',
    } = this.state

    const {
      data: { currency, address, invoice, onReady },
      name,
    } = this.props

    this.setState(() => ({
      isShipped: true,
    }))

    const sendOptions = {
      from: address,
      to,
      amount,
      speed: 'fast',
      name: selectedItem.isToken ? currency.toLowerCase() : '',
      feeValue: selectedItem.isBTC && fees.miner,
    }

    if (invoice && ownTx) {
      await actions.invoices.markInvoice(invoice.id, 'ready', ownTx, address)

      actions.notifications.show(constants.notifications.SuccessWithdraw, {
        amount,
        currency,
        address: to,
      })
      this.setState(() => ({ isShipped: false }))
      actions.modals.close(name)
      if (onReady instanceof Function) {
        onReady()
      }
      return
    }

    if (selectedItem.isPinProtected || selectedItem.isUserProtected) {
      let nextStepModal = constants.modals.WithdrawBtcPin

      if (selectedItem.isUserProtected) nextStepModal = constants.modals.WithdrawBtcMultisig

      actions.modals.close(name)

      actions.modals.open(nextStepModal, {
        wallet: selectedItem,
        invoice,
        sendOptions,
        onReady,
        adminFee: fees.adminFeeSize,
      })
      return
    }

    await actions[reduxActionName]
      .send(sendOptions)
      .then(async (txRaw) => {
        actions[reduxActionName].getBalance(currency)

        if (invoice) {
          await actions.invoices.markInvoice(invoice.id, 'ready', txRaw, address)
        }

        if (this.mounted) {
          this.setState(() => ({
            isShipped: false,
          }))
        }

        if (onReady instanceof Function) {
          onReady()
        }

        // Redirect to tx
        const txInfo = helpers.transactions.getInfo(
          (selectedItem.tokenKey)
            ? selectedItem.tokenKey
            : selectedItem.currency,
          txRaw,
        )
        const { tx: txId } = txInfo

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
            comment,
          })
        }

        const { tokenKey, currency: selectedCurrency } = selectedItem
        const txInfoUrl = helpers.transactions.getTxRouter(tokenKey || selectedCurrency, txId)

        routing.redirectTo(txInfoUrl)
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

        this.reportError(error, `selected item: ${selectedItem.fullName} | custom message: ${customError.message.defaultMessage}`)

        if (this.mounted) {
          this.setState(() => ({
            isShipped: false,
          }))
        }
      })
  }

  addressIsCorrect() {
    const {
      data: { currency },
    } = this.props
    const { address, selectedItem } = this.state

    if (!address) return false

    if (getCurrencyKey(currency, false).toLowerCase() === `btc`) {
      if (!typeforce.isCoinAddress.BTC(address)) {
        return actions.btc.addressIsCorrect(address)
      }
      return true
    }

    if (selectedItem.isToken) {
      const baseCurrency = selectedItem.baseCurrency.toUpperCase()
      return typeforce.isCoinAddress[baseCurrency](address)
    }

    const currencyKey = getCurrencyKey(currency, true).toUpperCase()

    return typeforce.isCoinAddress[currencyKey](address)
  }

  openScan = () => {
    this.setState((state) => ({
      openScanCam: !state.openScanCam,
    }))
  }

  handleScan = (data) => {
    if (data) {
      const address = (data.indexOf(':') !== -1) ? data.split(':')[1].split('?')[0] : data
      const amount = (data.indexOf('=') !== -1) ? data.split('=')[1] : false

      this.setState(() => ({ address }))
      if (amount !== false) this.setState(() => ({ amount }))
      this.openScan()
    }
  }

  handleAmount = (value): any => {
    const {
      selectedCurrency,
      currentDecimals,
      exCurrencyRate,
      selectedValue,
      selectedItem: {
        isBTC,
      },
    } = this.state

    if (isBTC) {
      if (this.btcFeeTimer) {
        clearTimeout(this.btcFeeTimer)
      }

      this.btcFeeTimer = setTimeout(() => {
        this.fetchBtcFee()
      }, 2000)
    }

    const hasExCurrencyRate = exCurrencyRate.isGreaterThan(0)

    if (selectedValue === selectedCurrency.currency) {
      this.setState({
        fiatAmount: value && hasExCurrencyRate
          ? exCurrencyRate.times(value).dp(2, BigNumber.ROUND_CEIL).toString()
          : '',
        amount: value,
      })
    } else {
      this.setState({
        fiatAmount: value,
        amount: value && hasExCurrencyRate
          ? new BigNumber(value).div(exCurrencyRate).dp(currentDecimals).toString()
          : '',
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

  setAllowedBalances = () => {
    const {
      selectedItem,
      usedAdminFee,
      currentDecimals,
      exCurrencyRate,
      balances,
      fees,
    } = this.state

    const ONE_HUNDRED_PERCENT = 100
    const minerFee = selectedItem.isToken ? new BigNumber(0) : fees.miner
    const maxService = usedAdminFee
      ? new BigNumber(usedAdminFee.fee).dividedBy(ONE_HUNDRED_PERCENT).multipliedBy(balances.balance)
      : new BigNumber(0)
    const maxAmount = new BigNumber(balances.balance.minus(minerFee).minus(maxService).dp(currentDecimals, BigNumber.ROUND_CEIL))
    const maxFiatAmount = maxAmount.multipliedBy(exCurrencyRate).dp(2, BigNumber.ROUND_CEIL)

    if (maxAmount.isGreaterThan(balances.balance) || maxAmount.isLessThanOrEqualTo(0)) {
      this.setState((state) => ({
        balances: {
          ...state.balances,
          allowedCurrency: new BigNumber(0),
          allowedFiat: new BigNumber(0),
        },
      }))
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

    this.setState({
      amount: balances.allowedCurrency.toString(),
      fiatAmount: balances.allowedFiat.toString(),
    })
  }

  updateServiceAndTotalFee = () => {
    const { usedAdminFee, amount, fees, currentDecimals } = this.state
    const ONE_HUNDRED_PERCENT = 100

    let newServiceFeeSize = usedAdminFee
      ? new BigNumber(usedAdminFee.fee).dividedBy(ONE_HUNDRED_PERCENT).multipliedBy(amount)
      : new BigNumber(0)

    newServiceFeeSize = new BigNumber(amount).isGreaterThan(0)
      && newServiceFeeSize.isGreaterThan(fees.adminFeeSize)
      ? newServiceFeeSize
      : fees.adminFeeSize

    this.setState((state) => ({
      fees: {
        ...state.fees,
        service: newServiceFeeSize.dp(currentDecimals, BigNumber.ROUND_CEIL),
        total: fees.miner.plus(newServiceFeeSize).dp(currentDecimals, BigNumber.ROUND_CEIL),
      },
    }))
  }

  returnHaveInfoPrice = (params) => {
    const { selectedCurrency } = this.state
    const { arrOfCurrencies } = params
    const activeCryptoCurrency = getCurrencyKey(selectedCurrency.currency, true).toUpperCase()
    let result = true

    arrOfCurrencies.forEach(item => {
      if (item.currency === activeCryptoCurrency) {
        result = item.infoAboutCurrency && item.infoAboutCurrency.price_fiat
      }
    })

    return result
  }

  render() {
    const {
      ownTx,
      amount,
      address,
      balances,
      walletForTokenFee,
      isShipped,
      fiatAmount,
      commissionCurrency,
      openScanCam,
      exCurrencyRate,
      currentDecimals,
      selectedCurrency,
      selectedValue,
      usedAdminFee,
      fees,
      fetchFee,
      txSize,
      bitcoinFeeSpeedType,
      bitcoinFees,
      btcFeeRate,
      selectedItem,
      selectedItem: {
        isBTC: isBTCWallet,
      },
    } = this.state

    const { name, intl, activeFiat, dashboardView } = this.props
    const linked = Link.all(this, 'address', 'amount', 'ownTx', 'fiatAmount', 'comment')

    const {
      currency,
      address: currentAddress,
      balance: currentBalance,
      invoice,
    } = selectedCurrency

    const tableRows = user.filterUserCurrencyData(actions.core.getWallets())
    const activeCryptoCurrency = getCurrencyKey(selectedCurrency.currency, true).toUpperCase()
    const selectedValueView = getCurrencyKey(selectedValue, true).toUpperCase()
    const cryptoCurrencyHaveInfoPrice = this.returnHaveInfoPrice({
      arrOfCurrencies: tableRows,
    })
    const notEnoughForTokenMinerFee = new BigNumber(walletForTokenFee?.balance).isLessThan(fees.miner)
    const exchangeRateForTokens = new BigNumber(walletForTokenFee?.infoAboutCurrency?.price_fiat || 0)

    const notEnoughForPayment = selectedItem.isToken
      ? new BigNumber(amount).isGreaterThan(balances.balance)
      : new BigNumber(amount).plus(fees.total).isGreaterThan(balances.balance)

    const isDisabled = (
      !+amount
      || isShipped
      || !!ownTx
      || !this.addressIsCorrect()
      || selectedItem.isToken && notEnoughForTokenMinerFee
      || notEnoughForPayment
      // Почему-то сломалось тут. надо проверить настройки ts
      // @ts-ignore
      || new BigNumber(amount).dp() > currentDecimals
    )

    const labels = defineMessages({
      withdrawModal: {
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
        defaultMessage: '{amount} {currency} will be send',
      },
      ownTxPlaceholder: {
        id: 'withdrawOwnTxPlaceholder',
        defaultMessage: 'If paid from another source',
      },
    })

    const balanceLabelProp = (
      selectedValue !== activeFiat
        ? isMobile
          ? `balanceFiatMobile`
          : `balanceFiatDesktop`
        : isMobile
          ? `balanceMobile`
          : `balanceDesktop`
    )

    const balanceLabel = labels[balanceLabelProp]

    const formRender = (
      <>
        {openScanCam && (
          <QrReader
            openScan={this.openScan}
            handleError={this.reportError}
            handleScan={this.handleScan}
          />
        )}
        {invoice && <InvoiceInfoBlock invoiceData={invoice} />}
        {!dashboardView && (
          <p styleName={selectedItem.isToken ? 'rednotes' : 'notice'}>
            <FormattedMessage
              id="Withdrow213"
              defaultMessage="Please note: Fee is {minAmount} {data}.{br}Your balance must exceed this sum to perform transaction"
              values={{
                minAmount: <span>{selectedItem.isToken ? MIN_AMOUNT.eth : fees.total.toNumber()}</span>,
                br: <br />,
                data: `${commissionCurrency}`,
              }}
            />
          </p>
        )}

        <div style={{ marginBottom: '40px' }}>
          <div styleName="customSelectContainer">
            <FieldLabel>
              <FormattedMessage id="Withdrow559" defaultMessage="Send from wallet " />
            </FieldLabel>
            <CurrencyList
              {...this.props}
              selectedCurrency={selectedCurrency}
              currentBalance={currentBalance}
              currency={currency}
              activeFiat={activeFiat}
              tableRows={tableRows}
              currentAddress={currentAddress}
            />
          </div>
        </div>
        <div styleName="highLevel">
          <FieldLabel>
            <FormattedMessage id="Withdrow1194" defaultMessage="Address " />
            {' '}
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
            id="toAddressInput"
            valueLink={linked.address}
            focusOnInit
            pattern="0-9a-zA-Z:"
            placeholder={`Enter ${currency.toUpperCase()} address to transfer`}
            qr={isMobile}
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
        <div styleName="lowLevel" style={{ marginBottom: '30px' }}>
          {/* why style ? see tip for max button */}
          <div style={usedAdminFee ? { right: '20px' } : undefined} styleName="additionalСurrencies">
            {cryptoCurrencyHaveInfoPrice && (
              <>
                <span
                  styleName={cx('additionalСurrenciesItem', {
                    additionalСurrenciesItemActive: selectedValue.toUpperCase() === activeFiat,
                  })}
                  onClick={() => this.handleBuyCurrencySelect(activeFiat)}
                >
                  {activeFiat}
                </span>
                <span styleName="delimiter" />
              </>
            )}
            <span
              styleName={cx('additionalСurrenciesItem', {
                additionalСurrenciesItemActive:
                  selectedValueView === activeCryptoCurrency,
              })}
              onClick={() => this.handleBuyCurrencySelect(selectedCurrency.currency)}
            >
              {activeCryptoCurrency}
            </span>
          </div>
          {/* why style ? see tip for max button */}
          <p style={usedAdminFee ? { right: '10px' } : undefined} styleName="balance">
            {new BigNumber(amount).isGreaterThan(0) && cryptoCurrencyHaveInfoPrice && (
              intl.formatMessage({
                id: balanceLabel.id,
                defaultMessage: balanceLabel.defaultMessage,
              }, {
                amount: selectedValue !== activeFiat
                  ? new BigNumber(fiatAmount).dp(2, BigNumber.ROUND_CEIL).toNumber()
                  : new BigNumber(amount).dp(6, BigNumber.ROUND_CEIL).toNumber(),
                currency: selectedValue !== activeFiat ? activeFiat : activeCryptoCurrency.toUpperCase(),
              })
            )}
          </p>

          <FieldLabel>
            <FormattedMessage id="orders102" defaultMessage="Amount" />
          </FieldLabel>
          <div styleName="group">
            <Input
              id="amountInput"
              pattern="0-9\."
              onKeyDown={inputReplaceCommaWithDot}
              valueLink={selectedValue === selectedCurrency.currency
                ? linked.amount.pipe(this.handleAmount)
                : linked.fiatAmount.pipe(this.handleAmount)}
            />
            {/*
            with service commission we can't send all balance (there is a remainder)
            so we disable this button
            */}
            {!usedAdminFee
              && (
                <>
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
                </>
              )}
          </div>
          {/* hint for amount value */}
          {dashboardView && (
            <div styleName={`prompt ${fetchFee ? 'hide' : ''}`}>
              {selectedItem.isToken && notEnoughForTokenMinerFee
                ? (
                  <FormattedMessage
                    id="WithdrowTokenCurrencyBalance"
                    defaultMessage="Not enough {tokenCurrency} balance for miner fee"
                    values={{
                      tokenCurrency: walletForTokenFee?.currency,
                    }}
                  />
                )
                : balances.allowedCurrency.isEqualTo(0)
                  ? (
                    <FormattedMessage
                      id="WithdrowBalanceNotEnoughtPrompt"
                      defaultMessage="Not enough balance to send"
                    />
                  ) : (
                    <FormattedMessage
                      id="Withdrow170"
                      defaultMessage="Maximum amount you can send is {allowedBalance} {currency}"
                      values={{
                        allowedBalance: selectedValue === selectedCurrency.currency
                          ? balances.allowedCurrency.toNumber()
                          : balances.allowedFiat.toNumber(),
                        currency: selectedValue === selectedCurrency.currency
                          ? activeCryptoCurrency
                          : activeFiat,
                      }}
                    />
                  )}
              {' '}
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
        <div styleName="commentFormWrapper">
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
            <Button big fill brand onClick={this.handleClose}>
              <FormattedMessage id="WithdrawModalCancelBtn" defaultMessage="Cancel" />
            </Button>
          </div>
          <div styleName="actionBtn">
            <Button
              id="sendButton"
              brand
              big
              fill
              pending={isShipped}
              disabled={isDisabled}
              onClick={this.handleSubmit}
            >
              <>
                <FormattedMessage id="withdrowTitle271" defaultMessage="Send" />
                {' '}
                {`${currency.toUpperCase()}`}
              </>
            </Button>
          </div>
        </div>
        {usedAdminFee && selectedItem.isToken && (
          <AdminFeeInfoBlock {...usedAdminFee} currency={currency} />
        )}
        {invoice && (
          <>
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
                <FormattedMessage id="WithdrawModal11212" defaultMessage="Processing..." />
              ) : (
                <FormattedMessage
                  id="WithdrawModalInvoiceSaveTx"
                  defaultMessage="Отметить как оплаченный"
                />
              )}
            </Button>
          </>
        )}
        {dashboardView && (
          <div style={{ paddingTop: '2em' }}>
            <FeeInfoBlock
              selectedItem={selectedItem}
              currency={currency}
              activeFiat={activeFiat}
              dataCurrency={commissionCurrency}
              exchangeRateForTokens={exchangeRateForTokens}
              exCurrencyRate={exCurrencyRate}
              feeCurrentCurrency={btcFeeRate}
              isLoading={fetchFee}
              usedAdminFee={usedAdminFee}
              hasTxSize={isBTCWallet}
              txSize={txSize}
              bitcoinFees={bitcoinFees}
              bitcoinFeeSpeedType={bitcoinFeeSpeedType}
              setBitcoinFee={this.setBtcUserFee}
              minerFee={fees.miner}
              serviceFee={fees.service}
            />
          </div>
        )}
      </>
    )

    return (
      <Modal
        name={name}
        onClose={this.handleClose}
        title={`${intl.formatMessage(labels.withdrawModal)}${' '}${currency.toUpperCase()}`}
      >
        {formRender}
      </Modal>
    )
  }
}

export default injectIntl(WithdrawModal)
