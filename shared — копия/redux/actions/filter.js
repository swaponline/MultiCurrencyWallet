import reducers from 'redux/core/reducers'


const setFilter = (filter) => {
  reducers.history.setFilter(filter)
}

const ordersFilter = (filter) => {
  reducers.orders.ordersFilter(filter)
}


export default {
  setFilter,
  ordersFilter,
}
