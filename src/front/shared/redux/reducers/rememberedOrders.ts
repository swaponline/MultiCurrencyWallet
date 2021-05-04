const initialState = {
  //@ts-ignore: strictNullChecks
  savedOrders: JSON.parse(localStorage.getItem('savedOrders')) || [],
  //@ts-ignore: strictNullChecks
  deletedOrders: JSON.parse(localStorage.getItem('deletedOrders')) || [],
}

const savedOrders = (state, orderId) => ({
  savedOrders: [
    ...state.savedOrders,
    orderId,
  ],
})

const deletedOrders = (state, orderId) => ({
  ...state,
  deletedOrders: [
    orderId,
  ],
})

const forgetOrders = (state, orderId) => ({
  ...state,
  savedOrders: state.savedOrders.filter(item => item !== orderId),
})

const getOrderIntheProcess = (state, orderId) => ({
  ...state,
  savedOrders: state.savedOrders.filter(item => item === orderId),
})

export {
  initialState,
  savedOrders,
  forgetOrders,
  deletedOrders,
  getOrderIntheProcess,
}
