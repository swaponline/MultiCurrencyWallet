export const initialState = {
  filter: 'none',
}


export const ordersFilter = (state, payload) => ({
  filter: payload,
})
