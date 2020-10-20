import EthToBtcLike from './EthToBtcLike'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'


export default class EthToNext extends EthToBtcLike {
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