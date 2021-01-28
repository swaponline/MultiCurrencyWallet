import reducers from 'redux/core/reducers'
import { getState } from 'redux/core'


const addItemToFeed = (feeds) => {
  const filteredFeeds = feeds.filter(f => f.request.length !== 0)
  reducers.feeds.addItems(filteredFeeds)
}

const deleteItemToFeed = (orderId) => {
  const { feeds } = getState()

  const filteredFeeds = Object.keys(feeds)
    .map(k => feeds[k])
    .filter(f => f.id === orderId)

  reducers.feeds.deleteItems(filteredFeeds)
}

const getFeedDataFromOrder = (orders) => {
  const feeds = orders.map(order => ({
    peer: order.owner.peer,
    id: order.id,
    isTurbo: order.isTurbo,
    content:{
      sellCurrency: order.sellCurrency,
      buyCurrency: order.buyCurrency,
      sellAmount: order.sellAmount,
      buyAmount: order.buyAmount,
    },
    request: order.requests,
  }))

  addItemToFeed(feeds)
}


export default {
  getFeedDataFromOrder,
  deleteItemToFeed,
}
