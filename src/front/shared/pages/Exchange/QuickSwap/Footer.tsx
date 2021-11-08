import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import utils from 'common/utils'
import ADDRESSES from 'common/helpers/constants/ADDRESSES'
import actions from 'redux/actions'
import { feedback, externalConfig, constants, transactions, routing } from 'helpers'
import { ComponentState, BlockReasons, Actions } from './types'
import { GWEI_DECIMALS, COIN_DECIMALS, LIQUIDITY_SOURCE_DATA, SEC_PER_MINUTE } from './constants'
import Button from 'components/controls/Button/Button'

const returnRouter = (name) => {
  if (name.match(/pancake/gim)) {
    return externalConfig.swapContract.pancakeswapRouter
  }
}

type FooterProps = {
  parentState: ComponentState
  insufficientBalance: boolean
  isSourceMode: boolean
  sourceAction: Actions
  reportError: (e: IError) => void
  resetSwapData: () => void
  resetSpendedAmount: () => void
  setBlockReason: (a: BlockReasons) => void
  isProcessBlocking: () => boolean
  fetchSwapAPIData: () => void
  setPending: (a: boolean) => void
  setNeedApprove: (a: boolean) => void
  baseChainWallet: IUniversalObj
}

function Footer(props: FooterProps) {
  const {
    parentState,
    isSourceMode,
    sourceAction,
    reportError,
    setBlockReason,
    resetSwapData,
    resetSpendedAmount,
    isProcessBlocking,
    insufficientBalance,
    fetchSwapAPIData,
    setPending,
    setNeedApprove,
    baseChainWallet,
  } = props
  const {
    network,
    spendedAmount,
    fromWallet,
    spendedCurrency,
    toWallet,
    swapData,
    gasLimit,
    gasPrice,
    needApprove,
    isPending,
    receivedAmount,
    userDeadline,
    error,
    slippage,
    liquidityErrorMessage,
  } = parentState

  const [routerAddress, setRouterAddress] = useState<string>(
    LIQUIDITY_SOURCE_DATA[network.networkVersion]?.router
  )

  useEffect(() => {
    setRouterAddress(LIQUIDITY_SOURCE_DATA[network.networkVersion]?.router)
  }, [network?.networkVersion])

  const [] = useState()

  const approve = async () => {
    setPending(true)

    try {
      const transactionHash = await actions.oneinch.approveToken({
        chainId: network.networkVersion,
        amount: spendedAmount,
        name: fromWallet.tokenKey,
        standard: fromWallet.standard,
        spender: externalConfig.swapContract.zerox,
      })

      actions.notifications.show(constants.notifications.Transaction, {
        link: transactions.getLink(fromWallet.standard, transactionHash),
      })

      setPending(false)
      setNeedApprove(false)

      await fetchSwapAPIData()
    } catch (error) {
      reportError(error)
    }
  }

  const apiSwap = async () => {
    if (isSourceMode) return

    const baseCurrency = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency
    const assetName = fromWallet.standard ? fromWallet.tokenKey : fromWallet.currency

    feedback.zerox.startedSwap(`${fromWallet.currency} -> ${toWallet.currency}`)
    setPending(true)

    try {
      if (!swapData) {
        throw new Error('No swap data. Can not complete swap')
      }

      if (gasLimit) swapData.gas = gasLimit
      if (gasPrice) swapData.gasPrice = utils.amount.formatWithDecimals(gasPrice, GWEI_DECIMALS)

      const txHash = await actions[baseCurrency.toLowerCase()].sendReadyTransaction({
        data: swapData,
      })

      if (txHash) {
        const txInfoUrl = transactions.getTxRouter(assetName.toLowerCase(), txHash)

        routing.redirectTo(txInfoUrl)
      }

      resetSwapData()
      resetSpendedAmount()
    } catch (error) {
      reportError(error)
    } finally {
      setPending(false)
    }
  }

  const directSwap = async () => {
    if (sourceAction !== Actions.Swap || !isSourceMode) return

    const baseCurrency = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency

    feedback.liquiditySource.startedSwap(
      `Source: ${LIQUIDITY_SOURCE_DATA[network.networkVersion]?.name}. Route: ${
        fromWallet.currency
      } -> ${toWallet.currency}`
    )
    setPending(true)

    try {
      const result = await actions.uniswap.swapCallback({
        slippage,
        routerAddress,
        baseCurrency,
        owner: fromWallet.address,
        fromTokenStandard: fromWallet.standard ?? '',
        fromTokenName: fromWallet.tokenKey ?? '',
        fromToken: fromWallet.contractAddress ?? ADDRESSES.EVM_COIN_ADDRESS,
        sellAmount: spendedAmount,
        fromTokenDecimals: fromWallet.decimals ?? COIN_DECIMALS,
        toToken: toWallet.contractAddress ?? ADDRESSES.EVM_COIN_ADDRESS,
        buyAmount: receivedAmount,
        toTokenDecimals: toWallet.decimals ?? COIN_DECIMALS,
        deadlinePeriod: userDeadline * SEC_PER_MINUTE,
        useFeeOnTransfer: true,
      })

      setPending(false)

      if (result instanceof Error) {
        if (result?.message?.match(/INSUFFICIENT_OUTPUT_AMOUNT/)) {
          setBlockReason(BlockReasons.InsufficientSlippage)
        } else {
          reportError(result)
        }
      } else if (result?.transactionHash) {
        const txInfoUrl = transactions.getTxRouter(
          fromWallet.standard ? fromWallet.tokenKey : fromWallet.currency,
          result.transactionHash
        )

        routing.redirectTo(txInfoUrl)
      }
    } catch (error) {
      reportError(error)
    } finally {
      setPending(false)
    }
  }

  const addLiquidity = async () => {
    if (sourceAction !== Actions.AddLiquidity || !isSourceMode) return

    feedback.liquiditySource.addLiquidity(
      `Source: ${LIQUIDITY_SOURCE_DATA[network.networkVersion]?.name}. Asset A: ${
        fromWallet.currency
      }. Asset B: ${toWallet.currency}`
    )
    setPending(true)

    try {
      const result = await actions.uniswap.addLiquidityCallback({
        routerAddress: LIQUIDITY_SOURCE_DATA[network.networkVersion]?.router,
        baseCurrency: baseChainWallet.currency,
        slippage,
        tokenA: fromWallet.contractAddress ?? ADDRESSES.EVM_COIN_ADDRESS,
        tokenAName: fromWallet.tokenKey ?? '',
        tokenAStandard: fromWallet.standard ?? '',
        tokenADecimals: fromWallet.decimals ?? COIN_DECIMALS,
        amountADesired: spendedAmount,
        tokenB: toWallet.contractAddress ?? ADDRESSES.EVM_COIN_ADDRESS,
        tokenBDecimals: toWallet.decimals ?? COIN_DECIMALS,
        amountBDesired: receivedAmount,
        owner: fromWallet.address,
        deadlinePeriod: userDeadline * SEC_PER_MINUTE,
      })

      if (result?.transactionHash) {
        const txInfoUrl = transactions.getTxRouter(
          fromWallet.standard ? fromWallet.tokenKey : fromWallet.currency,
          result.transactionHash
        )

        routing.redirectTo(txInfoUrl)
      }
    } catch (error) {
      reportError(error)
    } finally {
      setPending(false)
    }
  }

  // const removeLiquidity = () => {
  //   if (sourceAction === Actions.RemoveLiquidity) {
  //   }
  // }

  const doNotProcess = isProcessBlocking()

  const commonBlockReasons =
    isPending || !!error || insufficientBalance || !spendedAmount || !receivedAmount

  const apiSwapIsAvailable = swapData && !doNotProcess && !commonBlockReasons
  const directSwapIsAvailable = !commonBlockReasons
  const addLiquidityIsAvailable = !commonBlockReasons

  return (
    <div styleName="footer">
      {needApprove ? (
        <Button pending={isPending} disabled={doNotProcess} onClick={approve} brand>
          <FormattedMessage
            id="FormattedMessageIdApprove"
            defaultMessage="Approve {token}"
            values={{ token: spendedCurrency.name }}
          />
        </Button>
      ) : !isSourceMode ? (
        <Button pending={isPending} disabled={!apiSwapIsAvailable} onClick={apiSwap} brand>
          <FormattedMessage id="swap" defaultMessage="Swap" />
        </Button>
      ) : sourceAction === Actions.Swap ? (
        <Button pending={isPending} disabled={!directSwapIsAvailable} onClick={directSwap} brand>
          <FormattedMessage id="swap" defaultMessage="Swap" />
        </Button>
      ) : sourceAction === Actions.AddLiquidity ? (
        <Button
          pending={isPending}
          disabled={!addLiquidityIsAvailable}
          onClick={addLiquidity}
          brand
        >
          <FormattedMessage id="addLiquidity" defaultMessage="Add liquidity" />
        </Button>
      ) : // ) : sourceAction === Actions.RemoveLiquidity ? (
      //   <Button pending={isPending} disabled={} onClick={removeLiquidity}>
      //     <FormattedMessage id="removeLiquidity" defaultMessage="Remove liquidity" />
      //   </Button>
      null}
    </div>
  )
}

export default CSSModules(Footer, styles, { allowMultiple: true })
