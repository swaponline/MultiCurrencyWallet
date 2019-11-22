import reducers from 'redux/core/reducers'
import { getState } from 'redux/core'


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


export default {
  set,
  userJoined,
  userLeft,
  allPeersLoaded,
  onReady,
}
