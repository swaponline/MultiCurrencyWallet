export const initialState = {
  isSigned: false,
}

export const setInputActive = (state, value) => ({
  ...state,
  isInputActive: value,
})
