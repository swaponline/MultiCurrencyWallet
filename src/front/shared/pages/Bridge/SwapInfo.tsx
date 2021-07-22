import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { externalConfig } from 'helpers'
import { Network, SwapData } from './types'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

type ComponentProps = {
  network: Network
  swapData?: SwapData
  convertFromWei: (string, number) => string
  convertIntoWei: (string, number) => string
}

function SwapInfo(props: ComponentProps) {
  const { network, swapData, convertFromWei, convertIntoWei } = props

  let swapFee: string | undefined = undefined
  let price: string | undefined = undefined
  let swapFeeCurrency: string | undefined = undefined

  if (swapData) {
    const { tx, fromTokenAmount, toTokenAmount, fromToken, toToken } = swapData

    const fromAmount = convertFromWei(fromTokenAmount, fromToken.decimals)
    const toAmount = convertFromWei(toTokenAmount, toToken.decimals)

    price = new BigNumber(fromAmount).div(toAmount).dp(toToken.decimals).toString()
    swapFee = new BigNumber(tx.gas).times(tx.gasPrice).times(18).toString()
    swapFeeCurrency = fromToken.symbol
  }

  return (
    <section styleName="swapInfo">
      <span styleName="indicator">
        Network: <span>{network.chainName}</span>
      </span>
      {price && (
        <span styleName="indicator">
          Price: <span>{price}</span>
        </span>
      )}
      {swapFee && swapFeeCurrency && (
        <span styleName="indicator">
          Fee:{' '}
          <span>
            {swapFee} {swapFeeCurrency}
          </span>
        </span>
      )}
    </section>
  )
}

export default CSSModules(SwapInfo, styles, { allowMultiple: true })
