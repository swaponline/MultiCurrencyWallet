export const initialState = {
  name: '',
  open: false,
  data: {},
}

export const updateNotification = (state, payload) => ({
  ...state,
  name: payload.name,
  open: payload.open,
  data: payload.data,
})
