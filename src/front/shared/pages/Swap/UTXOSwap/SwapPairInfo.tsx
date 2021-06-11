import React from 'react'
import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import getCoinInfo from 'common/coins/getCoinInfo'

type ISwapPairInfoProps = {
  swap: IUniversalObj
}

const SwapPairInfo = (props: ISwapPairInfoProps) => {
  const {
      swap: {
        sellAmount,
        buyAmount,
        flow: {
            _flowName: flowName
        }
      },
    } = props

  const [ sellCurrency, buyCurrency ] = flowName.split('2')

  const { coin: sellCurrencyName, blockchain: sellCurrencyBlockchain } = getCoinInfo(sellCurrency)
  const { coin: buyCurrencyName, blockchain: buyCurrencyBlockchain } = getCoinInfo(buyCurrency)

  return (
    <div styleName="swapInfo">
      <strong>
        {sellAmount.toFixed(6)}
        {' '}
        {sellCurrencyBlockchain ? `${sellCurrencyName} (${sellCurrencyBlockchain})` : sellCurrencyName} &#10230; {' '}
        {buyAmount.toFixed(6)}
        {' '}
        {buyCurrencyBlockchain ? `${buyCurrencyName} (${buyCurrencyBlockchain})` : buyCurrencyName}
      </strong>
    </div>
  )
}

export default CSSModules(SwapPairInfo, styles)