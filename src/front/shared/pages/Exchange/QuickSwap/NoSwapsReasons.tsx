import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { SwapBlockReason } from './types'

function SwapInfo(props) {
  const { blockReason, fromWallet, spendedAmount, swapFee, wrongNetwork } = props

  const insufficientBalance =
    new BigNumber(fromWallet.balance).isEqualTo(0) ||
    new BigNumber(spendedAmount).plus(swapFee || 0).isGreaterThan(fromWallet.balance)

  return (
    <section styleName="reasons">
      {wrongNetwork ? (
        <p styleName="wrong">
          <FormattedMessage id="incorrectNetwork" defaultMessage='Please choose correct network' />
        </p>
      ) : blockReason === SwapBlockReason.NoLiquidity ? (
        <p styleName="neutral">
          <FormattedMessage id="insufficientLiquidity" defaultMessage="Insufficient liquidity" />
        </p>
      ) : blockReason === SwapBlockReason.InsufficientSlippage ? (
        <p styleName="neutral">
          <FormattedMessage id="insufficientSlippage" defaultMessage="Insufficient slippage" />
        </p>
      ) : insufficientBalance ? (
        <p styleName="neutral">
          <FormattedMessage id="insufficientBalance" defaultMessage="Insufficient balance" />
        </p>
      ) : !spendedAmount ? (
        <p styleName="neutral">
          <FormattedMessage id="enterYouSend" defaultMessage='Enter "You send" amount' />
        </p>
      ) : null}
    </section>
  )
}

export default CSSModules(SwapInfo, styles, { allowMultiple: true })
