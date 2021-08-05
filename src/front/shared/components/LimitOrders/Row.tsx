import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import utils from 'common/utils'
import Coins from 'components/Coins/Coins'
import { RemoveButton } from 'components/controls'

function Row(props) {
  const { tokens, order, cancelOrder, chainId } = props
  const { data, makerAmount: makerUnitAmount, takerAmount: takerUnitAmount } = order

  const baseCurrency = 'matic'

  const cancel = () => cancelOrder(data)
  const getAsset = (contract) => tokens[chainId][contract]
  const getAssetName = (asset) => `{${baseCurrency}} ${asset.symbol}`.toUpperCase()

  const makerAsset = getAsset(data.makerAsset)
  const takerAsset = getAsset(data.takerAsset)

  const makerAssetName = getAssetName(makerAsset)
  const takerAssetName = getAssetName(takerAsset)
  const coinNames = [makerAssetName, takerAssetName]

  const makerAmount = utils.amount.formatWithoutDecimals(makerUnitAmount, makerAsset.decimals)
  const takerAmount = utils.amount.formatWithoutDecimals(takerUnitAmount, takerAsset.decimals)

  return (
    <tr styleName="row">
      <td>
        <Coins names={coinNames} size={25} />
      </td>
      <td>
        <span styleName="number">{makerAmount}</span> {makerAssetName}
      </td>
      <td>
        <span styleName="number">{takerAmount}</span> {takerAssetName}
      </td>
      <td><span styleName="number">rate</span></td>
      <td>
        <RemoveButton onClick={cancel} brand />
      </td>
    </tr>
  )
}

export default connect(({ oneinch }) => ({
  tokens: oneinch.tokens,
}))(CSSModules(Row, styles, { allowMultiple: true }))
