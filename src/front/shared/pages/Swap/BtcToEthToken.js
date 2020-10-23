import BtcLikeToEthToken from './BtcLikeSwap/BtcLikeToEthToken'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'



export default class BtcToEthToken extends BtcLikeToEthToken {
  constructor(props) {
    console.log('BtcToEthToken')
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