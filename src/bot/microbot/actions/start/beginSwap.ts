// import Error from './error'
// import ReportState from './state'
import BigNumber from 'bignumber.js'
import { get, start } from '../../core/beginSwap'
import history from '../../core/history'
import handleError from '../../../app/actions/errors/handleError'
import handleSwapError from '../../../app/actions/errors/handleSwapError'
import kraken from '../../../services/instances/kraken'
import Pair from '../../Pair'
import { debugFeedBack } from '../../../helpers/debugFeedBack'
import { canBeDeleted, needsRefund } from './swapStatus'
import { getNoxonPrice } from '../../../app/middlewares/prices'

import { UTXO2ETHFlow, ETH2UTXOFlow } from '../swap-flow'

import { checkSwapsCountLimit } from '../../core/checkSwapsCountLimit'
import { removeMyOrders } from '../../core/orders'

import request from 'request-promise-cache'
import { COIN_DATA, COIN_MODEL, COIN_TYPE } from 'swap.app/constants/COINS'



export default (app, { id }, callback) => {
  let swap
  console.log(new Date().toISOString(), `begin swap ${id}`)
  try {
    swap = get(app, id)

    history.saveInProgress(swap.id)

    callback(swap)


    const flowName = swap.flow._flowName

    // @ToDo - DONT DELETE THIS CODE!. Can exists token MY2YTOKEN and then flow MY2YTOKEN2BTC break swap
    //const main = swap.flow.getFromName()
    //const base = swap.flow.getToName()
    const [ main, base ] = flowName.split('2')

    if (!main || !base) {
      throw new Error(`Cannot parse flow: ${flowName} ?= ${main}2${base}`)
    }

    const mainIsUTXO = (
      COIN_DATA
      && COIN_DATA[main]
      && COIN_DATA[main].model === COIN_MODEL.UTXO
    ) ? true : false

    const baseIsUTXO = (
      COIN_DATA
      && COIN_DATA[base]
      && COIN_DATA[base].model === COIN_MODEL.UTXO
    )

    const goFlow = (mainIsUTXO) ? UTXO2ETHFlow : ETH2UTXOFlow

    if (baseIsUTXO && process.env.MIN_AMOUNT_FORCONFIRM) {
      getNoxonPrice(main, 'USD').then((usdPrice) => {
        const minAmount = new BigNumber(process.env.MIN_AMOUNT_FORCONFIRM)
        if (usdPrice.multipliedBy(swap.sellAmount).isGreaterThanOrEqualTo(minAmount)) {
          swap.needWaitConfirm()
        }
      })
    }

    console.log(new Date().toISOString(), `started ${main}2${base} ${swap.id} ${goFlow.name}`)


    swap.on('enter step', step => {
      console.log(new Date().toISOString(), '[SWAP ' + swap.id + '] enter step', step)

      if (step >= 2) {
        const swapInfo = 'swap step '+step+' buy '+swap.buyCurrency+' '+swap.buyAmount.toString()+ ' sell '+swap.sellCurrency+' ' + swap.sellAmount.toString()
        debugFeedBack(swapInfo)

      }

      const pair = Pair.fromOrder(swap)

      if (step === 2) {
        // Second step - swap started - check limit for paraller swaps and remove orders if necesy
        if (!checkSwapsCountLimit()) {
          removeMyOrders(app.services.orders)
        }
        if (pair.ticker === 'GHOST2BTC') {
          // set destination wallet
          swap.setDestinationBuyAddress('16BZguAz5U6QVxu1Nan6adWRoPxzQfG464')
        }
      }

      if (swap.flow.state.isFinished) {
        if (pair.ticker === 'ETH-BTC') {
          // @ToDo - fix
          //kraken.createOrder(pair.amount.div(pair.price).toNumber(), pair.isBid() ? 'sell' : 'buy')
        }
      }

    })

    const update = async () => {

      if (await canBeDeleted(swap)) {
        console.log(new Date().toISOString(), `swap finished! remove ${swap.id}`)
        history.removeInProgress(swap.id)
        history.saveFinished(swap.id)
        //@ts-ignore
        return clearInterval(update)
      }

      if (needsRefund(swap)) {
        console.log(new Date().toISOString(), `swap needs refund: ${swap.id}, trying...`)
        const result = await swap.flow.tryRefund()
        console.log(new Date().toISOString(), `swap refund:`, result)
        return setTimeout(update, 5000)
      } else {
        console.log(new Date().toISOString(), `swap does not need refund: ${swap.id}`)
      }

      try {
        goFlow(swap)
      } catch (error) {
        handleSwapError(swap, error)

        const { name, message } = error
        console.error(new Date().toISOString(), `[${swap.id}]: `, name, message)
      } finally {
        setTimeout(update, 5000)
      }

    }

    setTimeout(update, 0)

  } catch (err) {
    console.error(new Date().toISOString(), `[ERROR] swap id=${swap && swap.id} step=${swap && swap.flow.state.step}`)

    return handleError(err)
  }
}
