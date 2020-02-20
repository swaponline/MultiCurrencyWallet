import helpers from "helpers";

const getLink = (currency, txId) => {
  let prefix = currency.toLowerCase()

  if(['btc (multisig)', 'btc (sms-protected)'].includes(prefix)) {
    prefix = 'btc'
  }

  if (helpers[prefix]
    && typeof helpers[prefix].getLinkToInfo === 'function'
  ) {
    return helpers[prefix].getLinkToInfo(txId)
  } else {
    console.warn(`Function getLinkToInfo for ${prefix} not defined`)
  }
}

const getInfo = (currency, txRaw) => {
  let prefix = currency.toLowerCase()

  if(['btc (multisig)', 'btc (sms-protected)'].includes(prefix)) {
    prefix = 'btc'
  }

  if (helpers[prefix]
    && typeof helpers[prefix].getTx === 'function'
  ) {
    const tx = helpers[prefix].getTx(txRaw)
    const link =  getLink(tx)

    return {
      tx,
      link
    }
  } else {
    console.warn(`Function getTx for ${prefix} not defined`)
    return {
      tx: '',
      link: '',
    }
  }
}

export default {
  getInfo,
  getLink,
}