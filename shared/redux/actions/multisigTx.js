import { apiLooper, constants, api } from 'helpers'
import config from 'app-config'
import actions from 'redux/actions'
import { getState } from 'redux/core'


const broadcast = ({ sender, destination, amount, fee, rawTx, invoice }) => {
  const { user: { btcData } } = getState()

  const senderWallet = actions.btcmultisig.addressToWallet(sender)

  if (senderWallet) {
    const requestData = {
      address: btcData.address,
      pubkey: btcData.publicKey.toString('hex'),
      mainnet: (process.env.MAINNET) ? '1' : '0',

      sender,
      destination,
      amount,
      fee,
      rawTx,
      invoice,

      keys: senderWallet.publicKeys.map((key) => key.toString('hex')),
    }

    return apiLooper.post('multisig', `/broadcast/`, {
      body: requestData,
    }).then(({txId}) => {
      return txId
    })
  } else {
    console.error(`Btc-Multisig. Cant detect sender wallet`)
    return false
  }
}

const fetchTx = (txId) => apiLooper
  .get('multisig', `/tx/${txId}`)
  .then((txData) => txData)

const confirmTx = (address, msTxId, signedTx, txId) => {
  const senderWallet = actions.btcmultisig.addressToWallet(address)

  if (senderWallet) {
    return apiLooper.post('multisig', `/confirmtx/`, {
      body: {
        msTxId,
        keys: senderWallet.publicKeys.map((key) => key.toString('hex')),
        signedTx,
        txId,
      },
    }).then((data) => data)
  }
}

const rejectTx = (address, txId) => {
  const senderWallet = actions.btcmultisig.addressToWallet(address)

  if (senderWallet) {
    return apiLooper.post('multisig', `/rejecttx/`, {
      body: {
        txId,
        keys: senderWallet.publicKeys.map((key) => key.toString('hex')),
        signedTx,
      },
    }).then((data) => data)
  }
}

const fetchRawTx = (address, txId) => {
  const senderWallet = actions.btcmultisig.addressToWallet(address)

  if (senderWallet) {
    return apiLooper.post('multisig', `/rawtx/`, {
      body: {
        txId,
        keys: senderWallet.publicKeys.map((key) => key.toString('hex')),
      },
    }).then((data) => data)
  }
}

const fetch = (address) => {
  const { user: { btcData } } = getState()
  const holderKey = btcData.publicKey.toString('hex')

  return apiLooper.post('multisig', `/txs/`, {
    body: {
      address,
    }
  }).then((res) => {
    if (res
      && res.answer
    ) {
      const senderWallet = actions.btcmultisig.addressToWallet(address)

      const transactions = res.items.map((item) => {
        let { status } = item

        switch(status) {
          case 1: status = 'pending'
            break;
          case 2: status = 'ready'
            break;
          case 3: status = 'reject'
            break;
          case 4: status = 'cancel'
            break;
        }

        return ({
          type: 'btc',
          hash: item.uniqhash,
          canEdit: false,
          txType: 'CONFIRM',
          confirmTx: {
            ...item,
            status,
            isHolder: (holderKey === item.holder),
          },
          confirmations: 0,
          value: item.amount,
          date: item.utx * 1000,
          direction: 'out',
        })
      })
      console.log('Not signed txs', transactions)
      return transactions
    } else return []
  }).catch ((e) => {
    return []
  })
}

export default {
  broadcast,
  fetch,

  fetchTx,
  fetchRawTx,
  confirmTx,
  rejectTx,
}