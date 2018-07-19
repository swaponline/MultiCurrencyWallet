export const initialState = {
  isVisible: false,
  text: false,
}

export const setVisibility = (state, payload) => ({
  ...state,
  isVisible: payload.isVisible,
  text: payload.text,
})
