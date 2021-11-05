import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import utils from 'common/utils'
import ADDRESSES from 'common/helpers/constants/ADDRESSES'
import actions from 'redux/actions'
import { feedback, externalConfig, constants, transactions, routing } from 'helpers'
import { ComponentState, BlockReasons, Actions } from './types'
import { GWEI_DECIMALS, ROUTERS, SEC_PER_MINUTE } from './constants'
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
  fetchSwapData: () => void
  setPending: (a: boolean) => void
  setNeedApprove: (a: boolean) => void
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
    fetchSwapData,
    setPending,
    setNeedApprove,
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
    coinDecimals,
    receivedAmount,
    userDeadline,
    error,
    slippage,
    liquidityErrorMessage,
  } = parentState

  const [routerAddress, setRouterAddress] = useState<string>(ROUTERS[network.networkVersion])

  useEffect(() => {
    setRouterAddress(ROUTERS[network.networkVersion])
    console.log('%c network update', 'color:green;')
    console.log('network: ', network)
    console.log('new routerAddress: ', routerAddress)
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

      await fetchSwapData()
    } catch (error) {
      reportError(error)
    }
  }

  const swapWithAPI = async () => {
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
    const baseCurrency = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency

    console.log('%c direct swap', 'color:orange;')
    console.log('props: ', props)

    setPending(true)

    try {
      const result = await actions.uniswapRouter.swapCallback({
        slippage,
        routerAddress,
        baseCurrency,
        ownerAddress: fromWallet.address,
        fromTokenStandard: fromWallet.standard ?? '',
        fromTokenName: fromWallet.tokenKey ?? '',
        fromToken: fromWallet.isToken ? fromWallet.contractAddress : ADDRESSES.EVM_COIN_ADDRESS,
        sellAmount: spendedAmount,
        fromTokenDecimals: fromWallet.decimals || coinDecimals,
        toToken: toWallet.isToken ? toWallet.contractAddress : ADDRESSES.EVM_COIN_ADDRESS,
        buyAmount: receivedAmount,
        toTokenDecimals: toWallet.decimals || coinDecimals,
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
      setPending(false)
      reportError(error)
    }
  }

  const addLiquidity = () => {
    if (sourceAction === Actions.AddLiquidity) {
    }
  }
  const removeLiquidity = () => {
    if (sourceAction === Actions.RemoveLiquidity) {
    }
  }

  const isSwapNotAvailable = () => {
    return !swapData || isPending || !!error
  }

  const handleSwap = () => {
    if (isSourceMode && sourceAction === Actions.Swap) {
      directSwap()
    } else if (swapData) {
      swapWithAPI()
    }
  }

  const doNotProcess = isProcessBlocking()
  const swapBtnIsDisabled = isSwapNotAvailable() || doNotProcess || insufficientBalance

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
      ) : (
        <Button pending={isPending} disabled={swapBtnIsDisabled} onClick={handleSwap} brand>
          <FormattedMessage id="swap" defaultMessage="Swap" />
        </Button>
      )}

      {/*
        <Button pending={isPending} disabled={} onClick={addLiquidity} brand>
          <FormattedMessage id="addLiquidity" defaultMessage="Add liquidity" />
        </Button>

        <Button pending={isPending} disabled={} onClick={removeLiquidity}>
          <FormattedMessage id="removeLiquidity" defaultMessage="Remove liquidity" />
        </Button>
      */}
    </div>
  )
}

export default CSSModules(Footer, styles, { allowMultiple: true })
