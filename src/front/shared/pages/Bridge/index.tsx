import { PureComponent } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { COIN_TYPE, COIN_MODEL, COIN_DATA } from 'swap.app/constants/COINS'
import { Token } from 'common/types'
import { feedback, apiLooper, externalConfig, constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { ComponentState } from './types'
import Button from 'components/controls/Button/Button'
import ExchangeForm from './ExchangeForm'
import AdvancedOptions from './AdvancedOptions'

class Bridge extends PureComponent<unknown, ComponentState> {
  constructor(props) {
    super(props)

    const { currencies, activeFiat } = props

    const spendedCurrency = currencies[0]
    const receivedCurrency = currencies[1]

    const fromWallet = actions.core.getWallet({
      currency: spendedCurrency.value,
    })
    const toWallet = actions.core.getWallet({
      currency: receivedCurrency.value,
    })

    this.state = {
      error: null,
      isPending: false,
      externalExchangeReference: null,
      fiat: window.DEFAULT_FIAT || activeFiat,
      fiatAmount: 0,
      currencies,
      spendedCurrency: spendedCurrency,
      spendedAmount: '',
      fromWallet: fromWallet || {},
      receivedCurrency: receivedCurrency,
      receivedAmount: 0,
      toWallet: toWallet || {},
      slippage: 1,
      slippageMaxRange: 50,
      chainId: 1,
      isAdvancedMode: false,
      advancedOptions: {},
      swapData: undefined,
    }
  }

  componentDidMount() {
    this.updateChainId()
  }

  updateChainId = () => {
    const { spendedCurrency } = this.state

    this.setState(() => ({
      chainId: externalConfig.evmNetworks[spendedCurrency.blockchain].networkVersion,
    }))
  }

  serviceIsAvailable = async (chaindId) => {
    try {
      const res: any = await apiLooper.get('oneinch', `/${chaindId}/healthcheck`)

      return res?.status === 'OK'
    } catch (error) {
      this.reportError(error)

      return false
    }
  }

  reportError = (error) => {
    this.setState(() => ({
      error,
    }))
    actions.notifications.show(constants.notifications.ErrorNotification, {
      error: error.message,
    })

    // * feedback...
  }

  getSwapData = async () => {
    const { chainId, slippage, spendedAmount, fromWallet, toWallet } = this.state

    const serviceIsOk = await this.serviceIsAvailable(chainId)

    if (!serviceIsOk) {
      actions.notifications.show(constants.notifications.Message, {
        message: (
          <FormattedMessage
            id="serviceIsNotAvailable"
            defaultMessage="Service is not available. Try to different chain"
          />
        ),
      })

      return
    }

    const fromAddress = fromWallet.isToken
      ? fromWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    const toAddress = toWallet.isToken
      ? toWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

    const spendedWeiAmount = new BigNumber(spendedAmount).times(10).pow(18).toString()

    const request = ''.concat(
      `/${chainId}/swap?`,
      `fromTokenAddress=${fromAddress}&`,
      `toTokenAddress=0xb9638272ad6998708de56bbc0a290a1de534a578&`,
      `amount=${spendedWeiAmount}&`,
      `fromAddress=${fromWallet.address}&`,
      `slippage=${slippage}`
    )

    try {
      // TODO: understand what's wrong with - await apiLooper.post('oneinchExchange', request)
      const swapData = await fetch('https://api.1inch.exchange/v3.0' + request).then((res) =>
        res.json()
      )

      console.log('%c swapData', 'color: brown; font-size: 20px')
      console.log(swapData)

      this.setState(() => ({
        swapData,
      }))
    } catch (error) {
      this.reportError(error)
    }
  }

  swap = async () => {
    const { fromWallet, swapData } = this.state
    const key = fromWallet.standard ? fromWallet.standard : fromWallet.currency

    const result = await actions[key].sendReadyTransaction({
      data: swapData?.tx,
    })
  }

  selectCurrency = (params) => {
    const { direction, value } = params
    const { spendedCurrency, receivedCurrency } = this.state

    const updateSpendedSide = direction === 'spend' && spendedCurrency.value !== value.value
    const updateReceivedSide = direction === 'receive' && receivedCurrency.value !== value.value

    if (updateSpendedSide) {
      this.setState(
        () => ({
          spendedCurrency: value,
          fromWallet: actions.core.getWallet({ currency: value.value }),
        }),
        this.updateChainId
      )
    }

    if (updateReceivedSide) {
      this.setState(() => ({
        receivedCurrency: value,
        toWallet: actions.core.getWallet({ currency: value.value }),
      }))
    }
  }

  openExternalExchange = () => {
    const { externalExchangeReference } = this.state
    // open itez window
    // wait while the user closes this window or when his currency wallet gets some amount
    // did he close ? then do nothing
    // did he receive currency amount ? so now we can check it and:
    // - start currency -> token exchange
    // - don't start, show an exchange button for user and wait while he clicks on it
    // call a smart contract

    if (
      window.buyViaCreditCardLink &&
      (externalExchangeReference === null || externalExchangeReference.closed)
    ) {
      this.setState(() => ({
        isPending: true,
      }))

      const newWindowProxy = window.open(
        window.buyViaCreditCardLink,
        'externalFiatExchange',
        'location=yes, height=770, width=620, scrollbars, status, resizable'
      )

      this.setState(() => ({
        externalExchangeReference: newWindowProxy,
      }))
      console.log(newWindowProxy)
    } else {
      externalExchangeReference?.focus()
    }

    // externalExchangeReference.open()
    // externalExchangeReference.closed
  }

  switchAdvancedMode = () => {
    this.setState((state) => ({
      isAdvancedMode: !state.isAdvancedMode,
    }))
  }

  isSwapDataNotAvailable = () => {
    const { isPending, spendedAmount, fromWallet, slippage, slippageMaxRange } = this.state

    const wrongSlippage =
      new BigNumber(slippage).isNaN() ||
      new BigNumber(slippage).isEqualTo(0) ||
      new BigNumber(slippage).isGreaterThan(slippageMaxRange)

    // TODO: worry about the commission
    return (
      isPending ||
      wrongSlippage ||
      new BigNumber(spendedAmount).isNaN() ||
      new BigNumber(spendedAmount).isEqualTo(0) ||
      new BigNumber(spendedAmount).isGreaterThan(fromWallet.balance)
    )
  }

  isSwapNotAvailable = () => {
    const { swapData } = this.state

    return !swapData
  }

  render() {
    const {
      currencies,
      isPending,
      fiat,
      fiatAmount,
      spendedCurrency,
      spendedAmount,
      fromWallet,
      receivedCurrency,
      receivedAmount,
      slippage,
      slippageMaxRange,
      chainId,
      isAdvancedMode,
      advancedOptions,
    } = this.state

    const linked = Link.all(this, 'fiatAmount', 'spendedAmount', 'receivedAmount', 'slippage')

    const swapDataBtnIsDisabled = this.isSwapDataNotAvailable()
    const swapBtnIsDisabled = this.isSwapNotAvailable()

    return (
      <section styleName="bridgeSection">
        <h2 styleName="title">Some title</h2>

        <div styleName="componentsWrapper">
          <ExchangeForm
            stateReference={linked}
            isPending={isPending}
            fiat={fiat}
            fiatAmount={fiatAmount}
            selectCurrency={this.selectCurrency}
            openExternalExchange={this.openExternalExchange}
            currencies={currencies}
            spendedCurrency={spendedCurrency}
            receivedCurrency={receivedCurrency}
            slippage={slippage}
            advancedOptions={advancedOptions}
            chainId={chainId}
          />

          <button styleName="advancedOptionsToggle" onClick={this.switchAdvancedMode}>
            <span styleName="arrow" />
            <FormattedMessage id="advancedOptions" defaultMessage="Advanced options" />
          </button>

          {isAdvancedMode && <AdvancedOptions />}

          <div styleName="calculationsWrapper">Some final amount</div>

          <div styleName="buttonWrapper">
            <Button
              styleName="swapBtn"
              pending={isPending}
              disabled={swapDataBtnIsDisabled}
              onClick={this.getSwapData}
              brand
            >
              <FormattedMessage id="getSwap" defaultMessage="Get swap" />
            </Button>
            <Button
              styleName="swapBtn"
              pending={isPending}
              disabled={swapBtnIsDisabled}
              onClick={this.swap}
              brand
            >
              <FormattedMessage id="swap" defaultMessage="Swap" />
            </Button>
          </div>
        </div>
      </section>
    )
  }
}

export default connect(({ currencies, user: { activeFiat } }) => ({
  currencies: currencies.items,
  activeFiat,
}))(CSSModules(Bridge, styles, { allowMultiple: true }))
