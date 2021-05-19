import api from './api'
import link from './link'

export default {
  BTC: {
    withdrawTransactionHash: `utxoSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `utxoScriptCreatingTransactionHash`, // @to-do - remove this - use directly
    explorerLink: link.bitpay,
    verifyScriptFunc: `verifyScript`, // @to-do - remove this - use directly
    scriptValues: `utxoScriptValues`, // @to-do - remove this - use directly utxoScriptValues
  },
  NEXT: {
    withdrawTransactionHash: `utxoSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `utxoScriptCreatingTransactionHash`,
    explorerLink: api.nextscan,
    verifyScriptFunc: `verifyScript`,
    scriptValues: `utxoScriptValues`,
  },
  GHOST: {
    withdrawTransactionHash: `utxoSwapWithdrawTransactionHash`,
    scriptCreatingTransactionHash: `utxoScriptCreatingTransactionHash`,
    explorerLink: api.ghostscan,
    verifyScriptFunc: `verifyScript`,
    scriptValues: `utxoScriptValues`,
  },
}