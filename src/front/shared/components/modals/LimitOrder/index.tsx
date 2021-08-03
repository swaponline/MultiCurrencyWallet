import { Component } from 'react'
import { connect } from 'redaction'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { feedback, externalConfig, constants, transactions } from 'helpers'
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
  takerList: IUniversalObj[]
  makerWallet: IUniversalObj
  takerWallet: IUniversalObj
  makerAsset: IUniversalObj
  takerAsset: IUniversalObj
  makerAmount: string
  takerAmount: string
  isPending: boolean
}

class LimitOrder extends Component<ComponentProps, ComponentState> {
  constructor(props) {
    super(props)

    const { currencies } = props

    const makerAsset = currencies[0]
    const network = externalConfig.evmNetworks[makerAsset.blockchain]

    const takerList = this.returnTakerList(currencies, makerAsset)
    const takerAsset = takerList[0]

    this.state = {
      network,
      takerList,
      makerWallet: {},
      takerWallet: {},
      makerAsset,
      takerAsset,
      makerAmount: '',
      takerAmount: '',
      isPending: false,
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

  updateTakerList = () => {
    const { currencies } = this.props
    const { makerAsset } = this.state

    const takerList = this.returnTakerList(currencies, makerAsset)

    this.setState(() => ({
      takerList,
      takerAsset: takerList[0],
      takerAmount: '0',
      takerWallet: actions.core.getWallet({ currency: takerList[0].value }),
    }))
  }

  createOrder = async () => {
    const { name } = this.props
    const { network, makerWallet, takerWallet, makerAmount, takerAmount } = this.state
    const baseCurrency = makerWallet.baseCurrency || makerWallet.currency

    console.log('state: ', this.state)

    const makerAssetAddress = makerWallet.isToken
      ? makerWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    const takerAssetAddress = takerWallet.isToken
      ? takerWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

    this.setState(() => ({
      isPending: true,
    }))

    const receipt = await actions.oneinch.createLimitOrder({
      chainId: network.networkVersion,
      baseCurrency: baseCurrency.toLowerCase(),
      makerAddress: makerWallet.address,
      makerAssetAddress,
      makerAssetDecimals: makerWallet.decimals || 18,
      takerAssetAddress,
      takerAssetDecimals: takerWallet.decimals || 18,
      makerAmount,
      takerAmount,
    })

    this.setState(() => ({
      isPending: false,
    }))

    actions.modals.close(name)

    const key = makerWallet.standard ? makerWallet.baseCurrency : makerWallet.currency
    const lowerKey = key.toLowerCase()

    actions.notifications.show(constants.notifications.Transaction, {
      link: transactions.getLink(lowerKey, receipt.transactionHash),
      completed: true,
    })
  }

  selectMakerAsset = (value) => {
    const makerWallet = actions.core.getWallet({ currency: value.value })

    this.setState(
      () => ({
        makerAsset: value,
        makerWallet,
      }),
      () => {
        this.updateNetwork()
        this.updateTakerList()
      }
    )
  }

  selectTakerAsset = (value) => {
    this.setState(() => ({
      takerAsset: value,
      takerWallet: actions.core.getWallet({ currency: value.value }),
    }))
  }

  areWrongOrderParams = () => {
    const { makerAmount, takerAmount } = this.state

    return !makerAmount || !takerAmount
  }

  render() {
    const { name, currencies } = this.props
    const { takerList, makerAsset, takerAsset, makerWallet, takerWallet, isPending } = this.state

    const linked = Link.all(this, 'makerAmount', 'takerAmount')
    const blockCreation = this.areWrongOrderParams() || isPending

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
          currencies={takerList}
          placeholder="0.00"
        />

        <Button
          disabled={blockCreation}
          onClick={this.createOrder}
          pending={isPending}
          fullWidth
          brand
        >
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
