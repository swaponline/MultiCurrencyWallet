import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import SelectGroup from '../OfferModal/AddOffer/SelectGroup/SelectGroup'

function ModalForm(props) {
  const {
    modalName,
    availableCurrencies,
    takerList,
    stateReference,
    makerAsset,
    makerWallet,
    takerAsset,
    takerWallet,
    blockApprove,
    blockCreation,
    isPending,
    selectMakerAsset,
    selectTakerAsset,
    checkMakerAllowance,
    checkTakerAllowance,
    needMakerApprove,
    needTakerApprove,
    approve,
    createOrder,
  } = props

  const needApprove = needMakerApprove || needTakerApprove

  const makerApprove = () => {
    approve(makerWallet, stateReference.makerAmount.value)
  }

  const takerApprove = () => {
    approve(takerWallet, stateReference.takerAmount.value)
  }

  return (
    //@ts-ignore: strictNullChecks
    <Modal
      name={modalName}
      title={<FormattedMessage id="limitOrder" defaultMessage="Limit order" />}
    >
      <SelectGroup
        label={<FormattedMessage id="addoffer381" defaultMessage="Sell" />}
        tooltip={
          <FormattedMessage
            id="partial462"
            defaultMessage="The amount you have on swap.online or an external wallet that you want to exchange"
          />
        }
        inputValueLink={stateReference.makerAmount}
        selectedValue={makerAsset.value}
        onSelect={selectMakerAsset}
        id="makerAmount"
        balance={makerWallet.balance}
        currencies={availableCurrencies}
        placeholder="0.00"
        onKeyUp={checkMakerAllowance}
      />
      <SelectGroup
        label={<FormattedMessage id="addoffer396" defaultMessage="Buy" />}
        tooltip={
          <FormattedMessage
            id="partial478"
            defaultMessage="The amount you will receive after the exchange"
          />
        }
        inputValueLink={stateReference.takerAmount}
        selectedValue={takerAsset.value}
        onSelect={selectTakerAsset}
        id="takerAmount"
        balance={takerWallet.balance}
        currencies={takerList}
        placeholder="0.00"
        onKeyUp={checkTakerAllowance}
      />
      <div styleName="inputWrapper">
        <FieldLabel>
          <FormattedMessage id="expirationTime" defaultMessage="Expiration time (minutes)" />
          <Tooltip id="expirationTimeTooltip">
            <FormattedMessage
              id="expirationTimeNotice"
              defaultMessage="The time after which the order will not be valid"
            />
          </Tooltip>
        </FieldLabel>
        <Input
          pattern="0-9\."
          onKeyDown={inputReplaceCommaWithDot}
          valueLink={stateReference.expiresInMinutes}
          withMargin
        />
      </div>

      {needApprove ? (
        needMakerApprove ? (
          <Button
            disabled={blockApprove}
            onClick={makerApprove}
            pending={isPending}
            fullWidth
            brand
          >
            <FormattedMessage
              id="FormattedMessageIdApprove"
              defaultMessage="Approve {token}"
              values={{ token: makerAsset.name }}
            />
          </Button>
        ) : (
          <Button
            disabled={blockApprove}
            onClick={takerApprove}
            pending={isPending}
            fullWidth
            brand
          >
            <FormattedMessage
              id="FormattedMessageIdApprove"
              defaultMessage="Approve {token}"
              values={{ token: takerAsset.name }}
            />
          </Button>
        )
      ) : (
        <Button disabled={blockCreation} onClick={createOrder} pending={isPending} fullWidth brand>
          <FormattedMessage id="create" defaultMessage="Create" />
        </Button>
      )}
    </Modal>
  )
}

export default CSSModules(ModalForm, styles, { allowMultiple: true })
