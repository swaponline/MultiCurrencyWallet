import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './DirectSwap.scss'
import { EVM_COIN_ADDRESS } from 'common/helpers/constants'
import { externalConfig, transactions, constants, routing } from 'helpers'
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

      console.log('%c DirectSwap', 'color:brown;font-size:20px')

      // bsc testnet
      const BUSD = '0x0755ba6D3e0B799AC7Cd6707AddE7B72208DE08e'
      const WEENUS = '0x703f112Bda4Cc6cb9c5FB4B2e6140f6D8374F10b'
      const WBNB = '0xae13d989dac2f0debff460ac112a837c89baa7cd'
      const LTK = '0x1272aa564b9fde598c0c71bc20e84703ce56b38d'

      const BNG = '0x04ad4ce6015141f6f582a7451cb7cd6866609298'
      const LOUD = ''

      // bsc mainnet
      const BNG_MAINNET = '0x6010e1a66934c4d053e8866acac720c4a093d956'
      const LOUD_MAINNET = '0x3d0e22387ddfe75d1aea9d7108a4392922740b96'
      const WBNB_MAINNET = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
      const BUSD_MAINNET = '0xe9e7cea3dedca5984780bafc599bd69add087d56'

      const hash = await actions.directSwap.swapCallback({
        slippage: userSlippage,
        routerAddress,
        baseCurrency,
        ownerAddress: fromWallet.address,
        fromTokenStandard: fromWallet.standard || '',
        fromTokenName: fromWallet.tokenKey || '',
        fromToken: fromWallet.isToken ? fromWallet.contractAddress : EVM_COIN_ADDRESS,
        sellAmount: spendedAmount,
        fromTokenDecimals: fromWallet.decimals || coinDecimals,
        toToken: toWallet.isToken ? toWallet.contractAddress : EVM_COIN_ADDRESS,
        buyAmount: receivedAmount,
        toTokenDecimals: toWallet.decimals || coinDecimals,
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
