export const initialState = {
  orders:[]
}

export const update = (state, payload) => ({
  ...state,
  orders: [
    ...payload,
  ],
})

