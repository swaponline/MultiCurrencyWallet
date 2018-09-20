export const initialState = {
  isVisible: false,
  text: false,
  txId: null,
  swap: false,
  data: null,
}

export const setVisibility = (state, payload) => ({
  ...state,
  isVisible: payload.isVisible,
  text: payload.text,
  txId: payload.txId,
  swap: payload.swap,
  data: payload.data,
})
