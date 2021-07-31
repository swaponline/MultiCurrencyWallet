import constants from 'helpers/constants'
import getUnixTimeStamp from 'common/utils/getUnixTimeStamp'
import config from 'helpers/externalConfig'
import backupUserData from 'plugins/backupUserData'


const backupFields = [
  constants.privateKeyNames.eth,
  constants.privateKeyNames.bnb,
  constants.privateKeyNames.matic,
  constants.privateKeyNames.btc,
  constants.privateKeyNames.btcMultisig,
  constants.privateKeyNames.btcMultisigOtherOwnerKey,
  constants.privateKeyNames.btcSmsMnemonicKey,
  constants.privateKeyNames.btcSmsMnemonicKeyGenerated,
  constants.privateKeyNames.btcPinMnemonicKey,
]


const serverBackup = () => {
  return backupUserData.backupUser()
}

const serverCleanupSeed = () => {
  if (config
    && config.opts
    && config.opts.plugins
    && config.opts.plugins.backupPlugin
  ) {
    backupUserData.cleanupSeed()
  }
}

const backup = (mark, label, overide) => {
  if (!label) label = new Date().toString()
  if (!mark) mark = getUnixTimeStamp()

  const data = {}
  backupFields.forEach((lsKey) => {
    const value = localStorage.getItem(lsKey)
    if (value) {
      data[lsKey] = value
    }
  })

  const backupData = {
    mark,
    label,
    utx: getUnixTimeStamp(),
    data,
  }

  let backups = localStorage.getItem(constants.localStorage.backups)
  //@ts-ignore: strictNullChecks
  try { backups = JSON.parse(backups) } catch (e) { }
  //@ts-ignore
  if (!(backups instanceof Array)) {
    //@ts-ignore
    backups = []
  }

  //@ts-ignore: strictNullChecks
  if ((backups.indexOf(mark) !== -1) && !overide) return `exists`
  //@ts-ignore
  backups.unshift(mark)

  localStorage.setItem(constants.localStorage.backups, JSON.stringify(backups))
  const backupKey = `${constants.localStorage.backups_prefix}:${mark}`
  localStorage.setItem(`${constants.localStorage.backups_prefix}:${mark}`, JSON.stringify(backupData))

  return backup
}

const importBackup = (backup) => {
  if (backup
    && backup.mark
    && backup.utx
    && backup.label
    && backup.data
  ) {
    Object.keys(backup.data).forEach((lsKey) => {
      localStorage.setItem(lsKey, backup.data[lsKey])
    })
  } else {
    return false
  }
}

const restory = (mark) => {
  const backup = exists(mark)
  if (backup) {
    return importBackup(backup)
  }
  return false
}

const list = () => {
  let backups = localStorage.getItem(constants.localStorage.backups)
  //@ts-ignore: strictNullChecks
  try { backups = JSON.parse(backups) } catch (e) { }
  //@ts-ignore
  if (!(backups instanceof Array)) {
    //@ts-ignore
    backups = []
  }
  //@ts-ignore
  backups = backups.map((mark) => {
    let backupData = localStorage.getItem(`${constants.localStorage.backups_prefix}:${mark}`)
    //@ts-ignore: strictNullChecks
    try { backupData = JSON.parse(backupData) } catch (e) { }
    if (backupData
      //@ts-ignore
      && backupData.mark
      //@ts-ignore
      && backupData.utx
      //@ts-ignore
      && backupData.label
      //@ts-ignore
      && backupData.data
    ) {
      return backupData
    }
    return false
  }).filter(backupData => backupData && backupData.mark)

  return backups
}

const exists = (mark) => {
  let backupData = localStorage.getItem(`${constants.localStorage.backups_prefix}:${mark}`)
  //@ts-ignore: strictNullChecks
  try { backupData = JSON.parse(backupData) } catch (e) { }
  if (backupData
    //@ts-ignore
    && backupData.mark
    //@ts-ignore
    && backupData.utx
    //@ts-ignore
    && backupData.label
    //@ts-ignore
    && backupData.data
  ) {
    return backupData
  }
  return false
}

const backupManager = {
  backup,
  restory,
  importBackup,
  list,
  exists,
  get: exists,

  serverBackup,
  serverCleanupSeed,
}

export default backupManager
