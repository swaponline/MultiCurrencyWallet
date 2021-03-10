import { Router } from 'express'

import orders from './orders'
import me from './me'
import swaps from './swaps'
import homepage from './homepage'
import kraken from './kraken'
import info from './info'


const router = Router()

router.use('/orders', orders)
router.use('/me', me)
router.use('/swaps', swaps)
router.use('/kraken', kraken)
router.use('/info', info)
router.use('/', homepage)


export default router
