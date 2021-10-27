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
  metamask,
} from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import ModalForm from './ModalForm'

type ComponentProps = {
  name: string
  allCurrencies: IUniversalObj[]
  tokensWallets: IUniversalObj[]
}

type ComponentState = {
  network: IUniversalObj
  currencies: IUniversalObj[]
  takerList: IUniversalObj[]
  makerWallet: IUniversalObj
  takerWallet: IUniversalObj
  makerAsset: IUniversalObj
  takerAsset: IUniversalObj
  makerAmount: string
  takerAmount: string
  wrongNetwork: boolean
  isPending: boolean
  needMakerApprove: boolean
  enoughSwapCurrencies: boolean
}

const noCurrenciesTemplate = [{
  blockchain: '-',
  fullTitle: '-',
  name: '-',
  notExist: true,
}]

class LimitOrder extends Component<ComponentProps, ComponentState> {
  constructor(props) {
    super(props)

    const { allCurrencies } = props
    let { currencies, wrongNetwork } = actions.oneinch.filterCurrencies({
      currencies: allCurrencies,
      onlyTokens: true,
    })

    let enoughSwapCurrencies = true

    if (wrongNetwork || !currencies.length) {
      currencies = noCurrenciesTemplate

      if (!currencies.length) enoughSwapCurrencies = false
    }

    const makerAsset = currencies[0]
    const makerWallet = actions.core.getWallet({ currency: makerAsset.value })
    const network = externalConfig.evmNetworks[makerAsset.blockchain || makerAsset.value.toUpperCase()]

    let takerList = this.returnTakerList(currencies, makerAsset)

    if (!takerList.length) {
      takerList = noCurrenciesTemplate
      enoughSwapCurrencies = false
    }

    const takerAsset = takerList[0]
    const takerWallet = actions.core.getWallet({ currency: takerAsset.value })

    this.state = {
      network,
      wrongNetwork,
      currencies,
      takerList,
      makerWallet,
      takerWallet,
      makerAsset,
      takerAsset,
      makerAmount: '',
      needMakerApprove: false,
      takerAmount: '',
      isPending: false,
      enoughSwapCurrencies,
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { allCurrencies, tokensWallets } = this.props
    const { wrongNetwork: prevWrongNetwork, currencies: prevCurrencies } = prevState
    const { makerAsset } = this.state

    const isCurrentNetworkAvailable = metamask.isAvailableNetwork()

    const isMakerAssetNetworkAvailable = metamask.isAvailableNetworkByCurrency(makerAsset.value)

    const needUpdate =
      metamask.isConnected() &&
      (
        (prevWrongNetwork && (isMakerAssetNetworkAvailable || isCurrentNetworkAvailable))
        ||
        (!prevWrongNetwork && !isMakerAssetNetworkAvailable)
      )

    if (needUpdate) {
      let { currencies, wrongNetwork } = actions.oneinch.filterCurrencies({
        currencies: allCurrencies,
        tokensWallets,
      })

      if (wrongNetwork) {
        currencies = prevCurrencies
      }

      let makerAsset = currencies[0]
      let takerList = this.returnTakerList(currencies, makerAsset)
      let takerAsset = takerList[0]

      this.setState(() => ({
        wrongNetwork,
        currencies,
        makerAsset,
        takerList,
        takerAsset,
        network: externalConfig.evmNetworks[makerAsset.blockchain || makerAsset.value.toUpperCase()]
      }))
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
      network: externalConfig.evmNetworks[makerAsset.blockchain || makerAsset.value.toUpperCase()],
    }))
  }

  returnTakerList = (currencies, makerAsset) => {
    return currencies.filter(
      (item) => item.blockchain === makerAsset.blockchain && item.value !== makerAsset.value
    )
  }

  updateTakerList = () => {
    const { allCurrencies } = this.props
    const { makerAsset, currencies } = this.state

    const takerList = this.returnTakerList(currencies, makerAsset)

    if (!takerList.length) {
      this.setState(() => ({
        takerList: allCurrencies,
        enoughSwapCurrencies: false,
      }))
    } else {
      this.setState(() => ({
        takerList,
        takerAsset: takerList[0],
        takerAmount: '0',
        takerWallet: actions.core.getWallet({ currency: takerList[0].value }),
        enoughSwapCurrencies: true,
      }))
    }
  }

  approve = async (wallet, amount) => {
    this.setState(() => ({
      isPending: true,
    }))

    try {
      const hash = await actions[wallet.standard].approve({
        to: externalConfig.limitOrder[wallet.baseCurrency.toLowerCase()],
        name: wallet.tokenKey,
        amount,
      })

      actions.notifications.show(constants.notifications.Transaction, {
        link: transactions.getLink(wallet.baseCurrency.toLowerCase(), hash),
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
        await actions.oneinch.fetchLatestLimitOrder({
          chainId: network.networkVersion,
          owner: makerWallet.address,
        })

        actions.modals.close(name)
        actions.notifications.show(constants.notifications.Message, {
          message: (
            <FormattedMessage
              id="limitOrderCreated"
              defaultMessage="You have successfully created the order"
            />
          ),
        })
      } else {
        actions.notifications.show(constants.notifications.Message, {
          message: (
            <FormattedMessage
              id="limitOrderIsNotCreated"
              defaultMessage="Something went wrong. Try again later"
            />
          ),
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
    const { name } = this.props
    const {
      currencies,
      takerList,
      makerAsset,
      takerAsset,
      makerWallet,
      takerWallet,
      isPending,
      needMakerApprove,
      enoughSwapCurrencies,
      wrongNetwork,
    } = this.state

    const linked = Link.all(this, 'makerAmount', 'takerAmount')
    const blockCreation = this.areWrongOrderParams() || !enoughSwapCurrencies || isPending

    // TODO: how to calculate the tx cost for token approvement ?
    // FIXME: don't let an user to start approvement without balance
    const blockApprove = blockCreation // || new BigNumber(makerWallet.balance).isLessThan(0)

    return (
      <ModalForm
        wrongNetwork={wrongNetwork}
        enoughSwapCurrencies={enoughSwapCurrencies}
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
        selectTakerAsset={this.selectTakerAsset}
        approve={this.approve}
        createOrder={this.createLimitOrder}
      />
    )
  }
}

export default connect(({ currencies, user }) => ({
  allCurrencies: currencies.items,
  activeFiat: user.activeFiat,
}))(LimitOrder)
