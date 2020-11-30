import SwapApp from 'swap.app'
import debug from 'debug'

let app

const checkHistoryInit = (_app) => {
  if (!_app) throw new Error(`history not initialized: call history.init(app)`)
}

export const init = (_app) => {
  SwapApp.required(_app)

  app = _app
}

const save = (swapID, storageKey = 'history') => {
  checkHistoryInit(app)

  const storage = app.env.storage

  const history = storage.getItem(storageKey) || []

  try {
    if (history.filter(_swapID => _swapID === swapID).length > 0) {
      return debug('swap.core:simple:history')(`${storageKey}: swap already saved id = ${swapID}`)
    }

    const newHistory = [ ...history, swapID ]

    storage.setItem(storageKey, newHistory)

    debug('swap.core:simple:history')(`${storageKey}: saved swap = ${swapID}`)
  } catch (err) {
    debug('swap.core:simple:history')('Error:', `${storageKey}: ${err}`)
    debug('swap.core:simple:history')('Error:', `${storageKey}: cannot save swap.history, rewind back`)
  }
}

const remove = (swapID, storageKey = 'history') => {
  checkHistoryInit(app)

  const storage = app.env.storage

  const history = storage.getItem(storageKey) || []

  try {
    if (history.filter(_swapID => _swapID === swapID).length == 0) {
      return debug('swap.core:simple:history')(`${storageKey}: swap not saved id = ${swapID} cant remove`)
    }

    const newHistory = history.filter(_swapID => _swapID !== swapID)

    storage.setItem(storageKey, newHistory)

    debug('swap.core:simple:history')(`${storageKey}: remove swap = ${swapID}`)
  } catch (err) {
    debug('swap.core:simple:history')('Error:', `${storageKey}: ${err}`)
    debug('swap.core:simple:history')('Error:', `${storageKey}: cannot save swap.history, rewind back`)
  }
}

const getAll = (storageKey = 'history') => {
  checkHistoryInit(app)

  const storage = app.env.storage

  const history = storage.getItem(storageKey) || []

  debug('swap.core:simple:history')(`${storageKey}: history = ${history}`)

  return history
}

export const saveInProgress = (swapID) => save(swapID, 'history.inProgress')
export const removeInProgress = (swapID) => remove(swapID, 'history.inProgress')
export const getAllInProgress = () => getAll('history.inProgress')

export const saveFinished = (swapID) => save(swapID, 'history.finished')
export const removeFinished = (swapID) => remove(swapID, 'history.finished')
export const getAllFinished = () => getAll('history.finished')

export default {
  init,

  save,
  remove,
  getAll,

  saveInProgress,
  removeInProgress,
  getAllInProgress,

  saveFinished,
  removeFinished,
  getAllFinished
}
