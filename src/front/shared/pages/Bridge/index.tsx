import { useState } from 'react'
import CSSModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import { BigNumber } from 'bignumber.js'
import styles from './index.scss'
import Link from 'local_modules/sw-valuelink'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import SelectGroup from 'pages/Exchange/SelectGroup/SelectGroup'

function Bridge() {
  const [itezWindowReference, setItezWindowReference] = useState<null | IUniversalObj>(null)
  const [isPending, setIsPending] = useState(false)
  const [fiatAmount, setFiatAmount] = useState(0)
  const [currentCurrency, setCurrentCurrency] = useState<IUniversalObj>({
    name: 'ETH',
    amount: 0,
  })
  const [currentToken, setCurrentToken] = useState<IUniversalObj>({
    name: 'WBTC',
    amount: 0,
  })

  const openFiatExchangeWindow = () => {
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
      setIsPending(true)

      const newWindowProxy = window.open(
        window.buyViaCreditCardLink,
        'externalFiatExchange',
        'location=yes, height=770, width=620, scrollbars, status, resizable'
      )

      setItezWindowReference(newWindowProxy)
      console.log(newWindowProxy)
    } else {
      itezWindowReference?.focus()
    }

    // itezWindowReference.open()
    // itezWindowReference.closed
  }

  const calculateTokenAmount = () => {
    // take currency amount
    // take an exchange rate (from token object ?)
    // calc final token amount and save it
  }

  const calculateCurrencyAmount = () => {
    // take fiat amount
    // take an exchange rate from the currency object
    // calc final currency amount and save it
    // call calculateTokenAmount()
  }

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
          <input
            styleName="amountInput"
            type="number"
            placeholder="Enter fiat amount that you want to spend"
            onChange={calculateCurrencyAmount}
          />
        </div>

        <SelectGroup
          activeFiat={window.DEFAULT_FIAT}
          dataTut="get"
          inputValueLink={} // linked.getAmount
          selectedValue={} // get token
          onSelect={this.choseToken}
          disabled={true}
          label={<FormattedMessage id="partial255" defaultMessage="You get" />}
          id="Exchange472"
          currencies={[]}
          fiat={} // number
        />

        <div>
          Fiat: {}
          Eth: {}
          Token: {}
        </div>

        <Button
          id="exchangeWithEth"
          brand
          pending={isPending}
          disabled={isPending}
          onClick={openFiatExchangeWindow}
        >
          <FormattedMessage id="buy" defaultMessage="Buy" />
        </Button>
      </form>
    </section>
  )
}

export default CSSModules(Bridge, styles, { allowMultiple: true })
