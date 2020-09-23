import reducers from 'redux/core/reducers'
import { getState } from 'redux/core'
import SwapApp from 'swap.app'


const set = payload => {
  reducers.ipfs.set(payload)
}

const userJoined = () => {
  reducers.ipfs.userJoined()
}

const userLeft = () => {
  reducers.ipfs.userLeft()
}

const allPeersLoaded = () => {
  reducers.ipfs.allPeersLoaded()
}

const onReady = (cb) => {
  const _checkFunc = () => {
    const { ipfs : { isOnline } } = getState()
    if (isOnline) {
      cb()
    } else {
      setTimeout(_checkFunc, 100)
    }
  }
  _checkFunc()
}

const waitPeer = (peer, cbSuccess, cbFail, timeOut) => {
  onReady(() => {
    let isWaiting = true

    const failtTimer = setTimeout(() => {
      isWaiting = false
      if (cbFail) cbFail()
    }, timeOut)

    const waitFunc = () => {
      if (isWaiting) {
        if (SwapApp.shared().services.room.connection.hasPeer(peer)) {
          clearTimeout(failtTimer)
          if (cbSuccess) cbSuccess()
        } else {
          setTimeout(waitFunc, 100)
        }
      }
    }
    waitFunc()
  })
}

export default {
  set,
  userJoined,
  userLeft,
  allPeersLoaded,
  onReady,
  waitPeer,
}
