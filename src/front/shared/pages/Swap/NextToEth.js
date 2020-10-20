import BtcLikeToEth from './BtcLikeToEth'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'



export default class NextToEth extends BtcLikeToEth {
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