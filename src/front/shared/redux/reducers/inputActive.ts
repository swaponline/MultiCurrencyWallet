export const initialState = {
  isInputActive: false,
}

export const setInputActive = (state, value) => ({
  ...state,
  isInputActive: value,
})
