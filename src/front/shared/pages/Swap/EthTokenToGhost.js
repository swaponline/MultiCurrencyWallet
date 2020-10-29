import EthTokenToBtcLike from './BtcLikeSwap/EthTokenToBtcLike'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'


export default class EthTokenToGhost extends EthTokenToBtcLike {
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