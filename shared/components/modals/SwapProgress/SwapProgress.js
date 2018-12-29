import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from './SwapProgress.scss'

import QR from 'components/QR/QR'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'


const title = defineMessages({
  SwapProgress: {
    id: 'SwapProgress',
    defaultMessage: 'SwapProgress',
  },
})

@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class SwapProgress extends React.Component {

  // TODO add animation css

  handleStepChangeImage = (step) => {
    // eslint-disable-next-line
    const icon = require(`./images/icon${step}.gif`)
    return <img src={icon} alt="step" />
  }

  handleStepEthToBtc = (step) => {
    switch (step) {
      case 1:
        return (
          <FormattedMessage id="SwapProgress32" defaultMessage="Please wait. Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage id="SwapProgress38" defaultMessage="Waiting BTC Owner creates Secret Key, creates BTC Script and charges it" />
        )
      case 3:
        return (
          <FormattedMessage id="SwapProgress44" defaultMessage="Bitcoin Script created and charged. Please check the information below" />
        )
      case 4:
        return (
          <FormattedMessage id="SwapProgress50" defaultMessage="Checking balance.." />
        )
      case 5:
        return (
          <FormattedMessage id="SwapProgress56" defaultMessage="Creating Ethereum Contract. Please wait, it will take a while" />
        )
      case 6:
        return (
          <FormattedMessage id="SwapProgress62" defaultMessage="Waiting BTC Owner adds Secret Key to ETH Contact" />
        )
      case 7:
        return (
          <FormattedMessage id="SwapProgress68" defaultMessage="Money was transferred to your wallet. Check the balance." />
        )
      case 8:
        return (
          <FormattedMessage id="SwapProgress74" defaultMessage="Thank you for using Swap.Online" />
        )
      case 9:
        return (
          <FormattedMessage id="SwapProgress80" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  handleStepBtcToEth = (step, flow) => {
    switch (step) {
      case 1:
        return (
          <FormattedMessage id="SwapProgress93" defaultMessage="The order creator is offline. Waiting for him.." />
        )
      case 2:
        return (
          <FormattedMessage id="SwapProgress99" defaultMessage="Create a secret key" />
        )
      case 3:
        return (
          <FormattedMessage id="SwapProgress105" defaultMessage="Checking balance.." />
        )
      case 4:
        return (
            <FormattedMessage id="SwapProgress111" defaultMessage="Creating Bitcoin Script. Please wait, it will take a while" />
        )
      case 5:
        return (
          <FormattedMessage id="SwapProgress119" defaultMessage="ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract" />
        )
      case 6:
        return (
          <div>
            <FormattedMessage id="SwapProgress135" defaultMessage="ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait" />
          </div>
        )
      case 7:
        return  (
          <FormattedMessage id="SwapProgress129" defaultMessage="Money was transferred to your wallet. Check the balance." />
        )
      case 8:
        return (
          <FormattedMessage id="SwapProgress80" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }



  render() {
    const { props: { name, intl } } = this
    const progress = Math.floor(360 / this.props.data.stepNumbers * this.props.data.flow.step)

    return (
      <Modal name={name} title={intl.formatMessage(title.SwapProgress)}>
        <div styleName="content">
          <div styleName="overlay">
            <div styleName="container">
              <span styleName="steps">{this.props.data.flow.step} / {this.props.data.stepNumbers} steps</span>
              <div styleName="stepContainer">
                <div>
                  <strong styleName="swapInfo">
                    {this.props.data.swapInfo.sellAmount}{' '}
                    {this.props.data.swapInfo.sellCurrency} &#10230; 
                    {' '}{this.props.data.swapInfo.buyAmount}{' '}
                    {this.props.data.swapInfo.buyCurrency}
                  </strong>
                </div>
                <div styleName={progress > 180 ? 'progress-pie-chart gt-50' : 'progress-pie-chart'}>
                  <div styleName="ppc-progress">
                    <div styleName="ppc-progress-fill" style={{ transform: `rotate(${progress}deg)` }} />
                  </div>
                </div>
                <div styleName="step">
                  <div styleName="stepImg">
                    {this.handleStepChangeImage(this.props.data.flow.step)}
                  </div>
                  <div styleName="stepInfo">
                    {
                      this.props.data.name === 'BTC2ETH' && <h1 styleName="stepHeading">{this.handleStepBtcToEth(this.props.data.flow.step, this.props.data.flow)}</h1>
                    }
                    {
                      this.props.data.name === 'ETH2BTC' && <h1 styleName="stepHeading">{this.handleStepEthToBtc(this.props.data.flow.step, this.props.data.flow)}</h1>
                    }
                    <div styleName="transactionWrap">
                      {
                        this.props.data.flow.btcScriptCreatingTransactionHash && (
                          <strong styleName="transaction">
                            <FormattedMessage id="SwapProgress98" defaultMessage="btcScriptCreatingTransactionHash: " />
                            <a href={`${config.link.bitpay}/tx/${this.props.data.flow.btcScriptCreatingTransactionHash}`} target="_blank" rel="noopener noreferrer">
                              {this.props.data.flow.btcScriptCreatingTransactionHash}
                            </a>
                          </strong>
                        )
                      }
                      {
                        this.props.data.flow.ethSwapCreationTransactionHash && (
                          <strong styleName="transaction">
                            <FormattedMessage id="SwapProgress110" defaultMessage="ethSwapCreationTransactionHash: " />
                            <a
                              href={`${config.link.etherscan}/tx/${this.props.data.flow.ethSwapCreationTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {this.props.data.flow.ethSwapCreationTransactionHash}
                            </a>
                          </strong>
                        )
                      }
                      {
                        this.props.data.flow.ethSwapWithdrawTransactionHash && (
                          <strong styleName="transaction">
                            <FormattedMessage id="SwapProgress126" defaultMessage="ethSwapWithdrawTransactionHash: " />
                            <a
                              href={`${config.link.etherscan}/tx/${this.props.data.flow.ethSwapWithdrawTransactionHash}`}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              {this.props.data.flow.ethSwapWithdrawTransactionHash}
                            </a>
                          </strong>
                        )
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}