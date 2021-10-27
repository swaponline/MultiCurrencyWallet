import { constants, localStorage } from 'helpers'
import initMigration from './001_initMigration'
import addBaseCurrencyToTokensInHiddenCoinsList from './002_updateHiddenCoinsList'
import updateExchangeStorageSettings from './003_updateExchangeStorageSettings'
import updateBtcPinMnemonicKey from './004_updateBtcPinMnemonicKey'

const migrations = [
  initMigration,
  addBaseCurrencyToTokensInHiddenCoinsList,
  updateExchangeStorageSettings,
  updateBtcPinMnemonicKey,
  // don't break an order of migrations, add only to end of array
]

export const migrate = () => {
  let revision = parseInt(localStorage.getItem(constants.localStorage.storageRevision), 10) || 0
  if (migrations.length === revision) {
    console.log('Your storage is up-to-date')
    return Promise.resolve()
  }
  console.log(`Your current storage revision is ${revision}, need to run ${migrations.length - revision} migrations`)

  return migrations.splice(revision).reduce((queue, migration) =>
    queue.then(() => new Promise((resolve, reject) => {
      try {
        migration.run()
          .then(() => {
            console.log(`Migration "${migration.name}" (#${revision + 1}) successfully done.`)
            revision++
            resolve()
          }).catch(e => {
            console.error(e)
            reject(`Migration "${migration.name}" (#${revision + 1}) is failed.`)
          })
      } catch (e) {
        console.error(e)
        reject(`Migration "${migration.name}" (#${revision + 1}) is failed.`)
      }
    }
    )), Promise.resolve()).then(() => {
    console.log('All migrations done.')
  }).catch(e => console.error(e))
    .finally(() => {
      localStorage.setItem(constants.localStorage.storageRevision, revision)
    })
}
