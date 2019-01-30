export const initialState = {
  isSigned: false,
}

export const setSigned = (state) => ({
  ...state,
  isSigned: true,
})
