import { Router } from 'express'

import {
  getSwap,
  getState,
  goSwap,
  getSwapFormated,
  refund,

  nextStep,
  withSwap,
  sign,
  verifyScript,
  submitSecret,
  syncBalance,
  tryWithdraw,

  getInProgress,
  getFinished,
} from './controller'


const router = Router()

router.get('/finished', getFinished)
router.get('/in-progress', getInProgress)

router.get('/:id', getSwap)

router.get('/:id/formated', getSwapFormated)
router.get('/:id/flow', getState)
router.get('/:id/go', goSwap)
router.get('/:id/auto', goSwap)
router.get('/:id/refund', refund)

router.get('/:id/sign', withSwap(sign))
router.get('/:id/next-step', withSwap(nextStep))
router.get('/:id/submit-secret', withSwap(submitSecret))
router.get('/:id/verify-script', withSwap(verifyScript))
router.get('/:id/sync-balance', withSwap(syncBalance))
router.get('/:id/try-withdraw', withSwap(tryWithdraw))


export default router
