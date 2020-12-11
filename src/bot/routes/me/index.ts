import { Router } from 'express'
//@ts-ignore
const router = new Router()

import { balance, getMe, getWallet, getWalletDetailed, withdraw } from './controller'
import { listMyOrders } from '../orders/controller'

router.get('/', getMe)
router.post('/balance', balance)
router.get('/wallet', getWallet)
router.get('/core', getWalletDetailed)
router.get('/withdraw/:from', withdraw)
router.get('/orders', listMyOrders)

export default router
