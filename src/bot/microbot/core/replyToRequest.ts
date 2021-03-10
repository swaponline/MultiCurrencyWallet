import fetchOrder from './fetchOrder'


// swap.app.services.orders
export default (orders) => (request, accepted) => {
  console.log(new Date().toISOString(), `trying to accept`, request, accepted)

  const { orderId: id, participant: { peer } } = request

  const order = fetchOrder(orders)(id)

  if (accepted) {
    order.acceptRequest(peer)
  } else {
    order.declineRequest(peer)
  }
}
