import api from './api'


export default {
  BTC: {
    withdrawTransactionHash: `btcSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `btcScriptCreatingTransactionHash`,
    explorerLink: api.blockcypher,
    verifyScriptFunc: `verifyScript`, // @to-do - remove this - use directly
    scriptValues: `utxoScriptValues`, // @to-do - remove this - use directly utxoScriptValues
  },
  NEXT: {
    withdrawTransactionHash: `nextSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `nextScriptCreatingTransactionHash`,
    explorerLink: api.nextscan,
    verifyScriptFunc: `verifyScript`,
    scriptValues: `utxoScriptValues`,
  },
  GHOST: {
    withdrawTransactionHash: `ghostSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `ghostScriptCreatingTransactionHash`,
    explorerLink: api.ghostscan,
    verifyScriptFunc: `verifyScript`,
    scriptValues: `utxoScriptValues`,
  },
}