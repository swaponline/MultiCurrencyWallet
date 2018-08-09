export const initialState = {
  isVisible: false,
  text: false,
  txId: null,
}

export const setVisibility = (state, payload) => ({
  ...state,
  isVisible: payload.isVisible,
  text: payload.text,
  txId: payload.txId,
})
