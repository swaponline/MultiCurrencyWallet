import EthTokenToBtcLike from './BtcLikeSwap/EthTokenToBtcLike'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'



export default class EthTokenToBtc extends EthTokenToBtcLike {
  constructor(props) {
    console.log('EthTokenToBtc')
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