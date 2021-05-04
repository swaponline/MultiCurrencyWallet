import reducers from 'redux/core/reducers'
import { getState } from 'redux/core'
import SwapApp from 'swap.app'


const set = payload => {
  reducers.pubsubRoom.set(payload)
}

const userJoined = () => {
  reducers.pubsubRoom.userJoined()
}

const userLeft = () => {
  reducers.pubsubRoom.userLeft()
}

const allPeersLoaded = () => {
  reducers.pubsubRoom.allPeersLoaded()
}

const onReady = (cb) => {
  const _checkFunc = () => {
    const { pubsubRoom : { isOnline } } = getState()
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
        //@ts-ignore: strictNullChecks
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
