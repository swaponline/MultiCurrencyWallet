export const initialState = {
  isVisible: false,
  data: {},
}

export const setVisibility = (state, payload) => ({
  ...state,
  isVisible: payload.isVisible,
  data: {
    text: payload.text,
    txId: payload.txId,
  },
})
