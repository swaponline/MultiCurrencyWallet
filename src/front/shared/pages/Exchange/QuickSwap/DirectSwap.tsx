import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './DirectSwap.scss'
import { EVM_COIN_ADDRESS } from 'common/helpers/constants'
import { externalConfig, transactions, constants } from 'helpers'
import actions from 'redux/actions'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import { Button } from 'components/controls'

const returnRouter = (name) => {
  if (name.match(/pancake/gim)) {
    return externalConfig.swapContract.pancakeRouter
  }
}

function DirectSwap(props) {
  const { closeDirectSwap, swapData, fromWallet, toWallet, slippage } = props

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
      // const { sellAmount, buyAmount } = swapData
      const baseCurrency = 'BNB' //fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency

      // bsc testnet
      const BUSD = '0x0755ba6D3e0B799AC7Cd6707AddE7B72208DE08e'
      const WEENUS = '0x703f112Bda4Cc6cb9c5FB4B2e6140f6D8374F10b'
      const WBNB = '0xae13d989dac2f0debff460ac112a837c89baa7cd'
      const LTK = '0x1272aa564b9fde598c0c71bc20e84703ce56b38d'

      // rinkeby
      const WETH = '0xc778417e063141139fce010982780140aa0cd5ab'
      const ETH_FACTORY = '0x4E629F691C4AdeD5376e7573A8AEA8c8a5ef8831'
      const ETH_ROUTER = '0x90357d4291D65e61f0b0a3FD50048126D10a7DbD'

      const hash = await actions.directSwap.swapCallback({
        slippage: 2,
        routerAddress,
        baseCurrency,
        ownerAddress: fromWallet.address,
        fromTokenStandard: 'bep20', //fromWallet.standard || '',
        fromTokenName: '{bnb}wbnb', // fromWallet.tokenKey || '',
        fromToken: WBNB, //fromWallet.isToken ? fromWallet.contractAddress : EVM_COIN_ADDRESS,
        sellAmount: 0.0001,
        fromTokenDecimals: 18,
        toToken: LTK, //toWallet.isToken ? toWallet.contractAddress : EVM_COIN_ADDRESS,
        buyAmount: 9.87158,
        toTokenDecimals: 18,
        deadlinePeriod: userDeadline * 60,
      })

      console.log('hash: ', hash)

      // if (hash) {
      //   actions.notifications.show(constants.notifications.Transaction, {
      //     link: transactions.getLink(fromWallet.standard, hash),
      //   })
      // }
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
