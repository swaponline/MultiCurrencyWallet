import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import commonUtils from 'common/utils'
import { utils } from 'helpers'
import { Network, SwapData } from './types'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

type ComponentProps = {
  network: Network
  swapData?: SwapData
  swapFee: string
  baseChainWallet: IUniversalObj
  fiat: string
  isDataPending: boolean
}

function SwapInfo(props: ComponentProps) {
  const { network, swapData, swapFee, baseChainWallet, fiat, isDataPending } = props

  let fee: string | undefined = undefined
  let fiatFee: string | undefined = undefined
  let price: string | undefined = undefined

  if (swapData) {
    const { fromTokenAmount, toTokenAmount, fromToken, toToken } = swapData

    const fromAmount = commonUtils.amount.formatWithoutDecimals(fromTokenAmount, fromToken.decimals)
    const toAmount = commonUtils.amount.formatWithoutDecimals(toTokenAmount, toToken.decimals)
    const customDecimals = 7

    price = `${new BigNumber(fromAmount).div(toAmount).dp(customDecimals).toString()} ${
      fromToken.symbol
    } / ${toToken.symbol}`

    fee = `${new BigNumber(swapFee).dp(customDecimals)} ${network.currency}`

    if (baseChainWallet.infoAboutCurrency?.price) {
      const amount = utils.toMeaningfulFiatValue({
        value: swapFee,
        rate: baseChainWallet.infoAboutCurrency.price,
      })

      fiatFee = `(${amount} ${fiat})`
    }
  }

  return (
    <section styleName="swapInfo">
      <span styleName="indicator">
        <FormattedMessage id="network" defaultMessage="Network" />: <span>{network.chainName}</span>
      </span>

      {isDataPending ? (
        <div styleName="loaderWrapper">
          <InlineLoader />
        </div>
      ) : (
        <>
          {price && (
            <span styleName="indicator">
              <FormattedMessage id="orders105" defaultMessage="Price" />: <span>{price}</span>
            </span>
          )}
          {fee && (
            <span styleName="indicator">
              <FormattedMessage id="fee" defaultMessage="Fee" />: <span>{fee}</span>
              {fiatFee && <span>{fiatFee}</span>}
            </span>
          )}
        </>
      )}
    </section>
  )
}

export default CSSModules(SwapInfo, styles, { allowMultiple: true })
