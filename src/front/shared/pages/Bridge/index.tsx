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
import { ComponentState } from './types'
import Button from 'components/controls/Button/Button'
import ExchangeForm from './ExchangeForm'
import AdvancedOptions from './AdvancedOptions'

class Bridge extends PureComponent<unknown, ComponentState> {
  constructor(props) {
    super(props)

    const { currencies, activeFiat } = props
    const wallets = actions.core.getWallets()

    console.log('props: ', props)

    this.state = {
      error: null,
      isPending: false,
      externalExchangeReference: null,
      fiat: window.DEFAULT_FIAT || activeFiat,
      fiatAmount: 0,
      wallets,
      currencies,
      spendedCurrency: currencies[0],
      spendedAmount: 0,
      fromAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      receivedCurrency: currencies[1],
      receivedAmount: 0,
      toAddress: '',
      slippage: 1,
      chainId: 137,
      isAdvancedMode: false,
      advancedOptions: {},
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
      spendedAmount,
      fromAddress,
      receivedCurrency,
      receivedAmount,
      toAddress,
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
      `swap?fromTokenAddress=${fromAddress}&`,
      `toTokenAddress=${toAddress}&`,
      `amount=${spendedAmount}&`,
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
      this.setState(() => ({
        spendedCurrency: value,
      }))
    }

    if (direction === 'receive') {
      this.setState(() => ({
        receivedCurrency: value,
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

  switchAdvancedMode = () => {
    this.setState((state) => ({
      isAdvancedMode: !state.isAdvancedMode,
    }))
  }

  render() {
    const {
      currencies,
      isPending,
      fiat,
      fiatAmount,
      spendedCurrency,
      spendedAmount,
      receivedCurrency,
      receivedAmount,
      slippage,
      chainId,
      isAdvancedMode,
      advancedOptions,
    } = this.state

    const linked = Link.all(this, 'fiatAmount', 'spendedAmount', 'receivedAmount', 'slippage')

    return (
      <section styleName="bridgeSection">
        <h2 styleName="title">Some title</h2>

        <div styleName="componentsWrapper">
          <ExchangeForm
            stateReference={linked}
            isPending={isPending}
            fiat={fiat}
            fiatAmount={fiatAmount}
            swap={this.swap}
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

          <Button
            styleName="swapButton"
            pending={isPending}
            // TODO
            disabled={true}
            onClick={this.swap}
            brand
          >
            <FormattedMessage id="swap" defaultMessage="Swap" />
          </Button>
        </div>
      </section>
    )
  }
}

export default connect(({ currencies, user: { activeFiat } }) => ({
  currencies: currencies.partialItems,
  activeFiat,
}))(CSSModules(Bridge, styles, { allowMultiple: true }))
