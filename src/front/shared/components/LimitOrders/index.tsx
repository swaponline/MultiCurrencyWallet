import { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import getCoinInfo from 'common/coins/getCoinInfo'
import { constants, transactions, feedback, metamask } from 'helpers'
import actions from 'redux/actions'
import Panel from 'components/ui/Panel/Panel'
import Table from 'components/tables/Table/Table'
import tableStyles from 'components/tables/Table/Table.scss'
import OrderSettings from './OrderSettings'
import AllOrdersHeader from './AllOrdersHeader'
import Row from './Row'

const tableTitles = [
  ' ',
  <FormattedMessage id="youPay" defaultMessage="You pay" />,
  <FormattedMessage id="partial255" defaultMessage="You get" />,
  <FormattedMessage id="rate" defaultMessage="Rate" />,
  ' ',
]

function LimitOrders(props) {
  let { allCurrencies, blockchains, tokensWallets } = props

  const metamaskChainId = metamask.isConnected() && metamask.getChainId()

  if (metamaskChainId && blockchains[metamaskChainId]) {
    blockchains = {
      [metamaskChainId]: blockchains[metamaskChainId],
    }
  }

  const chainsArr: IUniversalObj[] = Object.values(blockchains)

  const { currencies, wrongNetwork } = actions.oneinch.filterCurrencies({
    currencies: allCurrencies,
    onlyTokens: true,
  })

  const [updateData, setUpdateData] = useState(false)
  // change the variable above for updating orders from time to time
  useEffect(() => {
    const intervalInSec = 5_000
    const timeoutId = setInterval(() => {
      setUpdateData(!updateData)
    }, intervalInSec)

    return () => {
      clearTimeout(timeoutId)
    }
  })

  const [displayedChainId, setDisplayedChainId] = useState(chainsArr[0]?.networkVersion)
  const [baseCurrency, setBaseCurrency] = useState(blockchains[displayedChainId].currency)
  const [allTokens, setAllTokens] = useState(
    currencies.filter((item) => {
      const { blockchain: base } = getCoinInfo(item.value)

      return base === baseCurrency
    })
  )

  const cancelOrder = async (params) => {
    const { orderIndex, order, makerWallet, takerWallet, onComplete } = params

    actions.modals.open(constants.modals.Confirm, {
      onAccept: async () => {
        const receipt = await actions.oneinch.cancelLimitOrder({
          baseCurrency: baseCurrency.toLowerCase(),
          chainId: displayedChainId,
          orderIndex,
          orderData: order.data,
        })

        onComplete()

        feedback.oneinch.cancelOrder(
          `${makerWallet.tokenKey.toUpperCase()} -> ${takerWallet.tokenKey.toUpperCase()}`
        )
        actions.notifications.show(constants.notifications.Transaction, {
          link: transactions.getLink(makerWallet.standard, receipt.transactionHash),
        })
      },
      onCancel: onComplete,
      message: (
        <FormattedMessage
          id="orders94s"
          defaultMessage="Are you sure you want to delete the order?"
        />
      ),
    })
  }

  const [sellCurrency, setSellCurrency] = useState<any>(allTokens[0])
  const [buyCurrencies, setBuyCurrencies] = useState<IUniversalObj[]>(
    allTokens.filter((item) => item.name !== sellCurrency.name)
  )
  const [buyCurrency, setBuyCurrency] = useState<any>(buyCurrencies[0])

  useEffect(() => {
    const base = blockchains[displayedChainId].currency
    const allTokens = currencies.filter((item) => {
      const { blockchain: baseCurrency } = getCoinInfo(item.value)

      return baseCurrency === base
    })

    const list = allTokens.filter((item) => item.name !== sellCurrency.name)

    setBaseCurrency(base)
    setAllTokens(allTokens)
    setSellCurrency(allTokens[0])

    if (list.length) {
      setBuyCurrencies(list)
      setBuyCurrency(list[0])
    }
  }, [displayedChainId])

  const selectSellCurrency = (currency) => {
    setSellCurrency(currency)
  }

  const selectBuyCurrency = (currency) => {
    setBuyCurrency(currency)
  }

  useEffect(() => {
    if (sellCurrency) {
      const list = allTokens.filter((item) => item.name !== sellCurrency.name)

      setBuyCurrencies(list)

      if (sellCurrency?.value === buyCurrency?.value) {
        setBuyCurrency(list[0])
      }
    }
  }, [sellCurrency])

  const [allOrders, setAllOrders] = useState<any>([])
  const [userOrders, setUserOrders] = useState<any>([])

  const getCurrentWallets = (isMy = false) => {
    const makerCurrency = isMy ? sellCurrency.value : buyCurrency.value
    const takerCurrency = isMy ? buyCurrency.value : sellCurrency.value

    return {
      makerWallet: actions.core.getWallet({ currency: makerCurrency }),
      takerWallet: actions.core.getWallet({ currency: takerCurrency }),
    }
  }

  const fetchAllOrders = async () => {
    const { takerWallet, makerWallet } = getCurrentWallets()

    return await actions.oneinch.fetchAllOrders({
      chainId: displayedChainId,
      page: 1,
      pageItems: 20,
      takerAsset: takerWallet.contractAddress,
      makerAsset: makerWallet.contractAddress,
    })
  }

  const fetchUserOrders = async () => {
    const { takerWallet, makerWallet } = getCurrentWallets(true)

    return await actions.oneinch.fetchOwnerOrders({
      chainId: displayedChainId,
      owner: makerWallet.address,
      makerAsset: makerWallet.contractAddress,
      takerAsset: takerWallet.contractAddress,
    })
  }

  useEffect(() => {
    let _mounted = true

    const updateOrders = async () => {
      const userOrders = await fetchUserOrders()
      const orders = await fetchAllOrders()

      if (_mounted) {
        setAllOrders(orders)
        setUserOrders(userOrders)
      }
    }

    if (sellCurrency && buyCurrency) {
      updateOrders()
    }

    return () => {
      _mounted = false
    }
  }, [displayedChainId, sellCurrency, buyCurrency, updateData])

  const getTokenWallet = (contract) => {
    return Object.values(tokensWallets).find(
      (wallet: IUniversalObj) => wallet.contractAddress?.toLowerCase() === contract.toLowerCase()
    )
  }

  const fetchMakerOrders = async (address) => {
    const { takerWallet, makerWallet } = getCurrentWallets()

    const orders = await actions.oneinch.fetchOwnerOrders({
      chainId: displayedChainId,
      owner: address,
      makerAsset: makerWallet.contractAddress,
      takerAsset: takerWallet.contractAddress,
    })

    setAllOrders(orders)
  }

  const hasChainOrders = userOrders.length

  return (
    <>
      <Panel>
        <OrderSettings
          blockchains={blockchains}
          chainId={displayedChainId}
          changeChain={setDisplayedChainId}
          allTokens={allTokens}
          buyCurrencies={buyCurrencies}
          selectSellCurrency={selectSellCurrency}
          selectBuyCurrency={selectBuyCurrency}
          sellCurrency={sellCurrency}
          buyCurrency={buyCurrency}
        />
      </Panel>

      <Panel
        header={
          <div styleName="header">
            <h3>
              <FormattedMessage id="yourOrders" defaultMessage="Your orders" />{' '}
              <span>{`(${userOrders.length})`}</span>
            </h3>
          </div>
        }
      >
        {hasChainOrders ? (
          <Table
            id="limitOrdersTable"
            className={tableStyles.exchange}
            styleName="orderBookTable"
            titles={tableTitles}
            rows={userOrders}
            rowRender={(order, index) => (
              <Row
                isMy
                tokensWallets={tokensWallets}
                getTokenWallet={getTokenWallet}
                order={order}
                orderIndex={index}
                cancelOrder={cancelOrder}
                chainId={displayedChainId}
                baseCurrency={baseCurrency}
                sellCurrency={sellCurrency}
                buyCurrency={buyCurrency}
              />
            )}
          />
        ) : (
          <p styleName="noOrdersMessage">
            <FormattedMessage id="noActiveOrders" defaultMessage="No active orders" />
          </p>
        )}
      </Panel>

      <Panel
        header={
          <AllOrdersHeader
            baseCurrency={baseCurrency}
            allOrders={allOrders}
            fetchMakerOrders={fetchMakerOrders}
          />
        }
      >
        {allOrders.length ? (
          <Table
            id="limitOrdersTable"
            className={tableStyles.exchange}
            styleName="orderBookTable"
            titles={tableTitles}
            rows={allOrders}
            rowRender={(order, index) => (
              <Row
                tokensWallets={tokensWallets}
                getTokenWallet={getTokenWallet}
                order={order}
                orderIndex={index}
                cancelOrder={cancelOrder}
                chainId={displayedChainId}
                baseCurrency={baseCurrency}
                sellCurrency={sellCurrency}
                buyCurrency={buyCurrency}
              />
            )}
          />
        ) : (
          <p styleName="noOrdersMessage">
            <FormattedMessage id="noActiveOrders" defaultMessage="No active orders" />
          </p>
        )}
      </Panel>
    </>
  )
}

export default connect(({ oneinch, currencies, user }) => ({
  blockchains: oneinch.blockchains,
  tokensWallets: user.tokensData,
  allCurrencies: currencies.items,
}))(CSSModules(LimitOrders, styles, { allowMultiple: true }))
