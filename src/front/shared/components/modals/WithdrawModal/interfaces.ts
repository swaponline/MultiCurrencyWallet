type Currency = {
  addAssets: boolean
  fullTitle: string
  icon: string
  name: string
  title: string
  value: string
}

export interface IWithdrawModalProps {
  name: 'WithdrawModal'
  activeFiat: string
  activeCurrency: string
  dashboardView: boolean
  isBalanceFetching: boolean
  currencies: Currency[]

  intl: { [key: string]: any }
  history: { [key: string]: any }
  data: { [key: string]: any }
  tokenItems: { [key: string]: any }[]
  items: { [key: string]: any }[]

  portalUI?: any
}

export interface IWithdrawModalState {
  isShipped: boolean
  isEthToken: boolean
  isAssetsOpen: boolean
  fetchFee: boolean
  devErrorMessage: boolean
  
  openScanCam: string
  address: string
  amount: number
  ownTx: string
  selectedValue: string
  
  balance: number
  getFiat: number
  currentDecimals: number
  exCurrencyRate?: number
  fiatAmount?: number
  
  ethBalance: null | number
  tokenFee: null | number
  coinFee: null | number
  totalFee: null | number
  adminFeeSize: null | number
  
  usedAdminFee: {
    address: string
    fee: number
    min: number
  }
  hiddenCoinsList: string[]
  enabledCurrencies: string[]

  error: { [key: string]: any } | false
  currentActiveAsset: { [key: string]: any }
  allCurrencyies: { [key: string]: any }[]
  selectedItem: { [key: string]: any }
  wallet: { [key: string]: any }
}