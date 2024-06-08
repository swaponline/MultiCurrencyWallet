import { FormattedMessage } from 'react-intl'
import { useState } from 'react'
import { Modal } from 'components/modal'
import Button from 'components/controls/Button/Button'
import UserInfo from './UserInfo'
import { SwapInfo, SwapData } from './types'

interface Props {
  onSwap: VoidFunction
  onClose: VoidFunction
  history: any,
  isPending: boolean,
  data: SwapData | undefined
}

export default function ReviewSwapModal(props: Props & SwapInfo) {
  const {
    isPending,
    data,
    onSwap,
    onClose,
    history,
    swapFee,
    fiat,
    serviceFee,
    slippage,
    network,
    spendedAmount,
    baseChainWallet,
    fromWallet,
    toWallet,
  } = props

  const [isSwapStarted, setIsSwapStarted] = useState(false)

  const startSwap = () => {
    setIsSwapStarted(true)
    onSwap()
  }

  return (
    <Modal
      name={'Preview swap'}
      title={<FormattedMessage id="previewSwap" defaultMessage="Preview swap" />}
      onClose={onClose}
      showCloseButton
    >
      <div className="swapPreviewWrapper">
        {!isPending && (
          <UserInfo
            history={history}
            isSourceMode={false}
            slippage={slippage}
            network={network}
            swapData={data}
            swapFee={swapFee}
            spendedAmount={spendedAmount}
            baseChainWallet={baseChainWallet}
            fromWallet={fromWallet}
            toWallet={toWallet}
            fiat={fiat}
            serviceFee={serviceFee}
          />
        )}
        {isSwapStarted && (
          <p className="swapInProgressMessage">
            <FormattedMessage id="waitUntilSwapComplete" defaultMessage="Please wait until the swap is complete" />
          </p>
        )}
        <Button pending={isPending} disabled={isPending} onClick={startSwap} brand fullWidth>
          <FormattedMessage id="swap" defaultMessage="Swap" />
        </Button>
      </div>
    </Modal>
  )
}
