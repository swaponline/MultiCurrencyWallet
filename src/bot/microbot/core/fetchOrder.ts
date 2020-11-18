
// swap.app.services.orders

export default orders => id => {
  return orders.getByKey(id)
}
