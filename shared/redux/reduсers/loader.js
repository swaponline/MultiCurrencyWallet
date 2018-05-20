export const initialState = {
  visible: true,
}

export const update = (state, payload) => ({
  ...state, visible: false,
})
