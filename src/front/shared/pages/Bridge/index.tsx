import { PureComponent } from 'react'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { Token } from 'common/types'
import Link from 'local_modules/sw-valuelink'
import ExchangeForm from './ExchangeForm'

type ComponentState = {
  availableTokens: Token[]
  externalExchangeReference: null | IUniversalObj
  isPending: boolean
  fiat: string
  currency: string
  token: string
  fiatAmount: number
  currencyAmount: number
  tokenAmount: number
}

class Bridge extends PureComponent<unknown, ComponentState> {
  constructor(props) {
    super(props)

    console.log('%c Bridge', 'color: orange; font-size: 20px')
    console.log('props: ', props)

    const { tokens, activeFiat } = props

    this.state = {
      availableTokens: tokens,
      externalExchangeReference: null,
      isPending: false,
      fiat: window.DEFAULT_FIAT || activeFiat,
      fiatAmount: 0,
      currency: 'ETH',
      currencyAmount: 0,
      token: 'WBTC',
      tokenAmount: 0,
    }
  }

  setToken = (params) => {
    const { value } = params

    console.log(value)
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
      availableTokens,
      isPending,
      fiat,
      fiatAmount,
      currency,
      currencyAmount,
      token,
      tokenAmount,
    } = this.state

    const linked = Link.all(this, 'fiatAmount', 'currencyAmount', 'tokenAmount')

    return (
      <section styleName="bridgeSection">
        <h2 styleName="title">Fiat to ERC20</h2>

        <ExchangeForm
          stateReference={linked}
          isPending={isPending}
          fiat={fiat}
          fiatAmount={fiatAmount}
          currency={currency}
          currencyAmount={currencyAmount}
          token={token}
          tokenAmount={tokenAmount}
          setToken={this.setToken}
          openExternalExchange={this.openExternalExchange}
          availableTokens={availableTokens}
        />
      </section>
    )
  }
}

const filterTokens = (tokensData: { [key: string]: Token }) => {
  const tokens = []

  for (let key in tokensData) {
    if (key.startsWith('{eth}')) {
      //@ts-ignore
      tokens.push(tokensData[key])
    }
  }
  return tokens
}

export default connect(({ user: { tokensData, activeFiat } }) => ({
  tokens: filterTokens(tokensData),
  activeFiat,
}))(CSSModules(Bridge, styles, { allowMultiple: true }))
