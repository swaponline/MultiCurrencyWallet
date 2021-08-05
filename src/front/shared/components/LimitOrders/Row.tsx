import { connect } from 'redaction'
import BigNumber from 'bignumber.js'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import utils from 'common/utils'
import Coins from 'components/Coins/Coins'
import { RemoveButton } from 'components/controls'

window.BigNumber = BigNumber

function Row(props) {
  const { tokens, order, cancelOrder, chainId, baseCurrency } = props
  const { data, makerRate, makerAmount: makerUnitAmount, takerAmount: takerUnitAmount } = order

  const cancel = () => cancelOrder(data)
  const getAsset = (contract) => tokens[chainId][contract]
  const getAssetName = (asset) => `{${baseCurrency}}${asset.symbol}`.toUpperCase()

  const makerAsset = getAsset(data.makerAsset)
  const takerAsset = getAsset(data.takerAsset)

  const makerAssetName = getAssetName(makerAsset)
  const takerAssetName = getAssetName(takerAsset)
  const coinNames = [makerAssetName, takerAssetName]

  // formatting via BigNumber remove not important decimals
  const makerAmount = new BigNumber(
    utils.amount.formatWithoutDecimals(makerUnitAmount, makerAsset.decimals)
  ).toString()

  const takerAmount = new BigNumber(
    utils.amount.formatWithoutDecimals(takerUnitAmount, takerAsset.decimals)
  ).toString()

  const formatedMakerRate = new BigNumber(makerRate).dp(8).toString()

  return (
    <tr styleName="row">
      <td>
        <Coins names={coinNames} size={25} />
      </td>
      <td>
        <span styleName="number">{makerAmount}</span> {makerAsset.symbol}
      </td>
      <td>
        <span styleName="number">{takerAmount}</span> {takerAsset.symbol}
      </td>
      <td>
        <span styleName="number">{formatedMakerRate}</span> {makerAsset.symbol}/{takerAsset.symbol}
      </td>
      <td>
        <RemoveButton onClick={cancel} brand />
      </td>
    </tr>
  )
}

export default connect(({ oneinch }) => ({
  tokens: oneinch.tokens,
}))(CSSModules(Row, styles, { allowMultiple: true }))
