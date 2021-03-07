import ws from 'ws'

import REST from '../cli/interface'
import { getOrderId } from './helpers/getOrderId'


class SocketBot {
  isAutoAccepting: boolean
  isAutoSearching: boolean
  ws: ws
  worker: REST

  constructor(worker, url) {
    if (!worker) throw new Error(`Cant init without Worker`)

    this.ws = new ws(url || 'ws://localhost:7333')
    this.worker = worker

    this.isAutoAccepting = false
    this.isAutoSearching = false
  }

  async until(_event) {
    return new Promise (resolve => {
      this.ws.on('message', mess => {
        mess = JSON.parse(mess)

        if (mess.type === _event) resolve(mess.payload)
        if (mess.type === _event) console.dir(mess)
      })
    })
  }

  async fastSwap(payload) {
    let { id } = payload

    id = getOrderId(this.worker.data.orders, id)

    this.worker.requestOrder(payload)
    await this.until('accept swap request')
    // await this.until('decline swap request')

    return this.fire(payload)
  }

  async setAutoAccept(payload) {
    const { disable } = payload
    if (disable || this.isAutoAccepting) return
    this.isAutoAccepting = true

    const cycle = async () => {
      if (!this.isAutoAccepting) return

      const payload = await this.until('new order request')

      this.fire(payload)

      cycle()
    }

    cycle()
  }

  async setAutoSearch(payload) {
    const { minPrice, disable } = payload
    if (disable || this.isAutoSearching) return
    this.isAutoSearching = true

    this.worker.data.orders.map(order => {
      console.log('thinking of ' + order.string)
      this.worker.algo.priceFits(order)
      this.fastSwap(order)
    })


    this.ws.on('new order', mess => {
      if (!this.isAutoSearching) return

      mess = JSON.parse(mess)
      if (mess.type !== 'new order') return

      const order = mess.payload

      console.log('thinking of ' + order.string)
      // also that he has enough balance
      if (this.worker.algo.priceFits(order))
        this.fastSwap(order)
    })

    //
    // while(this.isAutoSearching) {
    //   const order = await this.until('new order')
    //
    //   // algo.is it good?
    //   this.worker.algo.priceFits(order, minPrice)
    //
    //   this.fastSwap(order)
    // }
  }

  async fire(payload) {
    let { id } = payload

    id = getOrderId(this.worker.data.orders, id)

    const { flow } = await this.worker.startSwap(payload)

    return this.worker.runMethod(`swaps/${id}/go`)

    if (flow.type == "BTC2ETH" || flow.type == "BTC2ETHTOKEN") {
      await this.worker.runMethod(`swaps/${id}/sign`)
      await this.worker.runMethod(`swaps/${id}/verify-btc-script`)
    } else if (flow.type == "ETH2BTC" || flow.type == "ETHTOKEN2BTC") {
      await this.worker.runMethod(`swaps/${id}/submit-secret`)
    }

    return this.worker.runMethod(`swaps/${id}`)
  }
}

export default SocketBot
