import { PureComponent } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { Token } from 'common/types'
import externalConfig from 'helpers/externalConfig'
import { feedback, apiLooper } from 'helpers'
import Link from 'local_modules/sw-valuelink'
import ExchangeForm from './ExchangeForm'

type TokenItem = {
  name: string
  title: string
  icon: string
  value: string
  fullTitle: string
  blockchain: string
  standard: string
}

type ComponentState = {
  tokens: TokenItem[]
  externalExchangeReference: null | IUniversalObj
  isPending: boolean
  fiat: string
  currency: string
  token: string
  fiatAmount: number
  currencyAmount: number
  tokenAmount: number
  error: IError | null
}

class Bridge extends PureComponent<unknown, ComponentState> {
  constructor(props) {
    super(props)

    const { tokens, activeFiat } = props

    this.state = {
      tokens,
      externalExchangeReference: null,
      isPending: false,
      fiat: window.DEFAULT_FIAT || activeFiat,
      fiatAmount: 0,
      currency: 'ETH',
      currencyAmount: 0,
      token: tokens[0].value,
      tokenAmount: 0,
      error: null,
    }
  }

  componentDidMount() {
    // ? notification if it's not available ?
    // this.checkAvailabilityOfService()

    // this.swap()
  }

  checkAvailabilityOfService = async () => {
    // ! api doesn't work with test chains
    try {
      const res: any = await apiLooper.get(
        'oneinchExchange',
        `/${externalConfig.evmNetworks.ETH.networkVersion}/healthcheck`
      )

      if (res.status === 'OK') {
        // ...
      } else {
        this.reportError({
          message: 'External service problem',
        })
      }
      console.log('response: ', res)
    } catch (error) {
      console.error(error)
    }
  }

  reportError = (error) => {
    this.setState(() => ({
      error,
    }))

    // feedback.
  }

  swap = async () => {
    const fromAddress = ''
    // ETH
    const sellAsset = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    // WEENUS ropsten
    const buyAsset = '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA'
    const sellAmount = 1_000_000_000_000_000_000

    const request = ''.concat(
      `/${externalConfig.evmNetworks.ETH.networkVersion}/`,
      `swap?fromTokenAddress=${sellAsset}&`,
      `toTokenAddress=${buyAsset}&`,
      `amount=${sellAmount}&`,
      `fromAddress=${fromAddress}&`,
      `slippage=1`
    )

    try {
      const res = await apiLooper.get('oneinchExchange', request)
    } catch (error) {
      console.error(error)
    }
  }

  selectToken = (params) => {
    const { value } = params

    console.log(value)

    this.setState(() => ({
      token: value,
    }))
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
      tokens,
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
          selectToken={this.selectToken}
          openExternalExchange={this.openExternalExchange}
          tokens={tokens}
        />
      </section>
    )
  }
}

const filterTokens = (tokens: TokenItem[]) => {
  return tokens.filter((token) => {
    return token.blockchain === 'ETH'
  })
}

export default connect(({ currencies, user: { tokensData, activeFiat } }) => ({
  tokens: filterTokens(currencies.partialItems),
  tokensData,
  activeFiat,
}))(CSSModules(Bridge, styles, { allowMultiple: true }))
