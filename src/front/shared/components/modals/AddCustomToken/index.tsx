import React, { Fragment } from 'react'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import cssModules from 'react-css-modules'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import axios from 'axios'

import typeforce from 'swap.app/util/typeforce'
import TOKEN_STANDARDS, { TokenStandard } from 'helpers/constants/TOKEN_STANDARDS'
import config from 'helpers/externalConfig'

import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import DropDown from 'components/ui/DropDown'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import dropDownStyles from 'components/ui/DropDown/index.scss'
import ownStyle from './index.scss'
import styles from '../Styles/default.scss'

const { curEnabled } = config.opts

const TOKEN_STANDARDS_ARR: TokenStandard[] = []

Object.keys(TOKEN_STANDARDS).forEach(standard => {
  const standardConfig: TokenStandard = TOKEN_STANDARDS[standard]
  const { currency: standardBlockchain } = standardConfig

  const isStandardEnabled = !!config[standard]
  const isStandardBlockchainEnabled = curEnabled[standardBlockchain]

  if (isStandardEnabled && isStandardBlockchainEnabled) {
    TOKEN_STANDARDS_ARR.push(standardConfig)
  }

})

type CustomTokenProps = {
  name: string
  style: IUniversalObj
  intl: IUniversalObj
  data: {
    api: string
    apiKey: string
    standard: string
    baseCurrency: string
  }
}

type CustomTokenState = {
  step: string
  tokenStandard: string
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  tokenDecimals: number
  baseCurrency: string
  notFound: boolean
  isPending: boolean
  addTokenMode: 'byAddress' | 'bySearch'
  searchQuery: string
  assetsList: IUniversalObj[]
  isAssetsListLoading: boolean
  selectedAsset: IUniversalObj | null
}

@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
class AddCustomToken extends React.Component<CustomTokenProps, CustomTokenState> {
  constructor(props) {
    super(props)

    const { data } = props

    let tokenStandard = data?.standard?.toLowerCase()
    let baseCurrency = data?.baseCurrency

    if (baseCurrency && !tokenStandard) {
      tokenStandard = TOKEN_STANDARDS_ARR.find((standard => standard.currency === baseCurrency))?.standard
    }

    if (!baseCurrency || !tokenStandard) {
      tokenStandard = TOKEN_STANDARDS_ARR[0]?.standard
      baseCurrency = TOKEN_STANDARDS_ARR[0]?.currency
    }

    this.state = {
      step: 'enterAddress',
      tokenStandard,
      baseCurrency,
      tokenAddress: '',
      tokenName: '',
      tokenSymbol: '',
      tokenDecimals: 0,
      notFound: false,
      isPending: false,
      addTokenMode: 'byAddress',
      searchQuery: '',
      assetsList: [],
      isAssetsListLoading: false,
      selectedAsset: null,
    }
  }

  handleSubmit = async () => {
    const { tokenAddress, tokenStandard } = this.state

    this.setState(() => ({ isPending: true }))

    const info = await actions[tokenStandard].getInfoAboutToken(tokenAddress)

    if (info) {
      const { name, symbol, decimals } = info

      this.setState(() => ({
        tokenName: name,
        tokenSymbol: symbol,
        tokenDecimals: decimals,
        step: 'confirm',
      }))
    } else {
      this.setState(() => ({
        notFound: true,
      }))

      setTimeout(() => {
        this.setState(() => ({
          notFound: false,
        }))
      }, 4000)
    }

    this.setState(() => ({ isPending: false }))
  }

  handleConfirm = async () => {
    const { tokenStandard, tokenAddress, tokenSymbol, tokenDecimals, baseCurrency } = this.state
    actions[tokenStandard].addToken({
      standard: tokenStandard,
      contractAddr: tokenAddress,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      baseCurrency: baseCurrency.toLowerCase(),
    })
    const tokenValue = `{${baseCurrency.toUpperCase()}}${tokenSymbol.toUpperCase()}`
    actions.core.markCoinAsVisible(tokenValue, true)

    this.setState({
      step: 'ready',
    })
  }

  handleReady = async () => {
    window.location.reload()
  }

  addressIsCorrect() {
    const { tokenAddress, baseCurrency } = this.state

    return typeforce.isCoinAddress[baseCurrency.toUpperCase()](tokenAddress)
  }

  async getAssetsList(searchQuery: string) {
    const coinGeckoSearchLink = 'https://api.coingecko.com/api/v3/search'
    try {
      this.setState({ isAssetsListLoading: true })
      const result = await axios.get(`${coinGeckoSearchLink}?query=${searchQuery}`)
      return result.data?.coins
    } catch (error) {
      console.log('error', error)
      return []
    } finally {
      this.setState({ isAssetsListLoading: false })
    }
  }

  setAssetsList = (assetsList: IUniversalObj[]) => this.setState(() => ({ assetsList }))

  setAsset = (asset: any) => this.setState(() => ({ selectedAsset: asset }))

  resetSearchData = () => this.setState(() => ({ selectedAsset: null, searchQuery: '', assetsList: [] }))

  async getTokenPlatforms(tokenId: string) {
    const coinGeckoAssetsLink = 'https://api.coingecko.com/api/v3/coins'
    try {
      const result = await axios.get(`${coinGeckoAssetsLink}/${tokenId}`)
      return result.data?.platforms
    } catch (error) {
      console.log('error', error)
      return []
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    const {
      searchQuery: prevSearchQuery,
      assetsList: prevAssetsList,
    } = prevState

    const {
      searchQuery,
      isAssetsListLoading,
    } = this.state

    const hasNotAssetsInSimilarPrevSearchQuery = searchQuery?.length === 1 || !(
      searchQuery?.length > 1
      && searchQuery.match(prevSearchQuery)?.index === 0
      && prevAssetsList?.length === 0
    )

    if (
      searchQuery?.length > 0
      && document.activeElement?.id === 'searchQueryInput'
      && prevSearchQuery !== searchQuery
      && hasNotAssetsInSimilarPrevSearchQuery
      && !isAssetsListLoading
    ) {
      const assetsList = await this.getAssetsList(searchQuery) as IUniversalObj[]
      this.setAssetsList(assetsList)
    }
  }

  render() {
    const {
      step,
      tokenStandard,
      tokenAddress,
      tokenName,
      tokenSymbol,
      tokenDecimals,
      isPending,
      notFound,
      addTokenMode,
      searchQuery,
      assetsList,
      isAssetsListLoading,
      selectedAsset,
    } = this.state

    const {
      name,
      intl,
    } = this.props

    const linked = Link.all(this, 'tokenAddress', 'searchQuery')

    const isDisabled = !tokenAddress || isPending || !this.addressIsCorrect()

    const localeLabel = defineMessages({
      title: {
        id: 'customERC20_Title',
        defaultMessage: 'Add a new token',
      },
      addressPlaceholder: {
        id: 'customERC20_addressPlaceholder',
        defaultMessage: 'Enter token address',
      },
      searchPlaceholder: {
        id: 'customERC20_searchPlaceholder',
        defaultMessage: 'Enter token name or symbol',
      },
    })

    const selectAddByAddress = () => {
      this.setState({
        addTokenMode: 'byAddress',
      })
    }

    const selectAddBySearch = () => {
      this.setState({
        addTokenMode: 'bySearch',
      })
    }

    return (
      <Modal
        name={name}
        title={`${intl.formatMessage(localeLabel.title)}`}
        contentWithTabs
        showCloseButton
      >
        <div styleName="stepsWrapper">
          <div styleName="tabsWrapper">
            <button
              type="button"
              styleName={`tab ${addTokenMode === 'byAddress' ? 'active' : ''}`}
              onClick={selectAddByAddress}
            >
              <FormattedMessage id="addByAddress" defaultMessage="by Address" />
            </button>
            <button
              type="button"
              styleName={`tab ${addTokenMode === 'bySearch' ? 'active' : ''}`}
              onClick={selectAddBySearch}
            >
              <FormattedMessage id="addBySearch" defaultMessage="by Search" />
            </button>
          </div>
          {step === 'enterAddress' && (
            <>
              {addTokenMode === 'byAddress' ? (
                <div styleName="highLevel">
                  <FieldLabel inRow>
                    <span style={{ fontSize: '16px' }}>
                      <FormattedMessage
                        id="customTokenAddress"
                        defaultMessage="Token address"
                      />
                    </span>
                  </FieldLabel>
                  <Input
                    id="customTokenInput"
                    valueLink={linked.tokenAddress}
                    focusOnInit
                    pattern="0-9a-zA-Z:"
                    placeholder={intl.formatMessage(localeLabel.addressPlaceholder)}
                  />
                  <DropDown
                    className={dropDownStyles.simpleDropdown}
                    items={TOKEN_STANDARDS_ARR}
                    selectedValue={TOKEN_STANDARDS[tokenStandard].value}
                    selectedItemRender={(item) => item.value.toUpperCase()}
                    itemRender={(item) => item.value.toUpperCase()}
                    onSelect={(item) => {
                      this.setState({
                        tokenStandard: item.standard,
                        baseCurrency: item.currency,
                      })
                    }}
                    name="Select a standard"
                    role="SelectStandard"
                  />
                  {notFound && (
                    <div styleName="rednote">
                      <FormattedMessage
                        id="customTokenNotFound"
                        defaultMessage="This is not {standard} address"
                        values={{
                          standard: tokenStandard,
                        }}
                      />
                    </div>
                  )}
                  {tokenAddress && !this.addressIsCorrect() && (
                    <div styleName="rednote">
                      <FormattedMessage
                        id="customTokenIncorrectAddress"
                        defaultMessage="Invalid address"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div styleName="highLevel">
                  {selectedAsset ? (
                    <div styleName="lowLevel">
                      <FieldLabel inRow>
                        <span styleName="title">
                          <FormattedMessage id="selectedToken" defaultMessage="Token" />
                        </span>
                      </FieldLabel>
                      <div styleName="fakeInput">
                        {selectedAsset.thumb && <span><img src={selectedAsset.thumb} alt={selectedAsset.id} /></span>}
                        <span>{` ${selectedAsset.name} (${selectedAsset.symbol})`}</span>
                      </div>
                      <div styleName="closeIconWrapper">
                        <CloseIcon onClick={this.resetSearchData} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <FieldLabel inRow>
                        <span style={{ fontSize: '16px' }}>
                          <FormattedMessage
                            id="Search"
                            defaultMessage="Search"
                          />
                        </span>
                      </FieldLabel>
                      <Input
                        id="searchQueryInput"
                        valueLink={linked.searchQuery}
                        focusOnInit
                        placeholder={intl.formatMessage(localeLabel.searchPlaceholder)}
                      />
                      {
                        document.activeElement?.id === 'searchQueryInput'
                        && searchQuery?.length > 0
                        && (
                          <>
                            <div styleName="closeIconWrapper">
                              <CloseIcon onClick={this.resetSearchData} />
                            </div>
                            <div style={{ padding: '1rem' }}>
                              {isAssetsListLoading
                                ? 'Loading...'
                                : assetsList?.length > 0
                                  ? (
                                    <div styleName="assetsList">
                                      {assetsList.map((assetInfo, i) => (
                                        <button
                                          styleName="asset"
                                          key={i}
                                          onClick={() => this.setAsset(assetInfo)}
                                          type="button"
                                        >
                                          {assetInfo?.thumb && <span><img src={assetInfo.thumb} alt={assetInfo.id} /></span>}
                                          <span>{` ${assetInfo.name} (${assetInfo.symbol})`}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )
                                  : `No result for ${searchQuery}`}
                            </div>
                          </>
                        )
                      }
                    </>
                  )}
                </div>
              )}
              <Button
                id="customTokenNextButton"
                styleName="buttonFullMargin"
                brand
                fullWidth
                disabled={isDisabled}
                onClick={this.handleSubmit}
                pending={isPending}
              >
                <FormattedMessage id="NextId" defaultMessage="Nеxt" />
              </Button>
            </>
          )}
          {step === 'confirm' && (
            <>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage
                      id="customTokenAddress"
                      defaultMessage="Token address"
                    />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenAddress}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage id="TitleId" defaultMessage="Title" />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenName}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage id="SymbolId" defaultMessage="Symbol" />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenSymbol}</div>
              </div>
              <div styleName="lowLevel">
                <FieldLabel inRow>
                  <span styleName="title">
                    <FormattedMessage id="DecimalsId" defaultMessage="Decimals" />
                  </span>
                </FieldLabel>
                <div styleName="fakeInput">{tokenDecimals}</div>
              </div>
              <Button
                id="customTokenAddButton"
                styleName="buttonFullMargin"
                brand
                fullWidth
                disabled={isDisabled}
                onClick={this.handleConfirm}
                pending={isPending}
              >
                <FormattedMessage
                  id="customTokenConfirm"
                  defaultMessage="Add this token"
                />
              </Button>
            </>
          )}
          {step === 'ready' && (
            <>
              <h4 styleName="readyTitle">
                <FormattedMessage
                  id="customTokenAdded"
                  defaultMessage="Token added successfully"
                />
              </h4>
              <Button
                id="customTokenDoneButton"
                styleName="buttonFullMargin"
                brand
                fullWidth
                disabled={isDisabled}
                onClick={this.handleReady}
              >
                <FormattedMessage id="SweepBannerButton" defaultMessage="Done" />
              </Button>
            </>
          )}
        </div>
      </Modal>
    )
  }
}

export default injectIntl(AddCustomToken)
