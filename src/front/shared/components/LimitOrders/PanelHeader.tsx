import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import dropDownStyles from 'components/ui/DropDown/index.scss'
import DropDown from 'components/ui/DropDown'

const renderChainName = (item) => {
  const lastIndex = item.chainName.lastIndexOf(' ')

  return item.chainName.substring(0, lastIndex)
}

function PanelHeader(props) {
  const { orders, chainId, changeChain, blockchains } = props
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

  return (
    <>
      <h3>
        <FormattedMessage id="yourOrders" defaultMessage="Your orders" />{' '}
        <span>{`(${orders[chainId] ? orders[chainId].length : 0})`}</span>
      </h3>
      <DropDown
        className={dropDownStyles.simplestDropdown}
        items={dropDownItems}
        selectedValue={renderChainName(chainItem)}
        itemRender={renderChainName}
        selectedItemRender={renderChainName}
        onSelect={onSelect}
      />
    </>
  )
}

export default connect(({ oneinch }) => ({
  blockchains: oneinch.blockchains,
}))(CSSModules(PanelHeader, styles, { allowMultiple: true }))
