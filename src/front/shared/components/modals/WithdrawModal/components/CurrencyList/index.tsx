import { Component } from 'react'
import cssModules from 'react-css-modules'
import styles from './index.scss'
import cx from 'classnames'
import PartOfAddress from 'pages/Wallet/PartOfAddress'
import { isMobile } from 'react-device-detect'
import { user, utils } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import getCurrencyKey from 'helpers/getCurrencyKey'
import Coin from 'components/Coin/Coin'
import OutsideClick from 'components/OutsideClick'

@cssModules(styles, { allowMultiple: true })
export default class CurrencyList extends Component<any, any> {
  constructor(props) {
    super(props)

    this.state = {
      isAssetsOpen: false,
    }
  }

  openModal = (params) => {
    const { target } = params
    let { currency, address, tokenKey } = target

    this.setState({
      isAssetsOpen: false,
    }, () => {
      const {
        history,
        intl: { locale },
      } = this.props

      switch (currency.toLowerCase()) {
        case 'btc (multisig)':
        case 'btc (pin-protected)':
          currency = 'btc'
      }

      const newPathName = `${tokenKey ? `/token/${tokenKey}` : `/${currency}`}/${address}/send`
      // `

      if (history.location.pathname !== newPathName) {
        history.push(
          localisedUrl(locale, newPathName)
        )
      }
    })
  }

  closeList = () => {
    this.setState(() => ({
      isAssetsOpen: false,
    }))
  }

  toggleListDisplay = () => {
    this.setState((state) => ({
      isAssetsOpen: !state.isAssetsOpen,
    }))
  }

  returnFiatBalance = (cryptoBalance, rate) => {
    return utils.toMeaningfulFloatValue({
      value: cryptoBalance,
      rate,
    })
  }

  render() {
    const {
      selectedCurrency,
      currentBalance,
      currency,
      activeFiat,
      tableRows,
      currentAddress,
    } = this.props

    const {
      isAssetsOpen,
    } = this.state

    const standard = selectedCurrency.itemCurrency?.standard
    const fiatBalance = selectedCurrency?.infoAboutCurrency?.price_fiat
      ? this.returnFiatBalance(currentBalance, selectedCurrency.infoAboutCurrency.price_fiat)
      : false

    return (
      <OutsideClick outsideAction={this.closeList}>
        <div
          id='withdrawCurrencyList'
          styleName="customSelectValue"
          onClick={this.toggleListDisplay}
        >
          <div styleName="coin">
            <Coin name={selectedCurrency.currency} />
          </div>

          <div>
            <a>
              {selectedCurrency.currency}
              {standard && <span styleName="tokenStandard">{standard.toUpperCase()}</span>}
            </a>
            <span styleName="address">{currentAddress}</span>
            <span styleName="mobileAddress">
              {isMobile ? <PartOfAddress address={currentAddress} withoutLink /> : ''}
            </span>
          </div>

          <div styleName="amount">
            <>
              {utils.toMeaningfulFloatValue({
                value: currentBalance,
                meaningfulDecimals: 5,
              })}{' '}
              {getCurrencyKey(currency, true).toUpperCase()}
            </>
            {/* save the element anyway for UI paddings */}
            <span styleName="usd">
              {fiatBalance && (
                <>
                  {fiatBalance} {activeFiat}
                </>
              )}
            </span>
          </div>
          <div styleName={cx('customSelectArrow', { active: isAssetsOpen })}></div>
        </div>

        {isAssetsOpen && (
          <div styleName="customSelectList">
            {tableRows.map((item, index) => {
              if (!user.isCorrectWalletToShow(item)) return
              
              const {
                baseCurrency,
                currency,
                balance,
                balanceError,
                fullName,
                standard,
                address,
                infoAboutCurrency,
                isToken,
              } = item
              const coinView = (isToken) ? getCurrencyKey(currency, true).replaceAll(`*`,``).toUpperCase() : getCurrencyKey(currency, true).toUpperCase()

              const itemFiatBalance = infoAboutCurrency?.price_fiat
                ? this.returnFiatBalance(balance, infoAboutCurrency?.price_fiat)
                : false

              const itemId = `${
                baseCurrency ? baseCurrency.toLowerCase() : ''
              }${currency.toLowerCase()}`

              return (
                <div id={`${itemId}Send`} key={index}
                  styleName={cx('customSelectListItem customSelectValue', {
                    disabled: !balance || balanceError,
                  })}
                  onClick={() => this.openModal({ target: item })}
                >
                  <Coin name={item.currency} />

                  <div>
                    <a>
                      {fullName}
                      {standard && <span styleName="tokenStandard">{standard.toUpperCase()}</span>}
                    </a>
                    <span styleName="address">{address}</span>
                    <span styleName="mobileAddress">
                      {isMobile ? <PartOfAddress address={address} withoutLink /> : ''}
                    </span>
                  </div>
   
                  <div styleName="amount">
                    <span>
                      <span id={`${itemId}CryptoBalance`}>
                        {!balanceError
                          ? utils.toMeaningfulFloatValue({
                              value: balance,
                              meaningfulDecimals: 5,
                            })
                          : '-'}
                      </span>{' '}
                      {coinView}
                    </span>
                    {/* save the element anyway for UI paddings */}
                    <span styleName="usd">
                      {itemFiatBalance && (
                        <>
                          {itemFiatBalance} {activeFiat}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </OutsideClick>
    )
  }
}

