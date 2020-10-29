import BtcLikeToEth from './BtcLikeSwap/BtcLikeToEth'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'



export default class GhostToEth extends BtcLikeToEth {
  constructor(props) {
    super({
      ...props,
      fields: {
        currencyName: `GHOST`,
        withdrawTransactionHash: `ghostSwapWithdrawTransactionHash`,
        scriptCreatingTransactionHash: `ghostScriptCreatingTransactionHash`,
        explorerLink: config.api.ghostscan,
        verifyScriptFunc: `verifyGhostScript`,
        scriptValues: `ghostScriptValues`,
      },
    })
  }
}