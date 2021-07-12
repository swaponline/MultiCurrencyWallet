import { useState } from 'react'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import Input from 'components/forms/Input/Input'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'

function Bridge() {
  return (
    <section styleName="bridgeSection">
      <h2 styleName="title">Fiat to ERC20</h2>

      <form styleName="form" action="">
        <input type="number" />
        {/* @ts-ignore */}
        <CurrencySelect
          selectedItemRender={(item) => {
            // const { blockchain } = getCoinInfo(item.value)
            // return blockchain ? `${item.title} (${blockchain})` : item.fullTitle
          }}
          styleName=""
          placeholder="..."
          //selectedValue={}
          //onSelect={}
          currencies={[]}
        />
      </form>
    </section>
  )
}

export default CSSModules(Bridge, styles, { allowMultiple: true })
