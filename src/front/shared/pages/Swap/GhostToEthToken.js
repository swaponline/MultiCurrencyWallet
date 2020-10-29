import BtcLikeToEthToken from './BtcLikeSwap/BtcLikeToEthToken'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'



export default class GhostToEthToken extends BtcLikeToEthToken {
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