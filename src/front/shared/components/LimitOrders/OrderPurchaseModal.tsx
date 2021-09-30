import React from 'react'
import { FormattedMessage } from 'react-intl'
import BigNumber from 'bignumber.js'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Link from 'local_modules/sw-valuelink'
import Input from 'components/forms/Input/Input'
import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'

type ComponentProps = {
  takerWallet: IUniversalObj
  makerWallet: IUniversalObj
  orderMakerAmount: string
  orderTakerAmount: string
  remainingMakerAmount: string
  fillOrder: (amount: number) => void
  setModalIsOpened: (arg: boolean) => void
}

type ComponentState = {
  amount: number
}

class OrderPurchaseModal extends React.Component<ComponentProps, ComponentState> {
  constructor(props) {
    super(props)

    this.state = {
      amount: 0,
    }
  }

  onConfirm = () => {
    const { fillOrder } = this.props
    const { amount } = this.state

    fillOrder(amount)
  }

  onCancel = () => {
    const { setModalIsOpened } = this.props

    setModalIsOpened(false)
  }

  returnRemainingTakerAmount = () => {
    const { orderTakerAmount, orderMakerAmount, remainingMakerAmount } = this.props

    const makersAmountSpent = new BigNumber(orderMakerAmount).minus(remainingMakerAmount)
    const makersAmountInOnePercent = new BigNumber(orderMakerAmount).dividedBy(100)

    // how much interest has already been spent for makers amount
    const makersPercentAmountSpent = makersAmountSpent.dividedBy(makersAmountInOnePercent)

    const takersAmountSpent = new BigNumber(orderTakerAmount)
      .dividedBy(100)
      .multipliedBy(makersPercentAmountSpent)

    return new BigNumber(orderTakerAmount).minus(takersAmountSpent)
  }

  renderAmountParameter = (params) => {
    const { message, amount, currency } = params

    return (
      <span styleName="parameter">
        {message}
        {': '}
        <br />
        <span styleName="monostyle">
          {new BigNumber(amount).dp(8).toString()} {currency}
        </span>
      </span>
    )
  }

  render() {
    const { takerWallet, orderTakerAmount, makerWallet, remainingMakerAmount } = this.props
    const { amount } = this.state
    const linked = Link.all(this, 'amount')

    const confirmIsDisabled =
      new BigNumber(takerWallet.balance).isLessThan(amount) ||
      new BigNumber(amount).isGreaterThan(orderTakerAmount) ||
      new BigNumber(amount).isEqualTo(0) ||
      new BigNumber(amount).isNaN()

    const remainingTakerAmount = this.returnRemainingTakerAmount()
    const amountCanBeSpend = new BigNumber(takerWallet.balance).isLessThan(remainingTakerAmount)
      ? takerWallet.balance
      : remainingTakerAmount

    return (
      <Modal
        name="orderPurchaseModal"
        title={<FormattedMessage id="executeOrder" defaultMessage="Execute the order" />}
        onClose={this.onCancel}
      >
        <section styleName="modalContent">
          <p styleName="title">
            <FormattedMessage
              id="limitOrderFillDescription"
              defaultMessage="You are able to spend not your entire balance. Enter the amount of {sellToken} you want to spend."
              values={{
                sellToken: <b>{takerWallet.fullName}</b>,
              }}
            />
          </p>

          <p styleName="amountNotice">
            {this.renderAmountParameter({
              message: <FormattedMessage id="yourBalance" defaultMessage="Your balance" />,
              amount: takerWallet.balance,
              currency: takerWallet.currency,
            })}

            {this.renderAmountParameter({
              message: (
                <FormattedMessage
                  id="remainingMakerAmount"
                  defaultMessage="Remaining maker amount"
                />
              ),
              amount: remainingMakerAmount,
              currency: makerWallet.currency,
            })}

            {this.renderAmountParameter({
              message: (
                <FormattedMessage
                  id="remainingTakerAmount"
                  defaultMessage="Remaining taker amount"
                />
              ),
              amount: remainingTakerAmount,
              currency: takerWallet.currency,
            })}

            {this.renderAmountParameter({
              message: <FormattedMessage id="youCanSpend" defaultMessage="You can spend" />,
              amount: amountCanBeSpend,
              currency: takerWallet.currency,
            })}
          </p>

          <Input pattern="0-9\." onKeyDown={inputReplaceCommaWithDot} valueLink={linked.amount} />

          <div styleName="buttons">
            <Button disabled={confirmIsDisabled} brand fullWidth onClick={this.onConfirm}>
              <FormattedMessage id="confirmDialogDefaultTitle" defaultMessage="Confirm action" />
            </Button>

            <Button brand onClick={this.onCancel}>
              <FormattedMessage id="WithdrawModalCancelBtn" defaultMessage="Cancel" />
            </Button>
          </div>
        </section>
      </Modal>
    )
  }
}

export default CSSModules(OrderPurchaseModal, styles, { allowMultiple: true })
