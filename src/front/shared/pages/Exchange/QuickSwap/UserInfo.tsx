import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { isMobile } from 'react-device-detect'
import { BigNumber } from 'bignumber.js'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import commonUtils from 'common/utils'
import { AddressFormat, AddressType } from 'domain/address'
import { metamask, links, constants, localStorage, utils } from 'helpers'
import actions from 'redux/actions'
import { Network, SwapData } from './types'
import Address from 'components/ui/Address/Address'
import Copy from 'components/ui/Copy/Copy'
import Button from 'components/controls/Button/Button'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

type ComponentProps = {
  history: any
  slippage: number
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

function UserInfo(props: ComponentProps) {
  const {
    history,
    slippage,
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

  const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
  const [mnemonicSaved, setMnemonicSaved] = useState(mnemonic === '-')

  const isWalletCreated = localStorage.getItem(constants.localStorage.isWalletCreate)
  const saveSecretPhrase = !mnemonicSaved && !metamask.isConnected()

  const saveMnemonic = () => {
    actions.modals.open(constants.modals.SaveMnemonicModal, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

        setMnemonicSaved(mnemonic === '-')
      },
    })
  }

  const createWallet = () => {
    const walletName = fromWallet.tokenKey || fromWallet.currency

    history.push(`${links.createWallet}/${walletName.toUpperCase()}`)
  }

  const connectWallet = () => {
    metamask.connect({ dontRedirect: true })
  }

  let fee: string | undefined = undefined
  let total: string | undefined = undefined
  let fiatFee: string | undefined = undefined
  let totalFiat: string | undefined = undefined
  let price: string | undefined = undefined

  if (swapData) {
    const { sellAmount, buyAmount } = swapData

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

    // don't show total amount for tokens. Show only transaction fee
    if (!fromWallet.isToken) {
      total = `${totalAmount} ${network.currency}`
    }

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
    <section styleName="userInfo">
      {!metamask.isConnected() && (!isWalletCreated || !mnemonicSaved) && (
        <Button
          id="connectWalletBtn"
          brand
          fullWidth
          styleName="connectWalletBtn"
          onClick={connectWallet}
        >
          <FormattedMessage id="Exchange_ConnectAddressOption" defaultMessage="Connect Wallet" />
        </Button>
      )}
      {!isWalletCreated ? (
        <Button id="createWalletBtn" gray fullWidth onClick={createWallet}>
          <FormattedMessage id="menu.CreateWallet" defaultMessage="Create wallet" />
        </Button>
      ) : saveSecretPhrase ? (
        <Button id="saveSecretPhraseBtn" gray fullWidth onClick={saveMnemonic}>
          <FormattedMessage id="BTCMS_SaveMnemonicButton" defaultMessage="Save secret phrase" />
        </Button>
      ) : (
        <span styleName="indicator">
          <FormattedMessage id="addressOfYourWallet" defaultMessage="Address of your wallet:" />

          <Copy text={fromWallet.address}>
            <span styleName="address">
              <Address
                address={fromWallet.address}
                format={isMobile ? AddressFormat.Short : AddressFormat.Full}
                type={metamask.isConnected() ? AddressType.Metamask : AddressType.Internal}
              />
            </span>
          </Copy>
        </span>
      )}

      <span styleName="indicator">
        <FormattedMessage id="network" defaultMessage="Network" />: <span>{network.chainName}</span>
      </span>

      <span styleName="indicator">
        <FormattedMessage id="slippageTolerance" defaultMessage="Slippage tolerance" />:
        <span>{`${slippage} %`}</span>
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
          {swapFee && fee && (
            <span styleName="indicator">
              <FormattedMessage id="fee" defaultMessage="Fee" />: <span>{fee}</span>
              {fiatFee && <span>{fiatFee}</span>}
            </span>
          )}
          {total && spendedAmount && swapFee && (
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

export default CSSModules(UserInfo, styles, { allowMultiple: true })
