import { FormattedMessage } from 'react-intl'
import actions from 'redux/actions'
import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import SelectGroup from '../OfferModal/AddOffer/SelectGroup/SelectGroup'

export default function LimitOrder(props) {
  const { name } = props

  const createOrder = () => {
    /* 
    TODO: new 1inch contracts config
    limit orders' contracts
    
    eth: 0x3ef51736315f52d568d6d2cf289419b9cfffe782
    bsc: 0xe3456f4ee65e745a44ec3bcb83d0f2529d1b84eb
    polygon: 0xb707d89d29c189421163515c59e42147371d6857
    */
    actions.oneinch.createLimitOrder({
      chainId: 137,
      baseCurrency: 'matic',
      makerAddress: '',
      makerAssetAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // matic
      takerAssetAddress: '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', // chainlink token
      makerAmount: '1',
      takerAmount: '1',
    })
  }

  return (
    //@ts-ignore: strictNullChecks
    <Modal name={name} title={<FormattedMessage id="limitOrder" defaultMessage="Limit order" />}>
      {/* <SelectGroup
        label={<FormattedMessage id="addoffer381" defaultMessage="Sell" />}
        tooltip={
          <FormattedMessage
            id="partial462"
            defaultMessage="The amount you have on swap.online or an external wallet that you want to exchange"
          />
        }
        inputValueLink={linked.sellAmount.pipe(this.handleSellAmountChange)}
        dontDisplayError
        selectedValue={sellCurrency}
        onSelect={this.handleSellCurrencySelect}
        id="sellAmount"
        balance={balance}
        currencies={currencies}
        placeholder="0.00"
      /> */}
      {/* 
      <SelectGroup
          label={<FormattedMessage id="addoffer381" defaultMessage="Sell" />}
          tooltip={<FormattedMessage id="partial462" defaultMessage="The amount you have on swap.online or an external wallet that you want to exchange" />}
          inputValueLink={linked.sellAmount.pipe(this.handleSellAmountChange)}
          dontDisplayError
          selectedValue={sellCurrency}
          onSelect={this.handleSellCurrencySelect}
          id="sellAmount"
          balance={balance}
          currencies={currencies}
          placeholder="0.00"
        />
      */}

      <Button fullWidth brand disabled={false} onClick={createOrder}>
        <FormattedMessage id="create" defaultMessage="Create" />
      </Button>
    </Modal>
  )
}
