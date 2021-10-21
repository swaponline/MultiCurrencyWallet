import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import BigNumber from 'bignumber.js'
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
  userDeadline: number
  userSlippage: number
  slippageMaxRange: number
  slippageFailRange: number
  slippageFrontrunRange: number
  routerAddress: string | undefined
  possibleLiquiditySourceName: string
  pending: boolean
  insufficientSlippage: boolean
  errorMessage: string
}

const returnRouter = (name) => {
  if (name.match(/pancake/gim)) {
    return externalConfig.swapContract.pancakeRouter
  }
}

class DirectSwap extends Component<ComponentProps, ComponentState> {
  constructor(props) {
    super(props)

    const { slippage, liquidityErrorMessage } = props
    const routerAddress = returnRouter(liquidityErrorMessage)
    const sourceNameMatch = liquidityErrorMessage.match(/^[0-9a-zA-Z]+/)

    this.state = {
      userDeadline: 20,
      userSlippage: slippage,
      routerAddress,
      slippageMaxRange: 50,
      slippageFailRange: 0.5,
      slippageFrontrunRange: 10,
      pending: false,
      insufficientSlippage: false,
      errorMessage: '',
      possibleLiquiditySourceName: sourceNameMatch ? sourceNameMatch[0] : '',
    }
  }

  updateInputValue = (event, name) => {
    const { slippageMaxRange } = this.state
    let value = event.target.value

    if (name === 'userSlippage' && value === '') {
      value = 0
    }

    if (value < slippageMaxRange) {
      //@ts-ignore
      this.setState(() => ({
        [name]: value,
      }))
    }
  }

  startSwap = async () => {
    const { closeDirectSwap, fromWallet, toWallet, coinDecimals, spendedAmount, receivedAmount } =
      this.props
    const { routerAddress, userDeadline, userSlippage } = this.state

    const baseCurrency = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency
    const SEC_PER_MINUTE = 60

    this.setState(() => ({
      insufficientSlippage: false,
      errorMessage: '',
      pending: true,
    }))

    try {
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

      this.setState(() => ({
        pending: false,
      }))

      if (result instanceof Error) {
        // the error INSUFFICIENT_OUTPUT_AMOUNT means we can increase slippage to get less output
        // token's amount, but our transaction will probably be successful with this.
        // Let user know about it
        const insufficientSlippage = result.message.match(/INSUFFICIENT_OUTPUT_AMOUNT/)

        this.setState(() => ({
          insufficientSlippage: !!insufficientSlippage,
          errorMessage: result.message,
        }))
      } else if (result?.transactionHash) {
        const txInfoUrl = transactions.getTxRouter(
          fromWallet.standard ? fromWallet.tokenKey : fromWallet.currency,
          result.transactionHash
        )

        routing.redirectTo(txInfoUrl)
        closeDirectSwap()
      }
    } catch (error) {
      this.setState(() => ({
        pending: false,
        errorMessage: error.message,
      }))
    }
  }

  render() {
    const { closeDirectSwap, spendedAmount, receivedAmount, fromWallet, toWallet } = this.props
    const {
      routerAddress,
      userSlippage,
      slippageMaxRange,
      slippageFailRange,
      slippageFrontrunRange,
      possibleLiquiditySourceName,
      pending,
      insufficientSlippage,
      errorMessage,
    } = this.state

    const linked = Link.all(this, 'userDeadline', 'userSlippage')

    const MAX_PERCENT = 100
    const slippageRange = new BigNumber(receivedAmount)
      .div(MAX_PERCENT)
      .times(userSlippage)
      .toNumber()

    const guaranteedPrice = new BigNumber(receivedAmount).minus(slippageRange).toNumber()

    const txMayFail = userSlippage < slippageFailRange
    const txMayBeFrontrun = userSlippage > slippageFrontrunRange && userSlippage < slippageMaxRange
    const invalidSlippage = userSlippage >= slippageMaxRange

    return (
      <section>
        <div styleName="header">
          <h3>
            <FormattedMessage id="directSwap" defaultMessage="Direct swap" />
          </h3>
          <CloseIcon onClick={closeDirectSwap} />
        </div>

        <div styleName={`content ${routerAddress ? '' : 'disabled'}`}>
          <div styleName="lockedInfo">
            {possibleLiquiditySourceName && (
              <span styleName="indicator">
                <FormattedMessage id="source" defaultMessage="Source" />:{' '}
                <span>{possibleLiquiditySourceName}</span>
              </span>
            )}

            <span styleName="indicator">
              <FormattedMessage id="MyOrdersYouSend" defaultMessage="You send" />:{' '}
              <span>
                {spendedAmount} {fromWallet.currency}
              </span>
            </span>

            <span styleName="indicator">
              <FormattedMessage id="partial255" defaultMessage="You get" />:{' '}
              <span>
                {receivedAmount} {toWallet.currency}
              </span>
            </span>

            <span styleName="indicator">
              <FormattedMessage id="guaranteedPrice" defaultMessage="Guaranteed price" />:{' '}
              <span>
                {guaranteedPrice} {toWallet.currency}
              </span>
            </span>
          </div>

          <InputRow
            margin
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
            margin
            onKeyUp={(event) => this.updateInputValue(event, 'userSlippage')}
            onKeyDown={inputReplaceCommaWithDot}
            valueLink={linked.userSlippage}
            labelMessage={
              <>
                <FormattedMessage id="slippageTolerance" defaultMessage="Slippage tolerance" />
                {' (%)'}
              </>
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

          <div styleName="reasons">
            {insufficientSlippage ? (
              <p styleName="warning">
                <FormattedMessage
                  id="insufficientSlippage"
                  defaultMessage="Insufficient slippage. Try to increase it"
                />
              </p>
            ) : errorMessage ? (
              <pre styleName="wrong">{errorMessage}</pre>
            ) : null}

            {txMayFail ? (
              <p styleName="neutral">
                <FormattedMessage id="transactionMayFail" defaultMessage="Transaction may fail" />
              </p>
            ) : txMayBeFrontrun ? (
              <p styleName="neutral">
                <FormattedMessage
                  id="transactionMayBeFrontrun"
                  defaultMessage="Transaction may be frontrun"
                />
              </p>
            ) : invalidSlippage ? (
              <p styleName="wrong">
                <FormattedMessage
                  id="invalidSlippagePercent"
                  defaultMessage="Invalid slippage percent"
                />
              </p>
            ) : null}
          </div>

          <Button
            brand
            fullWidth
            onClick={this.startSwap}
            disabled={invalidSlippage || pending}
            pending={pending}
          >
            <FormattedMessage id="swap" defaultMessage="Swap" />
          </Button>
        </div>
      </section>
    )
  }
}

export default CSSModules(DirectSwap, { ...styles, ...componentStyles }, { allowMultiple: true })
