import axios from 'axios'
import config from 'helpers/externalConfig'
import { constants } from 'helpers'

type BackupUserResponse = {
  backupReady: boolean
  hasBackupPlugin: boolean
}

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
      const plugins = config?.opts?.plugins

      if (
        plugins?.backupPlugin
        && plugins?.restorePluginUrl
        && window?.WPuserUid
        && config.opts.WPuserHash
      ) {
        axios.post(
          plugins.restorePluginUrl,
          {
            WPuserUid: window.WPuserUid,
            WPuserHash: config.opts.WPuserHash,
          }
        ).then((res: any) => {
          if (res?.data?.answer
            && res.data.answer === `ok`
            && res.data.data
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
    return new Promise<BackupUserResponse>((resolve) => {
      const plugins = config?.opts?.plugins

      const backupStateResponse = {
        backupReady: false,
        hasBackupPlugin: false
      }

      if (
        plugins?.backupPlugin
        && plugins?.backupPluginUrl
        && window?.WPuserUid
        && config.opts.WPuserHash
      ) {
        backupStateResponse.hasBackupPlugin = true
        const get = (key) => localStorage.getItem(constants.privateKeyNames[key])

        const backup = {
          eth:                              get(`eth`),
          bnb:                              get(`bnb`),
          matic:                            get(`matic`),
          arbeth:                           get(`arbeth`),
          aureth:                           get(`aureth`),
          xdai:                             get(`xdai`),
          ftm:                              get(`ftm`),
          avax:                             get(`avax`),
          movr:                             get(`movr`),
          one:                              get(`one`),
          phi:                              get(`phi`),
          btc:                              get(`btc`),
          ghost:                            get(`ghost`),
          next:                             get(`next`),
          twentywords:                      get(`twentywords`),
          btcMultisig:                      get(`btcMultisig`),
          btcMultisigOtherOwnerKey:         get(`btcMultisigOtherOwnerKey`),
          btcSmsMnemonicKey:                get(`btcSmsMnemonicKey`),
          btcSmsMnemonicKeyGenerated:       get(`btcSmsMnemonicKeyGenerated`),
          btcPinMnemonicKey:                get(`btcPinMnemonicKey`),
          hiddenCoinsList:                  localStorage.getItem(constants.localStorage.hiddenCoinsList),
          isWalletCreate:                   localStorage.getItem(constants.localStorage.isWalletCreate),
          didProtectedBtcCreated:           localStorage.getItem(constants.localStorage.didProtectedBtcCreated),
          didPinBtcCreated:                 localStorage.getItem(constants.localStorage.didPinBtcCreated),
        }

        axios.post(
          plugins.backupPluginUrl,
          {
            ...backup,
            WPuserUid: window.WPuserUid,
            WPuserHash: config.opts.WPuserHash
          }
        ).then((res: any) => {
          if (res?.data?.answer
            && res.data.answer === `ok`
          ) {
            localStorage.setItem(lsCurrentUser, window.WPuserUid)
            backupStateResponse.backupReady = true
            resolve(backupStateResponse)
          } else {
            resolve(backupStateResponse)
          }
        }).catch((e) => {
          resolve(backupStateResponse)
        })
      } else {
        resolve(backupStateResponse)
      }
    })
  },
  cleanupSeed: () => {
    return new Promise((resolve) => {
      const plugins = config?.opts?.plugins

      if (
        plugins?.backupPlugin
        && plugins?.backupPluginUrl
        && window?.WPuserUid
        && config.opts.WPuserHash
      ) {
        axios.post(
          plugins.backupPluginUrl,
          {
            WPuserUid: window.WPuserUid,
            WPuserHash: config.opts.WPuserHash,
            action: 'cleanup',
          }
        ).then((res: any) => {
          if (
            res?.data?.answer
            && res.data.answer === `ok`
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
      const plugins = config?.opts?.plugins

      if (
        plugins?.backupPlugin
        && plugins?.restorePluginUrl
        && window?.WPuserUid
        && config.opts.WPuserHash
      ) {
        const set = (key, value) => {
          if (value) localStorage.setItem(constants.privateKeyNames[key], value)
        }

        axios.post(
          plugins.restorePluginUrl,
          {
            WPuserUid: window.WPuserUid,
            WPuserHash: config.opts.WPuserHash,
          }
        ).then((res: any) => {
          if (res?.data?.answer
            && res.data.answer === `ok`
            && res.data.data
          ) {
            const data = res.data.data

            set(`btc`, data.btc)
            set(`ghost`, data.ghost)
            set(`next`, data.next)
            set(`btcMultisig`, data.btcMultisig)
            set(`btcMultisigOtherOwnerKey`, data.btcMultisigOtherOwnerKey)
            set(`btcPinMnemonicKey`, data.btcPinMnemonicKey)
            set(`btcSmsMnemonicKey`, data.btcSmsMnemonicKey)
            set(`btcSmsMnemonicKeyGenerated`, data.btcSmsMnemonicKeyGenerated)
            set(`eth`, data.eth)
            set(`bnb`, data.bnb)
            set(`matic`, data.matic)
            set(`arbeth`, data.arbeth)
            set(`aureth`, data.aureth)
            set(`xdai`, data.xdai)
            set(`ftm`, data.ftm)
            set(`avax`, data.avax)
            set(`movr`, data.movr)
            set(`one`, data.one)
            set(`phi`, data.phi)
            set(`twentywords`, data.twentywords)

            // set other params to true (user has on tour and other pages)
            localStorage.setItem(constants.localStorage.hiddenCoinsList, data.hiddenCoinsList)
            localStorage.setItem(constants.localStorage.isWalletCreate, 'true')
            localStorage.setItem(constants.localStorage.wasOnExchange, 'true')
            localStorage.setItem(constants.localStorage.wasOnWidgetWallet, 'true')
            localStorage.setItem(constants.localStorage.wasCautionPassed, 'true')
            localStorage.setItem(constants.localStorage.wasOnWallet, 'true')
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
