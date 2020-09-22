const { Router } = require('express')
const router = new Router()

const orders = require('./orders')
const me = require('./me')
const swaps = require('./swaps')
const homepage = require('./homepage')
const kraken = require('./kraken')
const info = require('./info')

router.use('/orders', orders)
router.use('/me', me)
router.use('/swaps', swaps)
router.use('/kraken', kraken)
router.use('/info', info)
router.use('/', homepage)


module.exports = router
