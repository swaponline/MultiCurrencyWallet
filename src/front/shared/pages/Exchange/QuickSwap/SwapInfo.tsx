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
  spendedAmount: string
  baseChainWallet: IUniversalObj
  fromWallet: IUniversalObj
  toWallet: IUniversalObj
  fiat: string
  isDataPending: boolean
}

function SwapInfo(props: ComponentProps) {
  const {
    network,
    swapData,
    swapFee,
    fromWallet,
    toWallet,
    spendedAmount,
    baseChainWallet,
    fiat,
    isDataPending,
  } = props

  let fee: string | undefined = undefined
  let total: string | undefined = undefined
  let fiatFee: string | undefined = undefined
  let totalFiat: string | undefined = undefined
  let price: string | undefined = undefined

  if (swapData) {
    //const { fromTokenAmount, toTokenAmount, fromToken, toToken } = swapData
    const { sellAmount, buyAmount, fromToken, toToken } = swapData

    const fromAmount = commonUtils.amount.formatWithoutDecimals(
      sellAmount,
      fromWallet.decimals || 18
    )
    const toAmount = commonUtils.amount.formatWithoutDecimals(buyAmount, toWallet.decimals || 18)
    const customDecimals = 7

    price = `${new BigNumber(fromAmount).div(toAmount).dp(customDecimals).toString()} ${
      fromWallet.currency
    } / ${toWallet.currency}`

    const totalAmount = new BigNumber(spendedAmount).plus(swapFee).dp(customDecimals)

    fee = `${new BigNumber(swapFee).dp(customDecimals)} ${network.currency}`
    total = `${totalAmount} ${network.currency}`

    if (baseChainWallet.infoAboutCurrency?.price) {
      const fixedAmount = utils.toMeaningfulFiatValue({
        value: swapFee,
        rate: baseChainWallet.infoAboutCurrency.price,
      })
      const fixedTotalAmount = utils.toMeaningfulFiatValue({
        value: totalAmount,
        rate: baseChainWallet.infoAboutCurrency.price,
      })

      fiatFee = `(${fixedAmount} ${fiat})`
      totalFiat = `(${fixedTotalAmount} ${fiat})`
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
          {swapFee && (
            <span styleName="indicator">
              <FormattedMessage id="fee" defaultMessage="Fee" />: <span>{fee}</span>
              {fiatFee && <span>{fiatFee}</span>}
            </span>
          )}
          {spendedAmount && swapFee && (
            <span styleName="indicator">
              <FormattedMessage id="total" defaultMessage="Total" />: <span>{total}</span>
              {totalFiat && <span>{totalFiat}</span>}
            </span>
          )}
        </>
      )}
    </section>
  )
}

export default CSSModules(SwapInfo, styles, { allowMultiple: true })
