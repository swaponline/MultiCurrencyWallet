import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Wallet.scss'
import Button from 'components/controls/Button/Button'
import Row from './Row/Row'
import Table from 'components/tables/Table/Table'
import config from 'app-config'
import { FormattedMessage } from 'react-intl'


const CurrenciesList = ({ tableRows, currencies, infoAboutCurrency, hiddenCoinsList, goToСreateWallet, getExCurrencyRate }) => (
  <div styleName="yourAssets">
    <h3 styleName="yourAssetsHeading">
      <FormattedMessage id="YourAssets" defaultMessage="Ваши валюты" />
    </h3>
    <p styleName="yourAssetsDescr">
      <FormattedMessage
        id="YourAssetsDescription"
        defaultMessage="Здесь вы можете безопасно хранить и быстро обменивать Bitcoin, Ethereum, {br} USD, Tether, BCH и многочисленные токены ERC-20."
        values={{ br: <br /> }}
      />
    </p>
    <Table
      className={`${styles.walletTable} data-tut-address`}
      rows={tableRows}
      rowRender={(row, index, selectId, handleSelectId) => (
        <Row
          key={row.currency}
          index={index}
          getCurrencyUsd={(usd) => this.getCurrencyUsd(usd)}
          currency={row}
          currencies={currencies}
          infoAboutCurrency={infoAboutCurrency}
          getExCurrencyRate={(currencySymbol, rate) => getExCurrencyRate(currencySymbol, rate)}
          hiddenCoinsList={hiddenCoinsList}
          selectId={selectId}
          handleSelectId={handleSelectId}
        />
      )}
    />
    {!(config && config.isWidget) &&
      <Button onClick={goToСreateWallet} blue transparent fullWidth>
        <FormattedMessage id="addAsset" defaultMessage="Добавить валюту" />
      </Button>
    }
  </div>
)

export default CSSModules(CurrenciesList, styles, { allowMultiple: true })
