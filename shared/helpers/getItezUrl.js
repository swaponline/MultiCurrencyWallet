
export const getItezUrl = ({ user, locale, url }) => {
    const { activeFiat, btcMnemonicData, btcMultisigG2FAData, btcMultisigSMSData, btcMultisigUserData, btcData } = user

    let getActuallyFiatAddress = [btcMnemonicData, btcMultisigG2FAData, btcMultisigSMSData, btcMultisigUserData, btcData].find(({ balance }) => balance > 0);

    if (!getActuallyFiatAddress) {
        getActuallyFiatAddress = btcData
    }

    const comingFiat = /%7BDEFAULT_FIAT%7D/gi
    const comingLocale = /%7Blocale%7D/gi
    const comingAddress = /%7Bbtcaddress%7D/gi


    const returned = url
        .replace(comingFiat, activeFiat)
        .replace(comingLocale, locale)
        .replace(comingAddress, getActuallyFiatAddress.address)

    return returned
}
