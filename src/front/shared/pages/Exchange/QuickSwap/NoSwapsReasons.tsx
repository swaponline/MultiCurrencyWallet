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
    <section>
      {wrongNetwork ? (
        <p styleName="wrongNetworkMessage">
          <FormattedMessage
            id="pleaseChooseAnotherNetwork"
            defaultMessage="Please choose another network"
          />
        </p>
      ) : blockReason === SwapBlockReason.NoLiquidity ? (
        <p>
          <FormattedMessage id="insufficientLiquidity" defaultMessage="Insufficient liquidity" />
        </p>
      ) : blockReason === SwapBlockReason.InsufficientSlippage ? (
        <p>
          <FormattedMessage id="insufficientSlippage" defaultMessage="Insufficient slippage" />
        </p>
      ) : insufficientBalance ? (
        <p>
          <FormattedMessage id="insufficientBalance" defaultMessage="Insufficient balance" />
        </p>
      ) : (
        '-'
      )}
    </section>
  )
}

export default CSSModules(SwapInfo, styles, { allowMultiple: true })
