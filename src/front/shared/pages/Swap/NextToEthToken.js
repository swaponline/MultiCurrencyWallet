import BtcLikeToEthToken from './BtcLikeSwap/BtcLikeToEthToken'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'


export default class NextToEthToken extends BtcLikeToEthToken {
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