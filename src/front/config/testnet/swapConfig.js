import api from './api'


export default {
  BTC: {
    withdrawTransactionHash: `btcSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `btcScriptCreatingTransactionHash`,
    explorerLink: api.blockcypher,
    verifyScriptFunc: `verifyBtcScript`,
    scriptValues: `utxoScriptValues`, // @to-do - remove this - use in code utxoScriptValues
  },
  NEXT: {
    withdrawTransactionHash: `nextSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `nextScriptCreatingTransactionHash`,
    explorerLink: api.nextscan,
    verifyScriptFunc: `verifyNextScript`,
    scriptValues: `utxoScriptValues`,
  },
  GHOST: {
    withdrawTransactionHash: `ghostSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `ghostScriptCreatingTransactionHash`,
    explorerLink: api.ghostscan,
    verifyScriptFunc: `verifyGhostScript`,
    scriptValues: `utxoScriptValues`,
  },
}