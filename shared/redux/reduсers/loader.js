export const initialState = {
  isVisible: false,
}

export const setVisibility = (state, payload) => ({
  ...state,
  isVisible: payload,
})
