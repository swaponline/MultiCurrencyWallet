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

      const BUSD = '0x0755ba6D3e0B799AC7Cd6707AddE7B72208DE08e'
      const WEENUS = '0x703f112Bda4Cc6cb9c5FB4B2e6140f6D8374F10b'

      const hash = await actions.directSwap.swapCallback({
        slippage,
        routerAddress,
        baseCurrency,
        ownerAddress: fromWallet.address,
        fromTokenStandard: 'bep20', //fromWallet.standard || '',
        fromTokenName: '{bnb}busd',// fromWallet.tokenKey || '',
        fromToken: BUSD, //fromWallet.isToken ? fromWallet.contractAddress : EVM_COIN_ADDRESS,
        sellAmount: 1,
        fromTokenDecimals: 18,
        toToken: WEENUS, // EVM_COIN_ADDRESS, //toWallet.isToken ? toWallet.contractAddress : EVM_COIN_ADDRESS,
        buyAmount: 19.3564,
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
