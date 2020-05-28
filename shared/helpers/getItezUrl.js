
export const getItezUrl = ({ user, locale, url }) => {
  if (!user && !locale) return url

  const { activeFiat, btcMnemonicData, btcMultisigG2FAData, btcMultisigSMSData, btcMultisigUserData, btcData } = user

  let getActuallyFiatAddress = [btcMnemonicData, btcMultisigG2FAData, btcMultisigSMSData, btcMultisigUserData, btcData].find(({ balance }) => balance > 0);

  if (!getActuallyFiatAddress) {
    getActuallyFiatAddress = btcData
  }

  const comingFiat = /%7BDEFAULT_FIAT%7D/gi
  const comingLocale = /%7Blocale%7D/gi
  const comingAddress = /%7Bbtcaddress%7D/gi

  let returned = url

  if (url.includes('btcaddress')) {
    returned = returned.replace(comingAddress, getActuallyFiatAddress.address)
  }
  if (url.includes('BDEFAULT_FIAT')) {
    returned = returned.replace(comingFiat, activeFiat)
  }

  if (url.includes('locale')) {
    returned = returned.replace(comingLocale, locale)
  }

  return returned
}
