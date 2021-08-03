import { Component } from 'react'
import { connect } from 'redaction'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { feedback, externalConfig } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import SelectGroup from '../OfferModal/AddOffer/SelectGroup/SelectGroup'

type ComponentProps = {
  name: string
  currencies: IUniversalObj[]
}

type ComponentState = {
  network: IUniversalObj
  receivedList: IUniversalObj[]
  makerWallet: IUniversalObj
  takerWallet: IUniversalObj
  makerAsset: IUniversalObj
  takerAsset: IUniversalObj
  makerAmount: string
  takerAmount: string
}

class LimitOrder extends Component<ComponentProps, ComponentState> {
  constructor(props) {
    super(props)

    const { currencies } = props

    const makerAsset = currencies[0]
    const network = externalConfig.evmNetworks[makerAsset.blockchain]

    const receivedList = this.returnTakerList(currencies, makerAsset)
    const takerAsset = receivedList[0]

    this.state = {
      network,
      receivedList,
      makerWallet: {},
      takerWallet: {},
      makerAsset,
      takerAsset,
      makerAmount: '',
      takerAmount: '',
    }
  }

  updateNetwork = () => {
    const { makerAsset } = this.state

    this.setState(() => ({
      network: externalConfig.evmNetworks[makerAsset.blockchain],
    }))
  }

  returnTakerList = (currencies, makerAsset) => {
    return currencies.filter(
      (item) => item.blockchain === makerAsset.blockchain && item.value !== makerAsset.value
    )
  }

  createOrder = () => {
    const { network, makerWallet, takerWallet, makerAmount, takerAmount } = this.state
    /* 
    TODO: new 1inch contracts config
    limit orders' contracts
    
    eth: 0x3ef51736315f52d568d6d2cf289419b9cfffe782
    bsc: 0xe3456f4ee65e745a44ec3bcb83d0f2529d1b84eb
    polygon: 0xb707d89d29c189421163515c59e42147371d6857
    */
    actions.oneinch.createLimitOrder({
      chainId: network.networkVersion,
      baseCurrency: 'matic',
      makerAddress: '0xDA873Ff72bd4eA9c122C51a837DA3f88307D1DB5',
      makerAssetAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // matic
      makerAssetDecimals: 18,
      takerAssetAddress: '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', // chainlink token
      takerAssetDecimals: 18,
      makerAmount,
      takerAmount,
    })
  }

  selectMakerAsset = (value) => {
    this.setState(() => ({
      makerAsset: value,
    }))
  }

  selectTakerAsset = (value) => {
    this.setState(() => ({
      takerAsset: value,
    }))
  }

  render() {
    const { name, currencies } = this.props
    const { receivedList, makerAsset, takerAsset, makerWallet, takerWallet } = this.state

    const linked = Link.all(this, 'makerAmount', 'takerAmount')

    return (
      //@ts-ignore: strictNullChecks
      <Modal name={name} title={<FormattedMessage id="limitOrder" defaultMessage="Limit order" />}>
        <SelectGroup
          label={<FormattedMessage id="addoffer381" defaultMessage="Sell" />}
          inputValueLink={linked.makerAmount}
          selectedValue={makerAsset.value}
          onSelect={this.selectMakerAsset}
          id="makerAmount"
          balance={makerWallet.balance}
          currencies={currencies}
          placeholder="0.00"
        />

        <SelectGroup
          label={<FormattedMessage id="addoffer396" defaultMessage="Buy" />}
          inputValueLink={linked.takerAmount}
          selectedValue={takerAsset.value}
          onSelect={this.selectTakerAsset}
          id="takerAmount"
          balance={takerWallet.balance}
          currencies={receivedList}
          placeholder="0.00"
        />

        <Button fullWidth brand disabled={false} onClick={this.createOrder}>
          <FormattedMessage id="create" defaultMessage="Create" />
        </Button>
      </Modal>
    )
  }
}

export default connect(({ currencies, user }) => ({
  currencies: actions.oneinch.filterCurrencies({
    currencies: currencies.items,
    tokensWallets: user.tokensData,
    oneinchTokens: currencies.oneinch,
  }),
  activeFiat: user.activeFiat,
}))(CSSModules(LimitOrder, styles, { allowMultiple: true }))
