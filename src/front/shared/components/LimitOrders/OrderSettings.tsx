import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import dropDownStyles from 'components/ui/DropDown/index.scss'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import DropDown from 'components/ui/DropDown'

const renderChainName = (item) => {
  const lastIndex = item.chainName.lastIndexOf(' ')

  return item.chainName.substring(0, lastIndex)
}

function OrderSettings(props) {
  const {
    allTokens,
    chainId,
    changeChain,
    blockchains,
    buyCurrencies,
    selectSellCurrency,
    selectBuyCurrency,
    sellCurrency,
    buyCurrency,
  } = props

  const dropDownItems: IUniversalObj[] = Object.values(blockchains).map((item: any) => {
    // in the DropDown we compare the "value" key for correct selected item rendering
    // let's add this key
    item.value = renderChainName(item)

    return item
  })

  const [chainItem, setChainItem] = useState(blockchains[chainId])

  const onSelect = (item) => {
    changeChain(item.chainId)
    setChainItem(item)
  }

  const renderCurrencyName = (item) => item.name.toUpperCase()

  return (
    <div styleName="orderSettings">
      <div styleName="optionWrapper chain">
        <div styleName="title">
          <FieldLabel>
            <FormattedMessage id="Chain" defaultMessage="Chain" />
          </FieldLabel>
        </div>
        <DropDown
          className={dropDownStyles.simplestDropdown}
          items={dropDownItems}
          selectedValue={renderChainName(chainItem)}
          itemRender={renderChainName}
          selectedItemRender={renderChainName}
          onSelect={onSelect}
        />
      </div>

      <div styleName="currencyDropDowns">
        <div styleName="optionWrapper">
          <div styleName="title">
            <FieldLabel>
              <FormattedMessage id="youPay" defaultMessage="You pay" />
            </FieldLabel>
          </div>
          {sellCurrency ? (
            <div styleName="dropdownWrapper">
              <DropDown
                className={dropDownStyles.simplestDropdown}
                selectedValue={sellCurrency.value}
                onSelect={selectSellCurrency}
                items={allTokens}
                itemRender={renderCurrencyName}
                selectedItemRender={renderCurrencyName}
              />
            </div>
          ) : (
            <p styleName="noOptions">
              <FormattedMessage id="noOptions" defaultMessage="No options" />
            </p>
          )}
        </div>

        <div styleName="optionWrapper">
          <div styleName="title">
            <FieldLabel>
              <FormattedMessage id="partial255" defaultMessage="You get" />
            </FieldLabel>
          </div>
          {buyCurrency && buyCurrencies.length ? (
            <div styleName="dropdownWrapper">
              <DropDown
                className={dropDownStyles.simplestDropdown}
                selectedValue={buyCurrency.value}
                onSelect={selectBuyCurrency}
                items={buyCurrencies}
                itemRender={renderCurrencyName}
                selectedItemRender={renderCurrencyName}
              />
            </div>
          ) : (
            <p styleName="noOptions">
              <FormattedMessage id="noOptions" defaultMessage="No options" />
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CSSModules(OrderSettings, styles, { allowMultiple: true })
