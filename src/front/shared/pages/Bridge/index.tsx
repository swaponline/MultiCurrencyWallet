import { PureComponent } from 'react'
import CSSModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import styles from './index.scss'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Link from 'local_modules/sw-valuelink'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import SelectGroup from 'pages/Exchange/SelectGroup/SelectGroup'

type ComponentState = {
  itezWindowReference: null | IUniversalObj
  isPending: boolean
  fiat: string
  currency: string
  token: string
  fiatAmount: number
  currencyAmount: number
  tokenAmount: number
}

@connect(
  ({
    currencies,
    user: { tokensData, activeFiat },
  }) => ({
    currencies,
    tokensData,
    activeFiat,
  })
)
class Bridge extends PureComponent<unknown, ComponentState> {
  constructor(props) {
    super(props)

    const { currencies, tokensData, activeFiat } = props

    this.state = {
      itezWindowReference: null,
      isPending: false,
      fiat: window.DEFAULT_FIAT || 'USD',
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
    const { itezWindowReference } = this.state
    // open itez window
    // wait while the user closes this window or when his currency wallet gets some amount
    // did he close ? then do nothing
    // did he recive currency amount ? so now we can check it and:
    // - start currency -> token exchange
    // - don't start, show an exchange button for user and wait while he clicks on it
    // call a smart contract

    if (
      window.buyViaCreditCardLink &&
      (itezWindowReference === null || itezWindowReference.closed)
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
        itezWindowReference: newWindowProxy,
      }))
      console.log(newWindowProxy)
    } else {
      itezWindowReference?.focus()
    }

    // itezWindowReference.open()
    // itezWindowReference.closed
  }

  render() {
    const {
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
  
        <form styleName="form" action="">
          {/* fiat amount part */}
          <div styleName="inputWrapper">
            <FieldLabel>
              <FormattedMessage id="fiatAmount" defaultMessage="Fiat amount" />{' '}
              <Tooltip id="fiatAmountTooltip">
                <FormattedMessage
                  id="fiatAmountNotice"
                  defaultMessage="Some useful notice for user"
                />
              </Tooltip>
            </FieldLabel>
            <Input
              pattern="0-9\."
              onKeyDown={inputReplaceCommaWithDot}
              valueLink={linked.fiatAmount}
            />
          </div>
  
          <SelectGroup
            activeFiat={window.DEFAULT_FIAT}
            dataTut="get"
            inputValueLink={linked.tokenAmount}
            selectedValue={token}
            onSelect={this.setToken}
            disabled={true}
            label={<FormattedMessage id="partial255" defaultMessage="You get" />}
            id="Exchange472"
            currencies={[]}
            fiat={fiatAmount}
          />
  
          <div styleName="calculationsWrapper">
            <b>{fiat} rate: {}</b>
            <b>{currency}: {currencyAmount}</b>
            <b>{token}: {tokenAmount}</b>
          </div>
  
          <Button
            styleName="buyButton"
            pending={isPending}
            disabled={isPending}
            onClick={this.openExternalExchange}
            empty
            big
          >
            <FormattedMessage id="buy" defaultMessage="Buy" />
          </Button>
        </form>
      </section>
    )
  }
}

export default CSSModules(Bridge, styles, { allowMultiple: true })
