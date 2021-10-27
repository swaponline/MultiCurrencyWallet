import config from 'app-config'


export const initialState = {
  isOnline: false,
  isAllPeersLoaded: false,
  onlineUsers: 0,
  serverAddress: config.pubsubRoom.server,
  peer: '',
  reputation: 0,
}

export const set = (state, payload) => ({
  ...state,
  ...payload,
})

/**
 * Событие "Пользователь вошел в сеть".
 */
export const userJoined = state => ({
  ...state,
  onlineUsers: state.onlineUsers + 1,
})

/**
 * Событие "Пользователь вышел из сети".
 */
export const userLeft = state => ({
  ...state,
  onlineUsers: state.onlineUsers - 1,
})

/**
 * Событие "Загрузились все пиры".
 */
export const allPeersLoaded = state => ({
  ...state,
  isAllPeersLoaded: true,
})
