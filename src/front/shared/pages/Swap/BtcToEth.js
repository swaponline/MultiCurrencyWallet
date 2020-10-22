import BtcLikeToEth from './BtcLikeSwap/BtcLikeToEth'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'



export default class BtcToEth extends BtcLikeToEth {
  constructor(props) {
    super({
      ...props,
      fields: {
        currencyName: `BTC`,
        withdrawTransactionHash: `btcSwapWithdrawTransactionHash`,
        scriptCreatingTransactionHash: `btcScriptCreatingTransactionHash`,
        explorerLink: config.api.blockcypher,
        verifyScriptFunc: `verifyBtcScript`,
        scriptValues: `btcScriptValues`,
      },
    })
  }
}