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

export default {
  set,
  userJoined,
  userLeft,
}
