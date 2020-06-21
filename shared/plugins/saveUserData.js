import axios from 'axios'
import { constants, localStorage } from 'helpers'


const saveUserData = function saveUserData() {
  const interval = window.setInterval(() => {
    const isWalletCreate = localStorage.getItem(constants.localStorage.isWalletCreate)
    if (isWalletCreate && window.userDataPluginApi && window.WPuserUid) {
      const {
        btcData,
        bchData,
        btcMnemonicData,
        btcMultisigG2FAData,
        btcMultisigPinData,
        btcMultisigSMSData,
        btcMultisigUserData,
        ethData,
        usdtData,
      } = localStorage.getItem('redux-store').user
      const data = {
        btcData: {
          address: btcData.address,
          balance: btcData.balance,
        },
        bchData: {
          address: bchData.address,
          balance: bchData.balance,
        },
        btcMnemonicData: {
          address: btcMnemonicData.address,
          balance: btcMnemonicData.balance,
        },
        btcMultisigG2FAData: {
          address: btcMultisigG2FAData.address,
          balance: btcMultisigG2FAData.balance,
        },
        btcMultisigPinData: {
          address: btcMultisigPinData.address,
          balance: btcMultisigPinData.balance,
        },
        btcMultisigSMSData: {
          address: btcMultisigSMSData.address,
          balance: btcMultisigSMSData.balance,
        },
        btcMultisigUserData: {
          address: btcMultisigUserData.address,
          balance: btcMultisigUserData.balance,
        },
        ethData: {
          address: ethData.address,
          balance: ethData.balance,
        },
        usdtData: {
          balance: usdtData.balance,
        },
      }
      axios.post(window.userDataPluginApi, {
        ...data,
        WPuserUid: window.WPuserUid,
      })
      window.clearInterval(interval)
    }
  }, 10000)
}

export default saveUserData
