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
  swapFee?: string
  baseChainWallet: IUniversalObj
  fiat: string
  isDataPending: boolean
  isSwapPending: boolean
  convertFromWei: (string, number) => string
  convertIntoWei: (string, number) => string
}

function SwapInfo(props: ComponentProps) {
  const {
    network,
    swapData,
    swapFee,
    baseChainWallet,
    fiat,
    isDataPending,
    isSwapPending,
    convertFromWei,
  } = props

  const isPending = isDataPending || isSwapPending
  let fee: string | undefined = undefined
  let fiatFee: string | undefined = undefined
  let price: string | undefined = undefined

  if (swapData) {
    const { tx, fromTokenAmount, toTokenAmount, fromToken, toToken } = swapData

    const fromAmount = convertFromWei(fromTokenAmount, fromToken.decimals)
    const toAmount = convertFromWei(toTokenAmount, toToken.decimals)

    price = `${new BigNumber(fromAmount).div(toAmount).dp(toToken.decimals).toString()} ${
      fromToken.symbol
    } / ${toToken.symbol}`

    fee = `${swapFee} ${network.currency}`

    /* if (baseChainWallet.infoAboutCurrency?.price) {
      fiatFee = `(${swapFee.times(baseChainWallet.infoAboutCurrency.price).toString()} ${fiat})`
    } */
  }

  return (
    <section styleName="swapInfo">
      <span styleName="indicator">
        Network: <span>{network.chainName}</span>
      </span>
      {isPending ? (
        <div styleName="loaderWrapper">
          <InlineLoader />
        </div>
      ) : (
        <>
          {price && (
            <span styleName="indicator">
              Price: <span>{price}</span>
            </span>
          )}
          {fee && (
            <span styleName="indicator">
              Fee: <span>{fee}</span>
              {fiatFee && <span>{fiatFee}</span>}
            </span>
          )}
        </>
      )}
    </section>
  )
}

export default CSSModules(SwapInfo, styles, { allowMultiple: true })
