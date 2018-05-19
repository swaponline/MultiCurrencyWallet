export const initialState = {
  name: '',
  open: false,
}

export const openModal = (state, payload) => ({
  ...state,
  name: payload.name,
  open: payload.open,
  ...payload.data,
})

export const closeModal = (state, payload) => ({
  ...state,
  name: '',
  open: false,
})
