import api from './api'


export default {
  BTC: {
    withdrawTransactionHash: `btcSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `btcScriptCreatingTransactionHash`,
    explorerLink: api.blockcypher,
    verifyScriptFunc: `verifyBtcScript`,
    scriptValues: `btcScriptValues`,
  },
  NEXT: {
    withdrawTransactionHash: `nextSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `nextScriptCreatingTransactionHash`,
    explorerLink: api.nextscan,
    verifyScriptFunc: `verifyNextScript`,
    scriptValues: `nextScriptValues`,
  },
  GHOST: {
    withdrawTransactionHash: `ghostSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `ghostScriptCreatingTransactionHash`,
    explorerLink: api.ghostscan,
    verifyScriptFunc: `verifyGhostScript`,
    scriptValues: `ghostScriptValues`,
  },
}