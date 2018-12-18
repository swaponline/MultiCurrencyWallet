import reducers from 'redux/core/reducers'


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

export default {
  set,
  userJoined,
  userLeft,
  allPeersLoaded,
}
