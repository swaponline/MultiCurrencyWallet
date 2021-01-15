import React, { Fragment } from 'react'
import CSSModules from 'react-css-modules'
import config from 'app-config'
import styles from './Wallet.scss'
import Button from 'components/controls/Button/Button'
import Row from './Row/Row'
import Slider from './components/WallerSlider'
import Table from 'components/tables/Table/Table'

import { FormattedMessage } from 'react-intl'
import exConfig from 'helpers/externalConfig'

const isWidgetBuild = config && config.isWidget

type CurrenciesListProps = {
  isDark: boolean
  multisigPendingCount: number
  goToСreateWallet: () => void
  hiddenCoinsList: string[]
  tableRows: IUniversalObj[]
}

const CurrenciesList = (props: CurrenciesListProps) => {
  const {
    isDark,
    tableRows,
    hiddenCoinsList,
    goToСreateWallet,
    multisigPendingCount,
  } = props

  return (
    <div styleName={`yourAssets ${isDark ? 'dark' : ''}`}>
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
        rowRender={(row, index, selectId) => (
          <Row
            key={index}
            index={index}
            isDark={isDark}
            currency={row}
            itemData={row}
            hiddenCoinsList={hiddenCoinsList}
            selectId={selectId}
          />
        )}
      />
      <div styleName='addCurrencyBtnWrapper'>
        <Button onClick={goToСreateWallet} blue transparent fullWidth>
          <FormattedMessage id="addAsset" defaultMessage="Add currency" />
        </Button>
      </div>
    </div>
  )
}

export default CSSModules(CurrenciesList, styles, { allowMultiple: true })
