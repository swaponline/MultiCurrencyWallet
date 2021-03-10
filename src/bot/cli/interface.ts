import request from 'request-promise-native'

import AlgoTrade from './algo'
import SocketBot from './socket-bot'
import DataWorker from './data-worker'

import { getOrderId } from './helpers/getOrderId'
import { parse } from './helpers/text'


const BASE_URL = 'http://localhost:1337'


class RESTInterface {
  algo: AlgoTrade
  data: DataWorker
  url: string
  
  constructor(url) {
    this.algo = new AlgoTrade()
    this.data = new DataWorker(this)
    this.url = `${url || BASE_URL}`

    this.getOrders()
  }

  // GET
  async runMethod(str) {
    if (!str) str = 'me'

    console.log(`GET ${this.url}/${str}`)
    return await request(`${this.url}/${str}`)
      .then(json => parse(json))
  }

  // POST
  async postMethod(str, data) {
    if (!str) str = 'orders'

    const options = {
      method: 'POST',
      url: `${this.url}/${str}`,
      body: data,
      json: true
    }

    console.log(`POST ${options.url}`)
    return request(options)
      .then(json => parse(json))
  }

  // multicall function

  async callMethod(name, payload) {
    console.log('Calling', name, payload)

    switch (name) {
      case 'rest':      return this.rest(payload)

      case 'create':    return this.createOrder(payload)
      case 'request':   return this.requestOrder(payload)
      case 'accept':    return this.acceptOrder(payload)
      case 'swap':      return this.startSwap(payload)

      case 'fill':      return this.fillOrders(payload)
      case 'fillbook':  return this.fillBook(payload)

      case 'plotbook':  return this.data.plotOrderBook(payload)
      case 'plotbids':  return this.data.plotBids(payload)
      case 'plotasks':  return this.data.plotAsks(payload)
      case 'printbook': return this.data.printOrderBook(payload)

      //case 'autosearch':  return this.ws.setAutoSearch(payload)
      //case 'autoaccept':  return this.ws.setAutoAccept(payload)

      default:          return Promise.resolve('no method')
    }
  }

  async rest(payload) {
    const { url } = payload
    return this.runMethod(url)
      // .then(orders => this.data.setOrders(orders))
  }

  // methods
  async getMe() {
    return this.runMethod('me')
  }

  async getOrders() {
    return this.runMethod('orders')
      .then(orders => this.data.setOrders(orders))
  }

  createOrder(payload) {
    const { buy, sell, buyCurrency, sellCurrency, buyAmount, sellAmount } = payload

    const data = {
      buyCurrency: buy || buyCurrency,
      sellCurrency: sell || sellCurrency,
      buyAmount,
      sellAmount
    }

    return this.postMethod('orders', data)
  }

  requestOrder(payload) {
    let { id } = payload

    id = getOrderId(this.data.orders, id)

    return this.runMethod(`orders/${id}/request`)
  }

  acceptOrder({ id }, peer = '') {
    id = getOrderId(this.data.orders, id)

    return this.runMethod(`orders/${id}/accept/${peer}`)
  }

  startSwap({ id }) {
    id = getOrderId(this.data.orders, id)

    return this.runMethod(`swaps/${id}/go`)
  }

  fillOrders(payload) {
    const orders = this.algo.fillOrders(payload)

    const saving = orders.map(data => this.postMethod('orders', data))

    return Promise.all([...saving])
  }

  fillBook(payload) {
    const orders = this.algo.fillAllOrders(payload)

    const saving = orders.map(data => this.postMethod('orders', data))

    return Promise.all([...saving])
  }

  getOrder({ id }) {
    id = getOrderId(this.data.orders, id)

    return this.runMethod(`orders/${id}`)
  }

  deleteOrder({ id }) {
    id = getOrderId(this.data.orders, id)

    return this.runMethod(`orders/${id}/delete`)
  }

  deleteAll() {
    return this.runMethod(`orders/all/delete`)
  }
}

export default RESTInterface
