// temporary, turboswaps muss support all configured currencies
// only for the alpha stage
// see https://github.com/swaponline/MultiCurrencyWallet/issues/3875

const supportedAssets = ['btc', 'eth', 'ghost', 'next']

const isAssetSupported = (asset: string) => supportedAssets.includes(asset)

export default {
  isAssetSupported
}