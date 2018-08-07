export const initialState = {
  orders: [],
  filter: 'ALL',
}


export const getOrders = (state, {  orders }) => ({
  ...state,
  orders,
})

export const setFilter = (state, { filter }) => ({
  ...state,
  orders: [
    ...state.orders,
  ],
  filter,
})
