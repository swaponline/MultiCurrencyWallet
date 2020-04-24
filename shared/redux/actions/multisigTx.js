import { apiLooper, constants, api } from 'helpers'
import config from 'app-config'
import actions from 'redux/actions'
import { getState } from 'redux/core'


const broadcast = ({ sender, destination, amount, fee, rawTx }) => {
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
const fetch = () => {}

export default {
  broadcast,
  fetch,
}