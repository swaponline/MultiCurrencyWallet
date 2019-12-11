import React from 'react'


import CSSModules from 'react-css-modules'
import styles from './Wallet.scss'
import NewButton from 'components/controls/NewButton/NewButton'
import Row from './Row/Row'
import Table from 'components/tables/Table/Table'


const CurrenciesList = ({ activeView, isFetching, tableRows, currencies, infoAboutCurrency, hiddenCoinsList, goToСreateWallet }) => (
  <div styleName={`yourAssets ${activeView === 0 ? 'active' : ''}`}>
    <h3 styleName="yourAssetsHeading">Your Assets</h3>
    <p styleName="yourAssetsDescr">Here you can safely store and promptly exchange Bitcoin, Ethereum, <br /> EOS, USD, Tether, BCH, and numerous ERC-20 tokens</p>
    {isFetching && <Table
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
          hiddenCoinsList={hiddenCoinsList}
          selectId={selectId}
          handleSelectId={handleSelectId}
        />
      )}
    />}
    <NewButton onClick={goToСreateWallet} blue transparent fullWidth>
      Add Asset
    </NewButton>
  </div>
)

export default CSSModules(CurrenciesList, styles, { allowMultiple: true })
