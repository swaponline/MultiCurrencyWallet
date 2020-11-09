export const initialState = {
  isDisplayingTable: false,
}

export const setIsDisplayingTable = (state, payload) => ({
  ...state,
  isDisplayingTable: payload,
})
