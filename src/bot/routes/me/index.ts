import { Router } from 'express'

import { balance, getMe, getWallet, getWalletDetailed, withdraw } from './controller'
import { listMyOrders } from '../orders/controller'


const router = Router()


router.get('/', getMe)
router.post('/balance', balance)
router.get('/wallet', getWallet)
router.get('/core', getWalletDetailed)
router.get('/withdraw/:from', withdraw)
router.get('/orders', listMyOrders)


export default router
