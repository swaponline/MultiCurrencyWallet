import axios from 'axios'
import config from 'helpers/externalConfig'
import { constants } from 'helpers'


const localStorage = window.localStorage
const lsCurrentUser = `${process.env.ENTRY}:wp_currentUserId`

const backupUserData = {
  isFirstBackup: () => {
    const currentUser = localStorage.getItem(lsCurrentUser)
    return (!currentUser) ? true : false
  },
  isUserChanged: () => {
    const currentUser = localStorage.getItem(lsCurrentUser)

    return (currentUser !== window.WPuserUid) ? true : false
  },
  backupUser: () => {
    const get = (key) => localStorage.getItem(constants.privateKeyNames[key])

    const backup = {
      btcMnemonic:                      get(`btcMnemonic`),
      ethMnemonic:                      get(`ethMnemonic`),
      eth:                              get(`eth`),
      btc:                              get(`btc`),
      ethOld:                           get(`ethOld`),
      btcOld:                           get(`btcOld`),
      twentywords:                      get(`twentywords`),
      btcMultisig:                      get(`btcMultisig`),
      btcMultisigOtherOwnerKey:         get(`btcMultisigOtherOwnerKey`),
      btcMultisigOtherOwnerKeyMnemonic: get(`btcMultisigOtherOwnerKeyMnemonic`),
      btcMultisigOtherOwnerKeyOld:      get(`btcMultisigOtherOwnerKeyOld`),
      btcSmsMnemonicKey:                get(`btcSmsMnemonicKey`),
      btcSmsMnemonicKeyGenerated:       get(`btcSmsMnemonicKeyGenerated`),
      btcSmsMnemonicKeyMnemonic:        get(`btcSmsMnemonicKeyMnemonic`),
      btcSmsMnemonicKeyOld:             get(`btcSmsMnemonicKeyOld`),
      btcPinMnemonicKey:                get(`btcPinMnemonicKey`),
      hiddenCoinsList:                  localStorage.getItem(constants.localStorage.hiddenCoinsList),
      isWalletCreate:                   localStorage.getItem(constants.localStorage.isWalletCreate),
      didProtectedBtcCreated:           localStorage.getItem(constants.localStorage.didProtectedBtcCreated),
      didPinBtcCreated:                 localStorage.getItem(constants.localStorage.didPinBtcCreated),
    }

    axios.post(config.opts.plugins.backupPluginUrl, {
      ...backup,
      WPuserUid: window.WPuserUid,
      WPuserHash: window.WPuserHash,
    }).then((answer) => {
      const data = answer.data
      if (data
        && data.answer
        && data.answer === `ok`
      ) {
        localStorage.setItem(lsCurrentUser, window.WPuserUid)
      }
    })
  },
  restoreUser: () => {
    const set = (key, value) => localStorage.setItem(constants.privateKeyNames[key], value)

    axios.post(config.opts.plugins.restorePluginUrl, {
      WPuserUid: window.WPuserUid,
      WPuserHash: window.WPuserHash,
    }).then((req) => {
      if (req
        && req.data
        && req.data.answer
        && req.data.answer === `ok`
        && req.data.data
      ) {
        const data = req.data.data
        set( `btc`, data.btc )
        set( `btcMnemonic`, data.btcMnemonic )
        set( `btcMultisig`, data.btcMultisig )
        set( `btcMultisigOtherOwnerKey`, data.btcMultisigOtherOwnerKey )
        set( `btcMultisigOtherOwnerKeyMnemonic`, data.btcMultisigOtherOwnerKeyMnemonic )
        set( `btcMultisigOtherOwnerKeyOld`, data.btcMultisigOtherOwnerKeyOld )
        set( `btcOld`, data.btcOld )
        set( `btcPinMnemonicKey`, data.btcPinMnemonicKey )
        set( `btcSmsMnemonicKey`, data.btcSmsMnemonicKey )
        set( `btcSmsMnemonicKeyGenerated`, data.btcSmsMnemonicKeyGenerated )
        set( `btcSmsMnemonicKeyMnemonic`, data.btcSmsMnemonicKeyMnemonic )
        set( `btcSmsMnemonicKeyOld`, data.btcSmsMnemonicKeyOld )
        set( `eth`, data.eth )
        set( `ethMnemonic`, data.ethMnemonic )
        set( `ethOld`, data.ethOld )
        set( `ethMnemonic`, data.ethMnemonic )
        set( `twentywords`, data.twentywords )
        localStorage.setItem(constants.localStorage.hiddenCoinsList, data.hiddenCoinsList)
        localStorage.setItem(constants.localStorage.isWalletCreate, data.isWalletCreate)
        localStorage.setItem(constants.localStorage.didProtectedBtcCreated, data.didProtectedBtcCreated)
        localStorage.setItem(constants.localStorage.didPinBtcCreated, data.didPinBtcCreated)

        localStorage.setItem(lsCurrentUser, window.WPuserUid)
      }
    })
  }
}

window.backupUserData = backupUserData
export default backupUserData
