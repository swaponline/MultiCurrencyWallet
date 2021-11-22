import React, { Fragment } from 'react'
import CSSModules from 'react-css-modules'
import config from 'app-config'
import metamask from 'helpers/metamask'
import styles from './Wallet.scss'
import Button from 'components/controls/Button/Button'
import Row from './Row/Row'
import Slider from './WallerSlider'
import Table from 'components/tables/Table/Table'

import { FormattedMessage } from 'react-intl'
import exConfig from 'helpers/externalConfig'
import ConnectWalletModal from 'components/modals/ConnectWalletModal/ConnectWalletModal'


const isWidgetBuild = config && config.isWidget

type CurrenciesListProps = {
  multisigPendingCount: number
  goToСreateWallet: () => void
  hiddenCoinsList: string[]
  tableRows: IUniversalObj[]
}

const CurrenciesList = (props: CurrenciesListProps) => {
  const {
    tableRows,
    goToСreateWallet,
    multisigPendingCount,
  } = props

  const showAssets = !(config?.opts?.ui?.disableInternalWallet)
    ? true
    : (metamask.isConnected()) ? true : false
  return (
    <div styleName="yourAssets">
      {showAssets && (
        <>
          {(exConfig && exConfig.opts && exConfig.opts.showWalletBanners) || isWidgetBuild ? (
            <Fragment>
              <Slider multisigPendingCount={multisigPendingCount} />
            </Fragment>
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
          <div styleName='addCurrencyBtnWrapper'>
            <Button id="addAssetBtn" onClick={goToСreateWallet} transparent fullWidth>
              <FormattedMessage id="addAsset" defaultMessage="Add currency" />
            </Button>
          </div>
        </>
      )}
      {!showAssets && !metamask.isConnected() && (
        <>
          <ConnectWalletModal noCloseButton={true}></ConnectWalletModal>
        </>
      )}
    </div>
  )
}

export default CSSModules(CurrenciesList, styles, { allowMultiple: true })
