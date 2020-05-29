import helpers from 'helpers'
import actions from 'redux/actions'
import config from 'helpers/externalConfig'
import apiLooper from 'helpers/apiLooper'


/**
 * Сохраняет информацию о балансах на момент выполнения транзакции на backend
 */
const pullTxBalances = (txId, amount, balances) => {
  console.log('pullTxBalances', txId, amount, balances)
  return true
  return apiLooper.post('txholder', `/pull`, {
    body: {
      txId,
      amount,
      ...balances,
    },
    checkStatus: (answer) => {
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ answer }) => {
    return answer
  }).catch((e) => {
    return false
  })
}

/**
 * Вспомогательная функция, опрашивает балансы перед выполнением транзакции
 * Для расчета финальных балансов на адресе отправления и адресе получателя
 * На момент выполнения транзакции
 */
const getTxBalances = (currency, from, to) => {
  const prefix = helpers.getCurrencyKey(currency)
  const curKey = helpers.getCurrencyKey(currency, true)

  if (actions[prefix]) {
    return new Promise(async (resolve) => {
      const fromBalance = await actions[prefix].getBalance(curKey)
      const toBalance = await actions[prefix].getBalance(curKey)

      resolve({
        currency,
        from,
        to,
        fromBalance,
        toBalance,
      })
    })
  } else {
    return new Promise((resolve) => { resolve(false) })
  }
}

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
  getTxBalances,
  pullTxBalances,
}