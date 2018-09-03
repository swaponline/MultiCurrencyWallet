export const initialState = {
  isOnline: false,
  onlineUsers: 0,
  server: null,
  peer: '',
  isVisibleIPFSWidget: true,
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
 * Событие "Скрыть виджет IPFS".
 */
export const hideIPFSWidget = state => ({
  ...state,
  isVisibleIPFSWidget: false,
})
