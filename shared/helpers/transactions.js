import helpers from 'helpers'
import actions from 'redux/actions'
import config from 'helpers/externalConfig'
import apiLooper from 'helpers/apiLooper'


/**
 * Запрашивает информацию о tx (final balances)
 */
const fetchTxBalances = (currency, txId) => {
  const curName = helpers.getCurrencyKey(currency, true)
  return apiLooper.get('txinfo', `/tx/${curName}/${txId}`, {
    checkStatus: (res) => {
      try {
        if (res && res.answer !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then((res) => {
    if (res
      && res.answer
      && res.answer === 'ok'
      && res.data
    ) {
      return res.data
    }
    return false

  }).catch((e) => false)
}

/**
 * Сохраняет информацию о балансах на момент выполнения транзакции на backend
 */
const pullTxBalances = (txId, amount, balances, adminFee) => apiLooper.post('txinfo', `/pull`, {
  body: {
    txId,
    amount,
    adminFee,
    ...balances,
  },
  checkStatus: (res) => {
    try {
      if (res && res.answer !== undefined) return true
    } catch (e) { /* */ }
    return false
  },
}).then(({ answer }) => answer).catch((e) => false)

/**
 * Вспомогательная функция, опрашивает балансы перед выполнением транзакции
 * Для расчета финальных балансов на адресе отправления и адресе получателя
 * На момент выполнения транзакции
 */
const getTxBalances = (currency, from, to) => {
  const prefix = helpers.getCurrencyKey(currency)
  const curName = helpers.getCurrencyKey(currency, true)

  if (actions[prefix]) {
    return new Promise(async (resolve) => {
      let fromBalance = 0
      let toBalance = 0
      if (helpers.ethToken.isEthToken({ name: curName })) {
        const tokenData = actions[prefix].withToken(curName)
        fromBalance = await actions[prefix].fetchBalance(from, tokenData.contractAddress, tokenData.decimals)
        toBalance = await actions[prefix].fetchBalance(to, tokenData.contractAddress, tokenData.decimals)
      } else {
        fromBalance = await actions[prefix].fetchBalance(from)
        toBalance = await actions[prefix].fetchBalance(to)
      }

      resolve({
        curName,
        from,
        to,
        fromBalance,
        toBalance,
      })
    })
  }
  return new Promise((resolve) => { resolve(false) })

}

const getTxRouter = (currency, txId) => {
  const prefix = helpers.getCurrencyKey(currency)

  if (actions[prefix]
    && typeof actions[prefix].getTxRouter === 'function'
  ) {
    return actions[prefix].getTxRouter(txId, currency.toLowerCase())
  }
  console.warn(`Function getTxRouter for ${prefix} not defined (currency: ${currency})`)

}

const getLink = (currency, txId) => {
  const prefix = helpers.getCurrencyKey(currency)

  if (actions[prefix]
    && typeof actions[prefix].getLinkToInfo === 'function'
  ) {
    return actions[prefix].getLinkToInfo(txId)
  }
  console.warn(`Function getLinkToInfo for ${prefix} not defined`)

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
      link,
    }
  }
  console.warn(`Function getTx for ${prefix} not defined`)
  return {
    tx: '',
    link: '',
  }

}

export default {
  getInfo,
  getLink,
  getTxRouter,
  getTxBalances,
  pullTxBalances,
  fetchTxBalances,
}
