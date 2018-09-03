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

const hideIPFSWidget = () => {
  reducers.ipfs.hideIPFSWidget()
}

export default {
  set,
  userJoined,
  userLeft,
  hideIPFSWidget,
}
