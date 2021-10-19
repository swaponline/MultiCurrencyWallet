import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './DirectSwap.scss'
import constants from 'common/helpers/constants'
import { externalConfig, transactions, routing } from 'helpers'
import actions from 'redux/actions'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import { Button } from 'components/controls'

const returnRouter = (name) => {
  if (name.match(/pancake/gim)) {
    return externalConfig.swapContract.pancakeRouter
  }
}

function DirectSwap(props) {
  const {
    closeDirectSwap,
    fromWallet,
    toWallet,
    slippage,
    coinDecimals,
    spendedAmount,
    receivedAmount,
  } = props

  const [userDeadline, setUserDeadline] = useState(20) // minutes
  const [userSlippage, setUserSlippage] = useState(slippage)

  const changeDeadline = (event) => {
    setUserDeadline(event.target.value)
  }

  const changeSlippage = (event) => {
    setUserSlippage(event.target.value)
  }

  const startSwap = async () => {
    const routerAddress = returnRouter('Pancakeswap')

    if (routerAddress) {
      const baseCurrency = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency
      const SEC_PER_MINUTE = 60

      // bsc testnet
      const BNG = '0x04ad4Ce6015141F6f582A7451Cb7CD6866609298'
      const LOUD = ''
      const BUSD = ''

      // bsc mainnet
      const BNG_MAINNET = '0x6010e1a66934c4d053e8866acac720c4a093d956'
      const LOUD_MAINNET = '0x3d0e22387ddfe75d1aea9d7108a4392922740b96'

      const hash = await actions.directSwap.swapCallback({
        slippage: userSlippage,
        routerAddress,
        baseCurrency: 'BNB',
        ownerAddress: fromWallet.address,
        fromTokenStandard: 'bep20', //fromWallet.standard || '',
        fromTokenName: '', //fromWallet.tokenKey || '',
        fromToken: constants.ADDRESSES.EVM_COIN_ADDRESS, //fromWallet.isToken ? fromWallet.contractAddress : EVM_COIN_ADDRESS,
        sellAmount: 0, //spendedAmount,
        fromTokenDecimals: 18,// fromWallet.decimals || coinDecimals,
        toToken: LOUD, //toWallet.isToken ? toWallet.contractAddress : EVM_COIN_ADDRESS,
        buyAmount: 0, //receivedAmount,
        toTokenDecimals: 18, //toWallet.decimals || coinDecimals,
        deadlinePeriod: userDeadline * SEC_PER_MINUTE,
      })


      if (hash) {
        const txInfoUrl = transactions.getTxRouter(
          fromWallet.standard ? fromWallet.tokenKey : fromWallet.currency,
          hash
        )

        routing.redirectTo(txInfoUrl)
      }
    }
  }

  return (
    <section styleName="">
      <div styleName="header">
        <h3>
          <FormattedMessage id="directSwap" defaultMessage="Direct swap" />
        </h3>
        <CloseIcon onClick={closeDirectSwap} />
      </div>

      <div styleName="content">
        <label styleName="inputLabel">
          <FormattedMessage
            id="transactionDeadline"
            defaultMessage="Transaction deadline (minutes)"
          />
          <input type="number" defaultValue={userDeadline} onChange={changeDeadline} />
        </label>

        <label styleName="inputLabel">
          <FormattedMessage id="slippageTolerance" defaultMessage="Slippage tolerance (%)" />
          <input type="number" defaultValue={userSlippage} onChange={changeSlippage} />
        </label>

        <Button brand fullWidth onClick={startSwap}>
          <FormattedMessage id="swap" defaultMessage="Swap" />
        </Button>
      </div>
    </section>
  )
}

export default CSSModules(DirectSwap, styles, { allowMultiple: true })
