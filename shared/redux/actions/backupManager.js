import constants from 'helpers/constants'
import getUnixTimeStamp from 'helpers/getUnixTimeStamp'


const backupFields = [
  constants.privateKeyNames.btcMnemonic,
  constants.privateKeyNames.ethMnemonic,
  constants.privateKeyNames.eth,
  constants.privateKeyNames.btc,
  constants.privateKeyNames.btcMultisig,
  constants.privateKeyNames.btcMultisigOtherOwnerKey,
  constants.privateKeyNames.btcMultisigOtherOwnerKeyMnemonic,
  constants.privateKeyNames.btcSmsMnemonicKey,
  constants.privateKeyNames.btcSmsMnemonicKeyGenerated,
  constants.privateKeyNames.btcSmsMnemonicKeyMnemonic,
  constants.privateKeyNames.bch,
  constants.privateKeyNames.qtum,
]


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
  try { backups = JSON.parse(backups) } catch (e) { }
  if (!(backups instanceof Array)) {
    backups = []
  }

  if ((backups.indexOf(mark) !== -1) && !overide) return `exists`

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
  try { backups = JSON.parse(backups) } catch (e) { }
  if (!(backups instanceof Array)) {
    backups = []
  }
  backups = backups.map((mark) => {
    let backupData = localStorage.getItem(`${constants.localStorage.backups_prefix}:${mark}`)
    try { backupData = JSON.parse(backupData) } catch (e) { }
    if (backupData
      && backupData.mark
      && backupData.utx
      && backupData.label
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
  try { backupData = JSON.parse(backupData) } catch (e) { }
  if (backupData
    && backupData.mark
    && backupData.utx
    && backupData.label
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
}

export default backupManager