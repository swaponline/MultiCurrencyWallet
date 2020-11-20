import EthToBtcLike from './BtcLikeSwap/EthToBtcLike'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'



export default class EthToGhost extends EthToBtcLike {
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