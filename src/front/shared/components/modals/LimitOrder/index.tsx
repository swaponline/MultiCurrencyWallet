import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import erc20Like from 'common/erc20Like'
import {
  feedback,
  externalConfig,
  constants,
  transactions,
  cacheStorageGet,
  cacheStorageSet,
  cacheStorageClear,
} from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import ModalForm from './ModalForm'

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
  needMakerApprove: boolean
  needTakerApprove: boolean
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
      needMakerApprove: false,
      takerAmount: '',
      needTakerApprove: false,
      expiresInMinutes: 30,
      isPending: false,
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

  approve = async (wallet, amount) => {
    this.setState(() => ({
      isPending: true,
    }))

    try {
      const receipt = await actions[wallet.standard].approve({
        to: externalConfig.limitOrder[wallet.baseCurrency.toLowerCase()],
        name: wallet.tokenKey,
        amount,
      })

      actions.notifications.show(constants.notifications.Transaction, {
        link: transactions.getLink(wallet.baseCurrency.toLowerCase(), receipt.transactionHash),
        completed: true,
      })

      cacheStorageSet('limitOrderAllowance', wallet.tokenKey, amount, Infinity)

      this.checkMakerAllowance()
      this.checkTakerAllowance()
    } catch (error) {
      this.reportError(error)
    } finally {
      this.setState(() => ({
        isPending: false,
      }))
    }
  }

  createLimitOrder = async () => {
    const { name } = this.props
    const { network, makerWallet, takerWallet, makerAmount, takerAmount } = this.state

    this.setState(() => ({
      isPending: true,
    }))

    try {
      const response: any = await actions.oneinch.createLimitOrder({
        chainId: network.networkVersion,
        baseCurrency: makerWallet.baseCurrency.toLowerCase(),
        makerAddress: makerWallet.address,
        makerAssetAddress: makerWallet.contractAddress,
        makerAssetDecimals: makerWallet.decimals,
        takerAssetAddress: takerWallet.contractAddress,
        takerAssetDecimals: takerWallet.decimals,
        makerAmount,
        takerAmount,
      })

      this.decreaseAllowance(makerWallet, makerAmount)
      this.decreaseAllowance(takerWallet, takerAmount)

      if (response && response.success) {
        actions.modals.close(name)
        actions.notifications.show(constants.notifications.Message, {
          message: <FormattedMessage defaultMessage="You have successfully created the order" />,
        })
      } else {
        actions.notifications.show(constants.notifications.Message, {
          message: <FormattedMessage defaultMessage="Something went wrong. Try again later" />,
        })
      }
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
        this.checkMakerAllowance()
        this.updateNetwork()
        this.updateTakerList()
      }
    )
  }

  selectTakerAsset = (value) => {
    const takerWallet = actions.core.getWallet({ currency: value.value })

    this.setState(
      () => ({
        takerAsset: value,
        takerWallet,
      }),
      () => {
        this.checkTakerAllowance()
      }
    )
  }

  decreaseAllowance = (wallet, amount) => {
    const oldAllowance: any = cacheStorageSet(
      'limitOrderAllowance',
      wallet.tokenKey,
      amount,
      Infinity
    )

    cacheStorageSet(
      'limitOrderAllowance',
      wallet.tokenKey,
      new BigNumber(oldAllowance).minus(amount),
      Infinity
    )
  }

  checkMakerAllowance = async () => {
    const { makerWallet, makerAmount } = this.state
    let allowance = cacheStorageGet('limitOrderAllowance', makerWallet.tokenKey)

    if (!allowance) {
      allowance = await this.fetchTokenAllowance(makerWallet)
    }

    this.setState(() => ({
      needMakerApprove: new BigNumber(allowance).isLessThan(makerAmount),
    }))
  }

  checkTakerAllowance = async () => {
    const { takerWallet, takerAmount } = this.state
    let allowance = cacheStorageGet('limitOrderAllowance', takerWallet.tokenKey)

    if (!allowance) {
      allowance = await this.fetchTokenAllowance(takerWallet)
    }

    this.setState(() => ({
      needTakerApprove: new BigNumber(allowance).isLessThan(takerAmount),
    }))
  }

  fetchTokenAllowance = async (wallet) => {
    return await erc20Like[wallet.standard].checkAllowance({
      owner: wallet.address,
      spender: externalConfig.limitOrder[wallet.baseCurrency.toLowerCase()],
      contract: wallet.contractAddress,
      decimals: wallet.decimals,
    })
  }

  areWrongOrderParams = () => {
    const { makerAmount, takerAmount, makerWallet } = this.state

    const isWrongAmount = (amount) => {
      return new BigNumber(amount).isNaN() || new BigNumber(amount).isEqualTo(0)
    }

    return (
      isWrongAmount(makerAmount) ||
      isWrongAmount(takerAmount) ||
      new BigNumber(makerWallet.balance).isLessThan(makerAmount)
    )
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
      needMakerApprove,
      needTakerApprove,
    } = this.state

    const linked = Link.all(this, 'makerAmount', 'takerAmount', 'expiresInMinutes')
    const blockCreation = this.areWrongOrderParams() || isPending

    // TODO: how to calculate the tx cost for token approvement ?
    // FIXME: don't let an user to start approvement without balance
    const blockApprove = blockCreation // || new BigNumber(makerWallet.balance).isLessThan(0)

    return (
      <ModalForm
        modalName={name}
        stateReference={linked}
        availableCurrencies={currencies}
        takerList={takerList}
        makerAsset={makerAsset}
        makerWallet={makerWallet}
        takerAsset={takerAsset}
        takerWallet={takerWallet}
        blockApprove={blockApprove}
        blockCreation={blockCreation}
        isPending={isPending}
        selectMakerAsset={this.selectMakerAsset}
        checkMakerAllowance={this.checkMakerAllowance}
        checkTakerAllowance={this.checkTakerAllowance}
        needMakerApprove={needMakerApprove}
        needTakerApprove={needTakerApprove}
        selectTakerAsset={this.selectTakerAsset}
        approve={this.approve}
        createOrder={this.createLimitOrder}
      />
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
}))(LimitOrder)
