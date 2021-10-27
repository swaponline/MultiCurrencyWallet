import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import SelectGroup from 'components/SelectGroup'

function ModalForm(props) {
  const {
    wrongNetwork,
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
    approve,
    createOrder,
    enoughSwapCurrencies,
  } = props

  const needApprove = needMakerApprove

  const makerApprove = () => {
    approve(makerWallet, stateReference.makerAmount.value)
  }

  const takerApprove = () => {
    approve(takerWallet, stateReference.takerAmount.value)
  }

  return (
    <Modal
      name={modalName}
      title={<FormattedMessage id="limitOrder" defaultMessage="Limit order" />}
    >
      <section styleName="limitOrder">
        <p styleName="betaVersionDisclaimer">
          <FormattedMessage
            id="disclaimerAbout1inch"
            defaultMessage="* Disclaimer: Limit Orders are provided by a 3rd 1inch Limit Order Protocol and should be considered in beta. Be carefully and use at your own risk."
          />
        </p>

        {!enoughSwapCurrencies && (
          <p styleName="warning">
            <FormattedMessage
              id="notEnoughTokensForSwap"
              defaultMessage="Not all currencies are available for swap. It looks like you don't have enough tokens. Try adding more of them."
            />
          </p>
        )}

        {wrongNetwork && (
          <p styleName="warning">
            <FormattedMessage id="incorrectNetwork" defaultMessage='Please choose correct network' />
          </p>
        )}

        <div styleName={`formWrapper ${wrongNetwork || availableCurrencies[0].notExist ? 'disabled' : ''}`}>
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

          <div styleName={`footer ${enoughSwapCurrencies ? '' : 'disabled'}`}>
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
              <Button
                disabled={blockCreation}
                onClick={createOrder}
                pending={isPending}
                fullWidth
                brand
              >
                <FormattedMessage id="create" defaultMessage="Create" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </Modal>
  )
}

export default CSSModules(ModalForm, styles, { allowMultiple: true })
