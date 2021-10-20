import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import componentStyles from './DirectSwap.scss'
import constants from 'common/helpers/constants'
import Link from 'local_modules/sw-valuelink'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import { externalConfig, transactions, routing } from 'helpers'
import actions from 'redux/actions'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import { Button } from 'components/controls'
import InputRow from './InputRow'

type ComponentProps = {
  spendedAmount: string
  receivedAmount: string
  closeDirectSwap: () => void
  fromWallet: IUniversalObj
  toWallet: IUniversalObj
  slippage: number
  coinDecimals: number
  liquidityErrorMessage: string
}

type ComponentState = {
  spendedAmount: string
  receivedAmount: string
  userDeadline: number
  userSlippage: number
  routerAddress: string | undefined
}

const returnRouter = (name) => {
  if (name.match(/pancake/gim)) {
    return externalConfig.swapContract.pancakeRouter
  }
}

class DirectSwap extends Component<ComponentProps, ComponentState> {
  constructor(props) {
    super(props)

    const { slippage, spendedAmount, receivedAmount, liquidityErrorMessage } = props

    const routerAddress = returnRouter(liquidityErrorMessage)

    this.state = {
      spendedAmount,
      receivedAmount,
      userDeadline: 20,
      userSlippage: slippage,
      routerAddress,
    }
  }

  updateInputValue = (event, name) => {
    //@ts-ignore
    this.setState(() => ({
      [name]: event.target.value,
    }))
  }

  startSwap = async () => {
    const { closeDirectSwap, fromWallet, toWallet, coinDecimals } = this.props
    const { routerAddress, userDeadline, userSlippage, spendedAmount, receivedAmount } = this.state

    const baseCurrency = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency
    const SEC_PER_MINUTE = 60

    const result = await actions.directSwap.swapCallback({
      slippage: userSlippage,
      routerAddress,
      baseCurrency,
      ownerAddress: fromWallet.address,
      fromTokenStandard: fromWallet.standard || '',
      fromTokenName: fromWallet.tokenKey || '',
      fromToken: fromWallet.isToken
        ? fromWallet.contractAddress
        : constants.ADDRESSES.EVM_COIN_ADDRESS,
      sellAmount: spendedAmount,
      fromTokenDecimals: fromWallet.decimals || coinDecimals,
      toToken: toWallet.isToken ? toWallet.contractAddress : constants.ADDRESSES.EVM_COIN_ADDRESS,
      buyAmount: receivedAmount,
      toTokenDecimals: toWallet.decimals || coinDecimals,
      deadlinePeriod: userDeadline * SEC_PER_MINUTE,
      // while there are no other reasons to use direct swaps without any API errors,
      // but with errors we have successful swaps only in the case if this parameter in TRUE value
      useFeeOnTransfer: true,
    })

    if (result.transactionHash) {
      const txInfoUrl = transactions.getTxRouter(
        fromWallet.standard ? fromWallet.tokenKey : fromWallet.currency,
        result.transactionHash
      )

      routing.redirectTo(txInfoUrl)
      closeDirectSwap()
    }
  }

  render() {
    const { closeDirectSwap } = this.props
    const { routerAddress } = this.state

    console.log('%c direct render', 'color:orange;font-size:20px')
    console.log('this.props: ', this.props)
    console.log('this.state: ', this.state)

    const linked = Link.all(this, 'spendedAmount', 'receivedAmount', 'userDeadline', 'userSlippage')

    return (
      <section>
        <div styleName="header">
          <h3>
            <FormattedMessage id="directSwap" defaultMessage="Direct swap" />
          </h3>
          <CloseIcon onClick={closeDirectSwap} />
        </div>

        <div styleName={`content ${routerAddress ? '' : 'disabled'}`}>
          <InputRow
            onKeyUp={(event) => this.updateInputValue(event, 'spendedAmount')}
            onKeyDown={inputReplaceCommaWithDot}
            valueLink={linked.spendedAmount}
            labelMessage={<FormattedMessage id="MyOrdersYouSend" defaultMessage="You send" />}
          />

          <InputRow
            onKeyUp={(event) => this.updateInputValue(event, 'receivedAmount')}
            onKeyDown={inputReplaceCommaWithDot}
            valueLink={linked.receivedAmount}
            labelMessage={<FormattedMessage id="partial255" defaultMessage="You get" />}
          />

          <InputRow
            onKeyUp={(event) => this.updateInputValue(event, 'userDeadline')}
            onKeyDown={inputReplaceCommaWithDot}
            valueLink={linked.userDeadline}
            labelMessage={
              <FormattedMessage
                id="transactionDeadline"
                defaultMessage="Transaction deadline (minutes)"
              />
            }
          />

          <InputRow
            onKeyUp={(event) => this.updateInputValue(event, 'userSlippage')}
            onKeyDown={inputReplaceCommaWithDot}
            valueLink={linked.userSlippage}
            labelMessage={
              <FormattedMessage id="slippageTolerance" defaultMessage="Slippage tolerance (%)" />
            }
            labelTooltip={
              <Tooltip id="slippageTooltip">
                <FormattedMessage
                  id="slippageNotice"
                  defaultMessage="If the price changes between the time your order is placed and confirmed it’s called “slippage”. Your swap will automatically cancel if slippage exceeds your “max slippage” setting"
                />
              </Tooltip>
            }
          />

          <Button brand fullWidth onClick={this.startSwap}>
            <FormattedMessage id="swap" defaultMessage="Swap" />
          </Button>
        </div>
      </section>
    )
  }
}

export default CSSModules(DirectSwap, { ...styles, ...componentStyles }, { allowMultiple: true })
