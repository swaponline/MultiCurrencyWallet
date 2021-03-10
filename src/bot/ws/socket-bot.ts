import ws from 'ws'


const checkOrderID = ({ id, orderId }) => {
  if (id) return { id }
  if (orderId) return { id: orderId }

  throw new Error(`Wrong ID format: ${id}, ${orderId}`)
}

class SocketBot {
  ws: any
  rest: any
  isAutoAccepting: boolean
  isAutoSearching: boolean

  constructor(rest, url, auto) {
    if (!rest) throw new Error (`Cant init without Worker`)

    this.ws = new ws(url || 'ws://localhost:7333')
    this.rest = rest

    this.isAutoAccepting = auto.accept
    this.isAutoSearching = auto.search
  }

  on(_event, handle) {
    this.ws.on('message', (mess) => {
      try {
        mess = JSON.parse(mess)
        if (mess.event === _event) {
          console.dir(mess)
          handle(mess.payload)
        }
      } catch (err) {
        console.error(`Error parsing:`, mess, err.name, err.message, err)
      }
    })
  }

  async until(_event) {
    return new Promise((resolve, reject) => {
      setTimeout(reject, 60 * 1000 * 5)
      this.on(_event, payload => resolve(payload))
    })
  }

  async mainCycle() {
    await this.until('ready')

    this.on('new order', order => this.maybeSwap(order))
    this.on('new orders', orders =>
      orders.map(order => this.maybeSwap(order)))

    this.on('new order request', request => this.maybeAccept(request))

    const priceUpdate = setInterval(async () => {
      await this.rest.algo.syncPrices()
      this.rest.deleteAll()
      this.rest.fillBook({ total: 0.01 })
    }, 60 * 1000)
  }

  async maybeSwap(order) {
    console.log('maybe swap order', order.id)
    console.log('maybe swap order processing', order.isProcessing)

    const { id } = checkOrderID(order)

    if (!order.buyAmount) throw new Error(`Not enought order info ${JSON.stringify(order)}`)

    if (order.isRequested) {
      return this.fire(order)
    }

    // one order cannot be used for multiple swaps, choose another order
    if (order.isProcessing) return

    const doRequest = this.rest.algo.priceFits(order)

    console.log('request', doRequest)

    if (!doRequest) return

    setTimeout(() => this.rest.requestOrder({ id }), 500)

    await this.until('accept swap request')

    return this.fire(order)
  }

  async maybeAccept(request) {
    const { orderId, peer } = request

    console.log('maybe accept', orderId)

    if (!orderId) return

    const id = orderId
    const order = await this.rest.getOrder({ id })


    console.log('maybe accept order, processing', order.isProcessing)
    if (order.isProcessing) {
      return
    }

    await this.rest.createOrder(order)
    await this.rest.acceptOrder({ id }, peer)

    return this.fire(order)
  }

  async fire({ id }) {
    const swap = await this.rest.startSwap({ id })

    console.log('flow', swap.flow)

    const update = setInterval(async () => {
      const swap = await this.rest.runMethod(`swaps/${id}`)

      console.log('flow', swap.flow)

      const { step } = swap.flow

      switch (step) {
        case 3:
        case 4:
          const { isBalanceEnough, balance } = swap.flow
          if (isBalanceEnough === false && balance)
            console.error(`Not enough balance: ${balance}`)
          return

        default:
          const { isEthWithdrawn, isbtcWithdrawn, isFinished } = swap.flow

          if (isFinished || isEthWithdrawn && isbtcWithdrawn) {
            clearInterval(update)
            console.log(`[SWAP] finished ${id}`)
          }

          if (isEthWithdrawn || isbtcWithdrawn) {
            const { utxoSwapWithdrawTransactionHash, ethSwapWithdrawTransactionHash } = swap.flow

            setTimeout(() => {
              console.error(`Swap stalled, remove. ID=${swap.id}`)
              console.error(`BTC withdraw: ${utxoSwapWithdrawTransactionHash}`)
              console.error(`ETH withdraw: ${ethSwapWithdrawTransactionHash}`)

              clearInterval(update)
            }, 60 * 1000)
          }
      }
    }, 5000)

    return swap
  }
}

export default SocketBot
