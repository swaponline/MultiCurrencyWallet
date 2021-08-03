import { Component } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import erc20Like from 'common/erc20Like'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import { feedback, externalConfig, constants, transactions } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
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
  expiresInMinutes: number
  isPending: boolean
  needApprove: boolean
}

class LimitOrder extends Component<ComponentProps, ComponentState> {
  constructor(props) {
    super(props)

    const { currencies } = props

    const makerAsset = currencies[0]
    const makerWallet = actions.core.getWallet({ currency: makerAsset.value })
    const network = externalConfig.evmNetworks[makerAsset.blockchain]

    const takerList = this.returnTakerList(currencies, makerAsset)
    const takerAsset = takerList[0]
    const takerWallet = actions.core.getWallet({ currency: takerAsset.value })

    this.state = {
      network,
      takerList,
      makerWallet,
      takerWallet,
      makerAsset,
      takerAsset,
      makerAmount: '',
      takerAmount: '',
      expiresInMinutes: 30,
      isPending: false,
      needApprove: true,
    }
  }

  reportError = (error) => {
    console.group('%c Create limit order', 'color: red;')
    console.error(error)
    console.groupEnd()

    actions.notifications.show(constants.notifications.ErrorNotification, {
      error: error.message,
    })

    feedback.oneinch.failed(error.message)
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

  approve = async () => {
    const { makerWallet, makerAmount } = this.state

    this.setState(() => ({
      isPending: true,
    }))

    try {
      const receipt = await actions[makerWallet.standard].approve({
        name: makerWallet.tokenKey,
        amount: makerAmount,
        to: externalConfig.limitOrder[makerWallet.baseCurrency.toLowerCase()],
      })

      actions.notifications.show(constants.notifications.Transaction, {
        link: transactions.getLink(makerWallet.baseCurrency.toLowerCase(), receipt.transactionHash),
        completed: true,
      })

      this.setState(() => ({
        needApprove: false,
      }))
    } catch (error) {
      this.reportError(error)
    } finally {
      this.setState(() => ({
        isPending: false,
      }))
    }
  }

  createRFQOrder = async () => {
    const { name } = this.props
    const {
      network,
      makerWallet,
      takerWallet,
      makerAmount,
      takerAmount,
      expiresInMinutes,
    } = this.state

    this.setState(() => ({
      isPending: true,
    }))

    feedback.oneinch.createOrder(`${makerWallet.tokenKey} -> ${takerWallet.tokenKey}`)

    try {
      const receipt = await actions.oneinch.createRFQOrder({
        chainId: network.networkVersion,
        baseCurrency: makerWallet.baseCurrency.toLowerCase(),
        makerAddress: makerWallet.address,
        makerAssetAddress: makerWallet.contractAddress,
        makerAssetDecimals: makerWallet.decimals,
        takerAssetAddress: takerWallet.contractAddress,
        takerAssetDecimals: takerWallet.decimals,
        makerAmount,
        takerAmount,
        expirationTimeInMinutes: expiresInMinutes,
      })

      console.log('receipt: ', receipt)

      actions.modals.close(name)

      actions.notifications.show(constants.notifications.Transaction, {
        link: transactions.getLink(makerWallet.baseCurrency.toLowerCase(), receipt.transactionHash),
        completed: true,
      })
    } catch (error) {
      this.reportError(error)
    } finally {
      this.setState(() => ({
        isPending: false,
      }))
    }
  }

  selectMakerAsset = async (value) => {
    const makerWallet = actions.core.getWallet({ currency: value.value })

    this.setState(
      () => ({
        makerAsset: value,
        makerWallet,
      }),
      () => {
        this.checkTokenAllowance()
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

  checkTokenAllowance = async () => {
    const { makerAsset, makerAmount } = this.state
    const makerWallet = actions.core.getWallet({ currency: makerAsset.value })

    const allowance = await erc20Like[makerWallet.standard].checkAllowance({
      owner: makerWallet.address,
      spender: externalConfig.limitOrder[makerWallet.baseCurrency.toLowerCase()],
      contract: makerWallet.contractAddress,
      decimals: makerWallet.decimals,
    })

    this.setState(() => ({
      needApprove: new BigNumber(allowance).isLessThan(makerAmount),
    }))
  }

  areWrongOrderParams = () => {
    const { makerAmount, takerAmount } = this.state

    const isWrongAmount = (amount) => {
      return new BigNumber(amount).isNaN() || new BigNumber(amount).isEqualTo(0)
    }

    return isWrongAmount(makerAmount) || isWrongAmount(takerAmount)
  }

  render() {
    const { name, currencies } = this.props
    const {
      takerList,
      makerAsset,
      takerAsset,
      makerWallet,
      takerWallet,
      isPending,
      needApprove,
    } = this.state

    const linked = Link.all(this, 'makerAmount', 'takerAmount', 'expiresInMinutes')
    const blockCreation = this.areWrongOrderParams() || isPending

    // TODO: how to calculate the tx cost for token approvement ?
    // FIXME: don't let an user to start approvement without balance
    const blockApprove = blockCreation // || new BigNumber(makerWallet.balance).isLessThan(0)

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
          onKeyUp={this.checkTokenAllowance}
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

        <div styleName="inputWrapper">
          <FieldLabel>
            <FormattedMessage id="expiresTime" defaultMessage="Expires time" />
            <Tooltip id="expiresTimeTooltip">
              <FormattedMessage id="expiresTimeNotice" defaultMessage="Good explanation" />
            </Tooltip>
          </FieldLabel>
          <Input
            pattern="0-9\."
            onKeyDown={inputReplaceCommaWithDot}
            valueLink={linked.expiresInMinutes}
            withMargin
          />
        </div>

        {needApprove ? (
          <Button
            disabled={blockApprove}
            onClick={this.approve}
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
            disabled={blockCreation}
            onClick={this.createRFQOrder}
            pending={isPending}
            fullWidth
            brand
          >
            <FormattedMessage id="create" defaultMessage="Create" />
          </Button>
        )}
      </Modal>
    )
  }
}

export default connect(({ currencies, user }) => ({
  currencies: actions.oneinch.filterCurrencies({
    currencies: currencies.items,
    tokensWallets: user.tokensData,
    oneinchTokens: currencies.oneinch,
    onlyTokens: true,
  }),
  activeFiat: user.activeFiat,
}))(CSSModules(LimitOrder, styles, { allowMultiple: true }))
