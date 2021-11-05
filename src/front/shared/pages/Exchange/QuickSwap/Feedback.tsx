import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { BlockReasons } from './types'

function Feedback(props) {
  const {
    blockReason,
    baseChainWallet,
    spendedAmount,
    insufficientBalance,
    wrongNetwork,
    needApprove,
    spendedCurrency,
    error,
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
      ) : blockReason === BlockReasons.InsufficientSlippage ? (
        <p styleName="warning">
          <FormattedMessage
            id="insufficientSlippage"
            defaultMessage="Insufficient slippage. Try to increase it"
          />
        </p>
      ) : blockReason === BlockReasons.NoLiquidity ? (
        <p styleName="neutral">
          <FormattedMessage
            id="insufficientLiquidity"
            defaultMessage="Insufficient pool liquidity"
          />
        </p>
      ) : blockReason === BlockReasons.Liquidity ? (
        <p styleName="neutral">
          <FormattedMessage
            id="liquidityPoolProblem"
            defaultMessage="There is some problem with liquidity pool. Try direct swap"
          />
        </p>
      ) : blockReason === BlockReasons.PairDoesNotExist ? (
        <p styleName="neutral">
          <FormattedMessage
            id="liquidityPairDoesNotExist"
            defaultMessage="This pair does not have liquidity. You can create a new one and be the first liquidity provider"
          />
        </p>
      ) : blockReason === BlockReasons.Unknown ? (
        <p styleName="wrong">
          <FormattedMessage
            id="unknownSwapProblemHasOccurred"
            defaultMessage="Unknown problem has occurred"
          />
        </p>
      ) : null}

      {error && <pre styleName="wrong">{error?.message}</pre>}
    </section>
  )
}

export default CSSModules(Feedback, styles, { allowMultiple: true })
