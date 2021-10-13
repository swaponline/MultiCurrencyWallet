import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import externalConfig from 'helpers/externalConfig'
import actions from 'redux/actions'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import { Button } from 'components/controls'

const returnRouter = (name) => {
  if (name.match(/pancake/i)) {
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

  const swapData = {}

  const startSwap = async () => {
    const routerAddress = returnRouter('')

    if (routerAddress) {
      const baseCurrency = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency

      actions.directSwap.swapCallback({})
    }
  }

  return (
    <section styleName="">
      <div styleName="header">
        <h3>
          <FormattedMessage id="randomId1" defaultMessage="Title" />
        </h3>
        <CloseIcon onClick={closeDirectSwap} />
      </div>

      <div>
        <label htmlFor="">Transaction deadline</label>
        <input type="number" defaultValue={20} />

        <Button brand fullWidth onClick={startSwap}>
          <FormattedMessage id="randomId2" defaultMessage="Swap" />
        </Button>
      </div>
    </section>
  )
}

export default CSSModules(DirectEvmSwap, styles, { allowMultiple: true })
