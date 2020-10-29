import EthTokenToBtcLike from './BtcLikeSwap/EthTokenToBtcLike'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'


export default class EthTokenToNext extends EthTokenToBtcLike {
  constructor(props) {
    super({
      ...props,
      fields: {
        currencyName: `NEXT`,
        withdrawTransactionHash: `nextSwapWithdrawTransactionHash`,
        scriptCreatingTransactionHash: `nextScriptCreatingTransactionHash`,
        explorerLink: config.api.nextscan,
        verifyScriptFunc: `verifyNextScript`,
        scriptValues: `nextScriptValues`,
      },
    })
  }
}