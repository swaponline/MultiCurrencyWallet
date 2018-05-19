export const initialState = {
  visible: true,
}

export const updateLoader = (state, payload) => ({
  ...state, visible: payload,
})
