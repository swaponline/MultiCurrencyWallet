import React, { Fragment } from 'react'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import cssModules from 'react-css-modules'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import axios from 'axios'

import typeforce from 'swap.app/util/typeforce'
import TOKEN_STANDARDS, {
  EXISTING_STANDARDS,
  TokenStandard,
} from 'helpers/constants/TOKEN_STANDARDS'
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

EXISTING_STANDARDS.forEach((standard) => {
  const standardConfig: TokenStandard = TOKEN_STANDARDS[standard]
  const { currency: standardBlockchain } = standardConfig

  const isStandardBlockchainEnabled = curEnabled[standardBlockchain]

  if (isStandardBlockchainEnabled) {
    TOKEN_STANDARDS_ARR.push(standardConfig)
  }
})

interface IAvailableAssetPlatform {
  tokenAddress: string
  standard: string
  value: string
  currency: string
}

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
  selectedAssetFullInfo: IUniversalObj | null
  isAssetFullInfoLoading: boolean
  selectedAssetPlatforms: IAvailableAssetPlatform[]
  selectedAssetPlatform: IAvailableAssetPlatform | null
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
      selectedAssetFullInfo: null,
      isAssetFullInfoLoading: false,
      selectedAssetPlatforms: [],
      selectedAssetPlatform: null,
    }
  }

  handleSubmit = async () => {
    const { tokenAddress, tokenStandard, addTokenMode, selectedAssetPlatform } = this.state

    this.setState(() => ({ isPending: true }))

    const address = addTokenMode === 'byAddress'
      ? tokenAddress
      : selectedAssetPlatform?.tokenAddress

    const info = await actions[tokenStandard].getInfoAboutToken(address)

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

  handleConfirm = () => {
    const { tokenStandard, tokenAddress, tokenSymbol, tokenDecimals, baseCurrency, addTokenMode, selectedAssetPlatform } = this.state

    const address = addTokenMode === 'byAddress'
      ? tokenAddress
      : selectedAssetPlatform?.tokenAddress

    actions[tokenStandard].addToken({
      standard: tokenStandard,
      contractAddr: address,
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
    const { tokenAddress, baseCurrency, selectedAssetPlatform, addTokenMode } = this.state

    const address = addTokenMode === 'byAddress'
      ? tokenAddress
      : selectedAssetPlatform?.tokenAddress

    return typeforce.isCoinAddress[baseCurrency.toUpperCase()](address)
  }

  selectAddByAddress = () => {
    this.setState({
      addTokenMode: 'byAddress',
    })
  }

  selectAddBySearch = () => {
    this.setState({
      addTokenMode: 'bySearch',
    })
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

  resetSearchData = () => this.setState(() => ({
    selectedAsset: null,
    selectedAssetFullInfo: null,
    searchQuery: '',
    assetsList: [],
    selectedAssetPlatforms: [],
    isAssetsListLoading: false,
    isAssetFullInfoLoading: false,
    selectedAssetPlatform: null,
  }))

  setSelectedAssetFullInfo = (assetFullInfo: IUniversalObj) => {
    const { tokenStandard, baseCurrency } = this.state
    const availableAssetPlatforms: IAvailableAssetPlatform[] = []

    TOKEN_STANDARDS_ARR.forEach(standardConfig => {
      const standardTokenAddress = assetFullInfo?.platforms[standardConfig.platformKey]
      if (standardTokenAddress) {
        availableAssetPlatforms.push({
          tokenAddress: standardTokenAddress,
          standard: standardConfig.standard,
          value: standardConfig.value,
          currency: standardConfig.currency,
        })
      }
    })

    this.setState(() => ({
      selectedAssetFullInfo: assetFullInfo,
      selectedAssetPlatforms: availableAssetPlatforms,
      selectedAssetPlatform: availableAssetPlatforms[0] || null,
      tokenStandard: availableAssetPlatforms[0]?.standard || tokenStandard,
      baseCurrency: availableAssetPlatforms[0]?.currency || baseCurrency,
    }))
  }

  async getAssetFullInfo(assetId: string) {
    const coinGeckoAssetsLink = 'https://api.coingecko.com/api/v3/coins'
    try {
      this.setState({ isAssetFullInfoLoading: true })
      const { data } = await axios.get(`${coinGeckoAssetsLink}/${assetId}`)

      this.setSelectedAssetFullInfo(data)
    } catch (error) {
      console.log('error', error)
      return []
    } finally {
      this.setState({ isAssetFullInfoLoading: false })
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
      selectedAsset,
      selectedAssetFullInfo,
      isAssetFullInfoLoading,
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

    const shouldFetchSelectedAssetFullInfo = (
      selectedAsset
      && !selectedAssetFullInfo
      && !isAssetFullInfoLoading
    )

    if (shouldFetchSelectedAssetFullInfo) {
      await this.getAssetFullInfo(selectedAsset.id)
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
      isAssetFullInfoLoading,
      selectedAssetPlatforms,
      selectedAssetPlatform,
    } = this.state

    const {
      name,
      intl,
    } = this.props

    const linked = Link.all(this, 'tokenAddress', 'searchQuery')

    const isDisabled = (
      (
        addTokenMode === 'byAddress'
          ? !tokenAddress
          : !selectedAssetPlatform?.tokenAddress
      )
      || isPending
      || !this.addressIsCorrect()
    )

    const localeLabel = defineMessages({
      addressPlaceholder: {
        id: 'customERC20_addressPlaceholder',
        defaultMessage: 'Enter token address',
      },
      searchPlaceholder: {
        id: 'customERC20_searchPlaceholder',
        defaultMessage: 'Enter token name or symbol',
      },
    })

    return (
      <Modal
        name={name}
        title={<FormattedMessage id="customERC20_Title" defaultMessage="Add a new token" />}
        contentWithTabs
        showCloseButton
      >
        <div styleName="stepsWrapper">
          {step === 'enterAddress' && (
            <>
              <div styleName="tabsWrapper">
                <button
                  type="button"
                  styleName={`tab ${addTokenMode === 'byAddress' ? 'active' : ''}`}
                  onClick={this.selectAddByAddress}
                >
                  <FormattedMessage id="addByAddress" defaultMessage="by Address" />
                </button>
                <button
                  type="button"
                  styleName={`tab ${addTokenMode === 'bySearch' ? 'active' : ''}`}
                  onClick={this.selectAddBySearch}
                >
                  <FormattedMessage id="addBySearch" defaultMessage="by Search" />
                </button>
              </div>
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
                    <>
                      <div styleName="lowLevel">
                        <FieldLabel inRow>
                          <span styleName="title">
                            <FormattedMessage id="selectedTokenTitle" defaultMessage="Token" />
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
                      {
                        isAssetFullInfoLoading
                          ? (
                            <div style={{ padding: '1rem' }}>
                              <FormattedMessage id="Table96" defaultMessage="Loading..." />
                            </div>
                          ) : (selectedAssetPlatform && selectedAssetPlatforms.length > 0) ? (
                            <div styleName="lowLevel">
                              <FieldLabel inRow>
                                <span styleName="title">
                                  <FormattedMessage
                                    id="customTokenAddress"
                                    defaultMessage="Token address"
                                  />
                                </span>
                              </FieldLabel>
                              <div styleName="fakeInput">{selectedAssetPlatform.tokenAddress}</div>
                              <DropDown
                                className={dropDownStyles.simpleDropdown}
                                items={selectedAssetPlatforms}
                                selectedValue={selectedAssetPlatform.value}
                                selectedItemRender={(item) => item.value.toUpperCase()}
                                itemRender={(item) => item.value.toUpperCase()}
                                onSelect={(item) => {
                                  this.setState({
                                    tokenStandard: item.standard,
                                    baseCurrency: item.currency,
                                    selectedAssetPlatform: item,
                                  })
                                }}
                                name="Select a standard"
                                role="SelectStandard"
                              />
                            </div>
                          ) : (
                            <div style={{ padding: '1rem' }}>
                              <FormattedMessage id="selectedAssetHaveNotChains" defaultMessage="This asset has no token addresses on supported networks" />
                            </div>
                          )
                      }
                    </>
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
                                ? <FormattedMessage id="Table96" defaultMessage="Loading..." />
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
                                  : (
                                    <FormattedMessage
                                      id="noSearchingResult"
                                      defaultMessage="No result for {searchQuery}"
                                      values={{
                                        searchQuery,
                                      }}
                                    />
                                  )}
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
                <div styleName="fakeInput">
                  {
                    addTokenMode === 'byAddress'
                      ? tokenAddress
                      : selectedAssetPlatform?.tokenAddress
                  }
                </div>
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
