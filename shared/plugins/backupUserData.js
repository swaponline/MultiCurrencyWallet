import axios from 'axios'
import config from 'helpers/externalConfig'
import { constants } from 'helpers'


const localStorage = window.localStorage
const lsCurrentUser = `${process.env.ENTRY}:wp_currentUserId`

const backupUserData = {
  isUserLoggedIn: () => {
    return (window && window.WPuserUid && config.opts.WPuserHash)
  },
  isFirstBackup: () => {
    const currentUser = localStorage.getItem(lsCurrentUser)
    return (!currentUser) ? true : false
  },
  hasServerBackup: () => {
    return new Promise((resolve) => {
      if (config
        && config.opts
        && config.opts.plugins
        && config.opts.plugins.backupPlugin
        && config.opts.plugins.restorePluginUrl
        && window
        && window.WPuserUid
        && config.opts.WPuserHash
      ) {
        const set = (key, value) => localStorage.setItem(constants.privateKeyNames[key], value)

        axios.post(config.opts.plugins.restorePluginUrl, {
          WPuserUid: window.WPuserUid,
          WPuserHash: config.opts.WPuserHash,
        }).then((req) => {
          if (req
            && req.data
            && req.data.answer
            && req.data.answer === `ok`
            && req.data.data
          ) {
            resolve(true)
          } else {
            resolve(false)
          }
        }).catch((e) => {
          resolve(false)
        })
      } else {
        resolve(false)
      }
    })
  },
  isUserChanged: () => {
    const currentUser = localStorage.getItem(lsCurrentUser)

    return (currentUser !== `${window.WPuserUid}` && window.WPuserUid) ? true : false
  },
  backupUser: () => {
    return new Promise((resolve) => {
      if (config
        && config.opts
        && config.opts.plugins
        && config.opts.plugins.backupPlugin
        && config.opts.plugins.backupPluginUrl
        && window
        && window.WPuserUid
        && config.opts.WPuserHash
      ) {
        const get = (key) => localStorage.getItem(constants.privateKeyNames[key])

        const backup = {
          btcMnemonic:                      get(`btcMnemonic`),
          ethMnemonic:                      get(`ethMnemonic`),
          eth:                              get(`eth`),
          btc:                              get(`btc`),
          ghost:                            get(`ghost`),
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
          WPuserHash: config.opts.WPuserHash,
        }).then((answer) => {
          const data = answer.data
          if (data
            && data.answer
            && data.answer === `ok`
          ) {
            localStorage.setItem(lsCurrentUser, window.WPuserUid)
            resolve(true, true)
          } else {
            resolve(false, true)
          }
        }).catch((e) => {
          resolve(false, true)
        })
      } else {
        resolve(false, false)
      }
    })
  },
  cleanupSeed: () => {
    return new Promise((resolve) => {
      if (config
        && config.opts
        && config.opts.plugins
        && config.opts.plugins.backupPlugin
        && config.opts.plugins.backupPluginUrl
        && window
        && window.WPuserUid
        && config.opts.WPuserHash
      ) {
        axios.post(config.opts.plugins.backupPluginUrl, {
          WPuserUid: window.WPuserUid,
          WPuserHash: config.opts.WPuserHash,
          action: 'cleanup',
        }).then((req) => {
          if (req
            && req.data
            && req.data.answer
            && req.data.answer === `ok`
          ) {
            resolve(true)
          } else {
            resolve(false)
          }
        }).catch((e) => {
          resolve(false)
        })
      } else {
        resolve(false)
      }
    })
  },
  restoreUser: () => {
    return new Promise((resolve) => {
      if (config
        && config.opts
        && config.opts.plugins
        && config.opts.plugins.backupPlugin
        && config.opts.plugins.restorePluginUrl
        && window
        && window.WPuserUid
        && config.opts.WPuserHash
      ) {
        const set = (key, value) => {
          if (value) localStorage.setItem(constants.privateKeyNames[key], value)
        }

        axios.post(config.opts.plugins.restorePluginUrl, {
          WPuserUid: window.WPuserUid,
          WPuserHash: config.opts.WPuserHash,
        }).then((req) => {
          if (req
            && req.data
            && req.data.answer
            && req.data.answer === `ok`
            && req.data.data
          ) {
            const data = req.data.data
            set( `btc`, data.btc )
            set( `ghost`, data.ghost )
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
            resolve(true)
          } else {
            resolve(false)
          }
        })
      } else {
        resolve(false)
      }
    })
  }
}

export default backupUserData
