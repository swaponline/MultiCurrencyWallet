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
  orderTakerAmount: string
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

  render() {
    const { takerWallet, orderTakerAmount } = this.props
    const { amount } = this.state
    const linked = Link.all(this, 'amount')

    const confirmIsDisabled =
      new BigNumber(takerWallet.balance).isLessThan(amount) ||
      new BigNumber(amount).isGreaterThan(orderTakerAmount)

    return (
      //@ts-ignore: strictNullChecks
      <Modal
        name="orderPurchaseModal"
        title={<FormattedMessage id="executeOrder" defaultMessage="Execute the order" />}
      >
        <section styleName="modalContent">
          <p styleName="title">
            <FormattedMessage
              id="limitOrderFillDescription"
              defaultMessage="You are able to spend not your entire balance. Enter the amount of {sellToken} you want to sell"
              values={{
                sellToken: takerWallet.fullName,
              }}
            />
          </p>

          <p styleName="amountNotice">
            <span>
              <FormattedMessage id="yourBalance" defaultMessage="Your balance" />
              {': '}
              {takerWallet.balance}
            </span>

            <span>
              <FormattedMessage id="yourBalance" defaultMessage="Order amount" />
              {': '}
              {orderTakerAmount}
            </span>
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
