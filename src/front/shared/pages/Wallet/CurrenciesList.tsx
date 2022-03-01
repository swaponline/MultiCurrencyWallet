import CSSModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'
import {
  constants,
  metamask,
  externalConfig as exConfig,
} from 'helpers'
import actions from 'redux/actions'

import Button from 'components/controls/Button/Button'
import Table from 'components/tables/Table/Table'
import ConnectWalletModal from 'components/modals/ConnectWalletModal/ConnectWalletModal'
import Slider from './WallerSlider'
import Row from './Row/Row'
import styles from './Wallet.scss'

const isWidgetBuild = config && config.isWidget

type CurrenciesListProps = {
  multisigPendingCount: number
  goToСreateWallet: () => void
  hiddenCoinsList: string[]
  tableRows: IUniversalObj[]
}

function CurrenciesList(props: CurrenciesListProps) {
  const {
    tableRows,
    goToСreateWallet,
    multisigPendingCount,
  } = props

  const openAddCustomTokenModal = () => {
    actions.modals.open(constants.modals.AddCustomToken)
  }

  const showAssets = !(config?.opts?.ui?.disableInternalWallet)
    ? true
    : !!(metamask.isConnected())
  return (
    <div styleName="yourAssets">
      {showAssets && (
        <>
          {(exConfig && exConfig.opts && exConfig.opts.showWalletBanners) || isWidgetBuild ? (
            <Slider multisigPendingCount={multisigPendingCount} />
          ) : (
            ''
          )}
          <h3 styleName="yourAssetsHeading">
            <FormattedMessage id="YourAssets" defaultMessage="Your assets" />
          </h3>
          <div styleName="yourAssetsDescr">
            <FormattedMessage
              id="YourAssetsDescription"
              defaultMessage="Here you can safely store, send and receive assets"
            />
          </div>
          <Table
            className={`${styles.walletTable} data-tut-address`}
            rows={tableRows}
            rowRender={(row, index) => (
              <Row
                key={index}
                currency={row}
                itemData={row}
              />
            )}
          />
          <div styleName="addCurrencyBtnWrapper">
            <Button id="addAssetBtn" onClick={goToСreateWallet} transparent fullWidth>
              <FormattedMessage id="addAsset" defaultMessage="Add currency" />
            </Button>
            <Button id="addCustomTokenBtn" onClick={openAddCustomTokenModal} transparent fullWidth>
              <FormattedMessage id="addCustomToken" defaultMessage="Add custom token" />
            </Button>
          </div>
        </>
      )}
      {!showAssets && !metamask.isConnected() && (
        <ConnectWalletModal noCloseButton />
      )}
    </div>
  )
}

export default CSSModules(CurrenciesList, styles, { allowMultiple: true })
