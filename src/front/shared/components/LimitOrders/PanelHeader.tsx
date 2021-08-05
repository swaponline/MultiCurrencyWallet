import { FormattedMessage } from 'react-intl'
import { externalConfig } from 'helpers'
import DropDown from 'shared/components/ui/DropDown'

const availableChains = [
  externalConfig.evmNetworks['ETH'],
  externalConfig.evmNetworks['BNB'],
  externalConfig.evmNetworks['MATIC'],
]

function PanelHeader(props) {
  const { orders, chainId, changeChain } = props

  const onSelect = (item) => {
    changeChain(item.chainId)
  }

  const selectedItemRender = (item) => {
    const lastIndex = item.chainName.lastIndexOf(' ')

    return item.chainName.substring(0, lastIndex)
  }

  return (
    <>
      <h3>
        <FormattedMessage id="yourOrders" defaultMessage="Your orders" />{' '}
        <span>{`(${orders[chainId].length})`}</span>
      </h3>
      <DropDown
        items={availableChains}
        selectedValue={'some value'}
        selectedItemRender={selectedItemRender}
        itemRender={(item) => <div>{item.chainName}</div>}
        onSelect={onSelect}
        role="SelectChain"
      />
    </>
  )
}

export default PanelHeader
