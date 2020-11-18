const { Router } = require('express')
const router = new Router()

const {
  getSwap,
  getState,
  goSwap,
  refund,

  nextStep,
  withSwap,
  sign,
  verifyBtcScript,
  submitSecret,
  syncBalance,
  tryWithdraw,

  getInProgress,
  getFinished,
} = require('./controller')

router.get('/finished', getFinished)
router.get('/in-progress', getInProgress)

router.get('/:id', getSwap)
router.get('/:id/flow', getState)
router.get('/:id/go', goSwap)
router.get('/:id/auto', goSwap)
router.get('/:id/refund', refund)

router.get('/:id/sign', withSwap(sign))
router.get('/:id/next-step', withSwap(nextStep))
router.get('/:id/submit-secret', withSwap(submitSecret))
router.get('/:id/verify-btc-script', withSwap(verifyBtcScript))
router.get('/:id/sync-balance', withSwap(syncBalance))
router.get('/:id/try-withdraw', withSwap(tryWithdraw))

module.exports = router
