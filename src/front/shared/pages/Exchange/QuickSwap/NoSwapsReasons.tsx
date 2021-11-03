import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { SwapBlockReason } from './types'

function NoSwapsReasons(props) {
  const {
    blockReason,
    baseChainWallet,
    spendedAmount,
    insufficientBalance,
    wrongNetwork,
    needApprove,
    spendedCurrency,
  } = props

  return (
    <section styleName="reasons">
      {wrongNetwork ? (
        <p styleName="wrong">
          <FormattedMessage id="incorrectNetwork" defaultMessage="Please choose correct network" />
        </p>
      ) : !spendedAmount ? (
        <p styleName="neutral">
          <FormattedMessage id="enterYouSend" defaultMessage='Enter "You send" amount' />
        </p>
      ) : new BigNumber(baseChainWallet?.balance).isEqualTo(0) ? (
        <p styleName="warning">
          <FormattedMessage
            id="doNotHaveNativeCurrencyBalance"
            defaultMessage="You do not have native currency balance to pay the transaction fee"
          />
        </p>
      ) : insufficientBalance ? (
        <p styleName="warning">
          <FormattedMessage
            id="AlertOrderNonEnoughtBalance"
            defaultMessage="Please top up your balance before you start the swap"
          />
        </p>
      ) : needApprove ? (
        <p styleName="warning">
          <FormattedMessage
            id="approveTokenFirst"
            defaultMessage="Please approve {token} first"
            values={{ token: spendedCurrency.name }}
          />
        </p>
      ) : blockReason === SwapBlockReason.InsufficientSlippage ? (
        <p styleName="warning">
          <FormattedMessage
            id="insufficientSlippage"
            defaultMessage="Insufficient slippage. Try to increase it"
          />
        </p>
      ) : blockReason === SwapBlockReason.NoLiquidity ? (
        <p styleName="neutral">
          <FormattedMessage
            id="insufficientLiquidity"
            defaultMessage="Insufficient pool liquidity"
          />
        </p>
      ) : blockReason === SwapBlockReason.Liquidity ? (
        <p styleName="neutral">
          <FormattedMessage
            id="liquidityPoolProblem"
            defaultMessage="There is some problem with liquidity pool. Try direct swap"
          />
        </p>
      ) : blockReason === SwapBlockReason.Unknown ? (
        <p styleName="wrong">
          <FormattedMessage
            id="unknownSwapProblemHasOccurred"
            defaultMessage="Unknown problem has occurred"
          />
        </p>
      ) : null}
    </section>
  )
}

export default CSSModules(NoSwapsReasons, styles, { allowMultiple: true })
