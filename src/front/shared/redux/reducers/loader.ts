export const initialState = {
  isVisible: false,
  data: {},
}

export const setVisibility = (state, { isVisible, data }) => ({
  ...state,
  isVisible,
  data,
})
