const getOrderId = (orders, id) => {
  if ( !isNaN(parseInt(id)) ) {
    const index = parseInt(id)

    if (index <= 0)
    throw new Error(`Only positive indices allowed: ${index}`)

    const order = orders[index - 1]

    if (!order)
    throw new Error(`No such order: ${index}`)

    id = order.id

    if ( !id || id[0] != 'Q' )
    throw new Error(`Wrong ID format: ${id}`)
  }

  return id
}

export default { getOrderId }
