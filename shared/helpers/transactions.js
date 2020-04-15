import helpers from "helpers";
import actions from 'redux/actions'


const getTxRouter = (currency, txId) => {
  const prefix = helpers.getCurrencyKey(currency)

  if (actions[prefix]
    && typeof actions[prefix].getTxRouter === 'function'
  ) {
    return actions[prefix].getTxRouter(txId, currency.toLowerCase())
  } else {
    console.warn(`Function getTxRouter for ${prefix} not defined (currency: ${currency})`)
  }
}

const getLink = (currency, txId) => {
  const prefix = helpers.getCurrencyKey(currency)

  if (actions[prefix]
    && typeof actions[prefix].getLinkToInfo === 'function'
  ) {
    return actions[prefix].getLinkToInfo(txId)
  } else {
    console.warn(`Function getLinkToInfo for ${prefix} not defined`)
  }
}

const getInfo = (currency, txRaw) => {
  const prefix = helpers.getCurrencyKey(currency)

  if (actions[prefix]
    && typeof actions[prefix].getTx === 'function'
  ) {
    const tx = actions[prefix].getTx(txRaw)
    const link =  getLink(prefix, tx)
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
  getTxRouter,
}