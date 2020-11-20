import EthToBtcLike from './BtcLikeSwap/EthToBtcLike'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'



export default class EthToBtc extends EthToBtcLike {
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