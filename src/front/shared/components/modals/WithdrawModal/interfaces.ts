
export interface IWithdrawModalProps {
  [key: string]: any
  // activeFiat
  // activeCurrency
  // currencies: currencies.items
  // items: [ethData, btcData, ghostData, nextData]
  // tokenItems: [...Object.keys(tokensData).map((k) => tokensData[k])]
  // dashboardView: dashboardModalsAllowed
  // isBalanceFetching
}

export interface IWithdrawModalState {
  [key: string]: any
  // isShipped: false
  // usedAdminFee
  // openScanCam: ''
  // address: toAddress ? toAddress : ''
  // amount: amount ? amount : ''
  // balance: selectedItem.balance || 0
  // selectedItem
  // ethBalance: null
  // isEthToken: helpers.ethToken.isEthToken({ name: currency.toLowerCase() })
  // currentDecimals
  // selectedValue: currency
  // getFiat: 0
  // error: false
  // ownTx: ''
  // isAssetsOpen: false
  // hiddenCoinsList: actions.core.getHiddenCoins()
  // currentActiveAsset
  // allCurrencyies
  // enabledCurrencies: getActivatedCurrencies()
  // wallet: selectedItem
  // devErrorMessage: false
  // tokenFee: null
  // coinFee: null
  // totalFee: null
  // adminFeeSize: null
  // fetchFee: true
}