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

function DirectEvmSwap(props) {
  const {
    closeDirectSwap,
    // swapData,
    fromWallet,
    toWallet,
  } = props

  const swapData = {
    sellAmount: 100,
  }
  const [userDeadline, setUserDeadline] = useState(20)

  const changeDeadline = (event) => {
    setUserDeadline(event.target.value)
  }

  const startSwap = async () => {
    const routerAddress = returnRouter('Pancakeswap')

    // testnet
    // WBNB 0xae13d989dac2f0debff460ac112a837c89baa7cd
    // BNG 0x04ad4Ce6015141F6f582A7451Cb7CD6866609298
    // BUSD 0x0755ba6D3e0B799AC7Cd6707AddE7B72208DE08e
    // BNG -> BUSD pair 0x43b7A1514A0456BDF4cF7cDC0c25C613BCbADC2a

    if (routerAddress) {
      const baseCurrency = 'BNB' //fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency

      const hash = await actions.directSwap.swapCallback({
        routerAddress,
        baseCurrency,
        ownerAddress: fromWallet.address,
        swap: swapData,
        fromContract: '0x04ad4Ce6015141F6f582A7451Cb7CD6866609298', //fromWallet.isToken ? fromWallet.contractAddress : EVM_COIN_ADDRESS,
        toContract: '0x0755ba6D3e0B799AC7Cd6707AddE7B72208DE08e', // EVM_COIN_ADDRESS, //toWallet.isToken ? toWallet.contractAddress : EVM_COIN_ADDRESS,
        deadlinePeriod: userDeadline * 60,
      })

      if (hash) {
        actions.notifications.show(constants.notifications.Transaction, {
          link: transactions.getLink(fromWallet.standard, hash),
        })
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
          <FormattedMessage id="transactionDeadline" defaultMessage="Transaction deadline" />
          <input type="number" defaultValue={20} onChange={changeDeadline} />
        </label>

        <Button brand fullWidth onClick={startSwap}>
          <FormattedMessage id="swap" defaultMessage="Swap" />
        </Button>
      </div>
    </section>
  )
}

export default CSSModules(DirectEvmSwap, styles, { allowMultiple: true })
