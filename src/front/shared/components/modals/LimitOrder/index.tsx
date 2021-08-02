import { FormattedMessage } from 'react-intl'
import actions from 'redux/actions'
import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'

export default function LimitOrder(props) {
  const { name, data } = props
  const {} = data

  console.log(props)

  const createOrder = () => {
    actions.oneinch.createLimitOrder({
      // chainId,
      // baseCurrency,
      // makerAddress,
      // makerAssetAddress,
      // takerAssetAddress,
      // makerAmount, +
      // takerAmount, +
    })
  }

  return (
    //@ts-ignore: strictNullChecks
    <Modal name={name} title={<FormattedMessage id="limitOrder" defaultMessage="Limit order" />}>
      <Button styleName="button" fullWidth brand disabled={false} onClick={this.createOrder}>
        <input type="text" />
        <input type="text" />
        <FormattedMessage id="create" defaultMessage="Create" />
      </Button>
    </Modal>
  )
}
