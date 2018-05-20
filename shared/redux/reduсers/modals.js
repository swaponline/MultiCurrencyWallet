export const initialState = {
  open: false,
  name: '',
  data: {},
}

export const open = (state, { name, open, data }) => ({
  ...state,
  open,
  name,
  data: { ...data },
})

export const close = (state, payload) => ({
  ...state,
  open: false,
  name: '',
  data: {},
})
