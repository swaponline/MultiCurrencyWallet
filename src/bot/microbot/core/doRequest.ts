export default orders => async order =>
  new Promise(resolve => order.sendRequest(resolve))
