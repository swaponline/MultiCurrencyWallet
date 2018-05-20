export const initialState = {
  name: '',
  open: false,
  data: {},
}

export const update = (state, { name, open, data }) => ({
  ...state,
  name,
  open,
  data: { ...data },
})

