import { PureComponent } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { Token } from 'common/types'
import { feedback, apiLooper, externalConfig, constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { CurrencyMenuItem, ExchangedСurrency, AdvancedOptions, ComponentState } from './types'
import ExchangeForm from './ExchangeForm'

class Bridge extends PureComponent<unknown, ComponentState> {
  constructor(props) {
    super(props)

    const { currencies, activeFiat } = props
    const wallets = actions.core.getWallets()

    this.state = {
      error: null,
      isPending: false,
      externalExchangeReference: null,
      fiat: window.DEFAULT_FIAT || activeFiat,
      fiatAmount: 0,
      wallets,
      currencies,
      spendedCurrency: {
        name: 'MATIC',
        amount: 0,
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      },
      receivedCurrency: {
        name: 'DAI (MATIC)',
        amount: 0,
        address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
      },
      slippage: 1,
      advancedOptions: {},
      chainId: 137,
    }
  }

  serviceIsAvailable = async (params) => {
    const { chaindId } = params

    try {
      const res: any = await apiLooper.get('oneinch', `/${chaindId}/healthcheck`)

      console.log('%c res', 'color: orange; font-size: 20px')
      console.log(res)

      if (res.status === 'OK') {
        return true
      } else {
        this.reportError({
          message: 'External service problem',
        })
      }
    } catch (error) {
      this.reportError(error)

      return false
    }
  }

  reportError = (error) => {
    this.setState(() => ({
      error,
    }))

    // * feedback...
  }

  swap = async () => {
    const {
      chainId,
      slippage,
      wallets,
      spendedCurrency,
      receivedCurrency,
      advancedOptions,
    } = this.state

    const serviceIsOk = await this.serviceIsAvailable({
      chainId,
    })

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

    const request = ''.concat(
      `/${chainId}/`,
      `swap?fromTokenAddress=${spendedCurrency.address}&`,
      `toTokenAddress=${receivedCurrency.address}&`,
      `amount=${spendedCurrency.amount}&`,
      `fromAddress=${0x000}&`,
      `slippage=${slippage}`
    )

    try {
      const res = await apiLooper.get('oneinchExchange', request)
    } catch (error) {
      console.error(error)
    }
  }

  selectCurrency = (params) => {
    const { direction, value } = params

    if (direction === 'spend') {
      this.setState((state) => ({
        spendedCurrency: {
          ...state.spendedCurrency,
          name: value,
        },
      }))
    }

    if (direction === 'receive') {
      this.setState((state) => ({
        receivedCurrency: {
          ...state.receivedCurrency,
          name: value,
        },
      }))
    }
  }

  updateCurrencyAmount = () => {
    // take fiat amount
    // take an exchange rate from the currency object
    // calc final currency amount and save it
    // call calculateTokenAmount()
  }

  calculateTokenAmount = () => {
    // take currency amount
    // take an exchange rate (from token object ?)
    // calc final token amount and save it
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

  render() {
    const {
      currencies,
      isPending,
      fiat,
      fiatAmount,
      spendedCurrency,
      receivedCurrency,
      slippage,
      advancedOptions,
      chainId,
    } = this.state

    const linked = Link.all(this, 'fiatAmount', 'spendedCurrency', 'receivedCurrency')

    return (
      <section styleName="bridgeSection">
        <h2 styleName="title">Some title</h2>

        <ExchangeForm
          stateReference={linked}
          isPending={isPending}
          fiat={fiat}
          fiatAmount={fiatAmount}
          swap={this.swap}
          openExternalExchange={this.openExternalExchange}
          currencies={currencies}
          spendedCurrency={spendedCurrency}
          receivedCurrency={receivedCurrency}
          slippage={slippage}
          advancedOptions={advancedOptions}
          chainId={chainId}
        />
      </section>
    )
  }
}

export default connect(({ currencies, user: { activeFiat } }) => ({
  currencies: currencies.partialItems,
  activeFiat,
}))(CSSModules(Bridge, styles, { allowMultiple: true }))
