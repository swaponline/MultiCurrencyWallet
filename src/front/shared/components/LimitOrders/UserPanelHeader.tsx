import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import dropDownStyles from 'components/ui/DropDown/index.scss'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import DropDown from 'components/ui/DropDown'

const renderChainName = (item) => {
  const lastIndex = item.chainName.lastIndexOf(' ')

  return item.chainName.substring(0, lastIndex)
}

function UserPanelHeader(props) {
  const {
    allTokens,
    userOrders,
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

  console.log('props: ', props)

  const renderCurrencyName = (item) => item.value.toUpperCase() // replace with .name.

  return (
    <div styleName="header">
      <div styleName="headerRow chain">
        <h3>
          <FormattedMessage id="yourOrders" defaultMessage="Your orders" />{' '}
          <span>{`(${userOrders[chainId] ? userOrders[chainId].length : 0})`}</span>
        </h3>
        <DropDown
          className={dropDownStyles.simplestDropdown}
          items={dropDownItems}
          selectedValue={renderChainName(chainItem)}
          itemRender={renderChainName}
          selectedItemRender={renderChainName}
          onSelect={onSelect}
        />
      </div>

      <div styleName="headerRow">
        <div styleName="currencySelect">
          <div styleName="title">
            <FieldLabel>
              <FormattedMessage id="youPay" defaultMessage="You Pay" />
            </FieldLabel>
          </div>

          <DropDown
            className={dropDownStyles.simplestDropdown}
            selectedValue={sellCurrency}
            onSelect={selectSellCurrency}
            items={allTokens}
            itemRender={renderCurrencyName}
            selectedItemRender={renderCurrencyName}
          />
        </div>

        <div styleName="currencySelect">
          <div styleName="title">
            <FieldLabel>
              <FormattedMessage id="partial255" defaultMessage="You Get" />
            </FieldLabel>
          </div>

          <DropDown
            className={dropDownStyles.simplestDropdown}
            selectedValue={buyCurrency}
            onSelect={selectBuyCurrency}
            items={buyCurrencies}
            itemRender={renderCurrencyName}
            selectedItemRender={renderCurrencyName}
          />
        </div>
      </div>
    </div>
  )
}

export default connect(({ oneinch }) => ({
  blockchains: oneinch.blockchains,
}))(CSSModules(UserPanelHeader, styles, { allowMultiple: true }))
