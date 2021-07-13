import { useState } from 'react'
import CSSModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import styles from './index.scss'
import Link from 'local_modules/sw-valuelink'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'

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

    if (itezWindowReference === null || itezWindowReference.closed) {    
      setIsPending(true)

      // TODO: move this url somewhere
      const newWindowProxy = window.open(
        'https://buy.itez.com/swaponline',
        'itezExchange',
        'location=yes, height=770, width=620, scrollbars, status, resizable'
      )

      setItezWindowReference(newWindowProxy)
      console.log(newWindowProxy)
    } else {
      itezWindowReference.focus()
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

        {/* ethereum amount part */}
        <div styleName="inputWrapper"> 
          <FieldLabel>
            {currentCurrency.name}{' '}
            <Tooltip id="ethereumAmountTooltip">
              <FormattedMessage
                id="ethereumAmountNotice"
                defaultMessage="Some useful notice for user about ethereum amount"
              />
            </Tooltip>
          </FieldLabel>
          <input
            disabled
            styleName="amountInput"
            type="number"
            placeholder={`${currentCurrency.name} you will get`}
          />
        </div>

        {/* tokens drop down. Current token amount part */}

        {/* @ts-ignore */}
        <CurrencySelect
          selectedItemRender={(item) => item.title}
          styleName=""
          placeholder="..."
          //selectedValue={}
          //onSelect={}
          currencies={[]}
        />

        <Button
          id='exchangeWithEth'
          brand
          pending={isPending}
          disabled={isPending}
          onClick={openFiatExchangeWindow}
        >
          <FormattedMessage id="buy" defaultMessage="Buy" />
          {' '}
          {currentToken.name}
        </Button>
      </form>
    </section>
  )
}

export default CSSModules(Bridge, styles, { allowMultiple: true })
