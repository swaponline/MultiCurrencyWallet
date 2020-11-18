import { getPriceByPair, syncPrices } from '../../app/middlewares/prices'

import { Router } from 'express'
const router = new Router()

router.get('/courses', async  ({ query: { ticker = 'ETH-BTC' } }, res) => {
  const price = await getPriceByPair(ticker)

  res.json(price)
})

router.get('/prices', async (req, res) => {
  const prices = await syncPrices()

  res.json(prices)
})

export default router
