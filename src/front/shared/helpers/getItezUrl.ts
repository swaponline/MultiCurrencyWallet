
export const getItezUrl = ({ user, locale, url }) => {
  if (!user && !locale) return url

  const { activeFiat, btcMultisigG2FAData, btcMultisigSMSData, btcMultisigPinData, btcMultisigUserData, btcData } = user

  let getActuallyFiatAddress = [, btcMultisigG2FAData, btcMultisigSMSData, btcMultisigUserData, btcData].find((data) => data && data.balance > 0)

  //@ts-ignore: strictNullChecks
  const hiddenCoinsList = JSON.parse(localStorage.getItem('hiddenCoinsList')) || []

  /*
  if (!getActuallyFiatAddress && !hiddenCoinsList.includes('BTC (SMS-Protected)')) getActuallyFiatAddress = btcMultisigSMSData
  if (!getActuallyFiatAddress && !hiddenCoinsList.includes('BTC (PIN-Protected)')) getActuallyFiatAddress = btcMultisigPinData
  if (!getActuallyFiatAddress && !hiddenCoinsList.includes('BTC (Multisig)')) getActuallyFiatAddress = btcMultisigUserData

  if (!getActuallyFiatAddress) {
    getActuallyFiatAddress = btcData
  }
  */
  getActuallyFiatAddress = btcData

  const shieldingСomingFiat = /%7BDEFAULT_FIAT%7D/gi
  const shieldingСomingLocale = /%7Blocale%7D/gi
  const shieldingСomingAddress = /%7Bbtcaddress%7D/gi

  const comingFiat = /{DEFAULT_FIAT}/gi
  const comingLocale = /{locale}/gi
  const comingAddress = /{btcaddress}/gi

  let returned = url

  if (url.includes('btcaddress')) {
    returned = returned.replace(comingAddress, getActuallyFiatAddress.address)
    returned = returned.replace(shieldingСomingAddress, getActuallyFiatAddress.address)
  }
  if (url.includes('DEFAULT_FIAT')) {
    returned = returned.replace(comingFiat, activeFiat)
    returned = returned.replace(shieldingСomingFiat, activeFiat)
  }

  if (url.includes('locale')) {
    returned = returned.replace(comingLocale, locale)
    returned = returned.replace(shieldingСomingLocale, locale)
  }

  return returned
}
