import { useState, useEffect } from 'react'
import { connect } from 'redaction'
import BigNumber from 'bignumber.js'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import utils from 'common/utils'
import actions from 'redux/actions'
import Coins from 'components/Coins/Coins'
import { RemoveButton } from 'components/controls'

function debounce(callback, ms) {
  let timer

  return () => {
    clearTimeout(timer)

    timer = setTimeout(() => {
      timer = null
      callback.apply(this, arguments)
    }, ms)
  }
}

function Row(props) {
  const { tokens, order, orderIndex, cancelOrder, chainId, baseCurrency } = props
  const { data, makerRate, makerAmount: makerUnitAmount, takerAmount: takerUnitAmount } = order

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
  })

  useEffect(() => {
    const debouncedHandleResize = debounce(() => {
      setDimensions({
        width: window.innerWidth,
      })
    }, 500)

    window.addEventListener('resize', debouncedHandleResize)

    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  })

  const getAsset = (contract) => tokens[chainId][contract]
  const getAssetName = (asset) => `{${baseCurrency}}${asset.symbol}`.toUpperCase()

  const makerAsset = getAsset(data.makerAsset)
  const takerAsset = getAsset(data.takerAsset)

  const makerAssetName = getAssetName(makerAsset)
  const makerWallet = actions.core.getWallet({ currency: makerAssetName })
  const takerAssetName = getAssetName(takerAsset)

  const coinNames = [makerAssetName, takerAssetName]

  const cancel = () => {
    cancelOrder({
      makerAsset,
      takerAsset,
      orderIndex,
      order,
      makerWallet,
    })
  }

  // formatting via BigNumber remove not important decimals
  const makerAmount = new BigNumber(
    utils.amount.formatWithoutDecimals(makerUnitAmount, makerAsset.decimals)
  ).toString()

  const takerAmount = new BigNumber(
    utils.amount.formatWithoutDecimals(takerUnitAmount, takerAsset.decimals)
  ).toString()

  const formatedMakerRate = new BigNumber(makerRate).dp(8).toString()

  const mobileRangeWidth = 650 // px
  const mobileResolution = dimensions.width < mobileRangeWidth

  return (
    <tr styleName={`row ${mobileResolution ? 'mobile' : ''}`}>
      <td>
        <Coins names={coinNames} size={mobileResolution ? 20 : 25} />
      </td>
      <td>
        <span styleName="number">{makerAmount}</span> {makerAsset.symbol}
      </td>
      <td>
        <span styleName="number">{takerAmount}</span> {takerAsset.symbol}
      </td>
      <td styleName="rate">
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
