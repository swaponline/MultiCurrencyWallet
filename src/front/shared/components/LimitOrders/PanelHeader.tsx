import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import dropDownStyles from 'components/ui/DropDown/index.scss'
import DropDown from 'shared/components/ui/DropDown'

function PanelHeader(props) {
  const { orders, chainId, changeChain, blockchains } = props
  const dropDownItems: IUniversalObj[] = Object.values(blockchains)
  const [chainItem, setChainItem] = useState(blockchains[chainId])

  const onSelect = (item) => {
    changeChain(item.chainId)
    setChainItem(item)
  }

  const renderChainName = (item) => {
    const lastIndex = item.chainName.lastIndexOf(' ')

    return item.chainName.substring(0, lastIndex)
  }

  return (
    <>
      <h3>
        <FormattedMessage id="yourOrders" defaultMessage="Your orders" />{' '}
        <span>{`(${orders[chainId] ? orders[chainId].length : 0})`}</span>
      </h3>
      <div styleName="dropDownWrapper">
        <DropDown
          className={dropDownStyles.simpleDropdown}
          items={dropDownItems}
          selectedValue={chainItem.chainName}
          itemRender={renderChainName}
          onSelect={onSelect}
        />
      </div>
    </>
  )
}

export default connect(({ oneinch }) => ({
  blockchains: oneinch.blockchains,
}))(CSSModules(PanelHeader, styles, { allowMultiple: true }))
