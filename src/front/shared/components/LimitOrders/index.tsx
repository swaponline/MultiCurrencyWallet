import { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import getCoinInfo from 'common/coins/getCoinInfo'
import { constants, transactions, feedback, apiLooper } from 'helpers'
import actions from 'redux/actions'
import Panel from 'components/ui/Panel/Panel'
import Table from 'components/tables/Table/Table'
import tableStyles from 'components/tables/Table/Table.scss'
import UserPanelHeader from './UserPanelHeader'
import AllOrdersHeader from './AllOrdersHeader'
import Row from './Row'

const tableTitles = [
  ' ',
  <FormattedMessage id="youPay" defaultMessage="You Pay" />,
  <FormattedMessage id="partial255" defaultMessage="You Get" />,
  <FormattedMessage id="rate" defaultMessage="Rate" />,
  ' ',
]

function LimitOrders(props) {
  const { allCurrencies, userOrders, blockchains, tokensWallets } = props
  const chainsArr: IUniversalObj[] = Object.values(blockchains)

  const { currencies, wrongNetwork } = actions.oneinch.filterCurrencies({
    currencies: allCurrencies,
    tokensWallets: tokensWallets,
    onlyTokens: true,
  })

  const [displayedChainId, setDisplayedChainId] = useState(chainsArr[0]?.networkVersion)
  const [baseCurrency, setBaseCurrency] = useState(blockchains[displayedChainId].currency)
  const [allTokens, setAllTokens] = useState(currencies.filter((item) => {
    const { blockchain: base } = getCoinInfo(item.value)

    return base === baseCurrency
  }))

  useEffect(() => {
    const base = blockchains[displayedChainId].currency

    setBaseCurrency(base)
    setAllTokens(
      currencies.filter((item) => {
        const { blockchain: baseCurrency } = getCoinInfo(item.value)

        return baseCurrency === base
      })
    )
  }, [displayedChainId])

  const cancelOrder = async (params) => {
    const { orderIndex, order, makerWallet, makerAsset, takerAsset } = params

    actions.modals.open(constants.modals.Confirm, {
      onAccept: async () => {
        const receipt = await actions.oneinch.cancelLimitOrder({
          baseCurrency: baseCurrency.toLowerCase(),
          chainId: displayedChainId,
          orderIndex,
          orderData: order.data,
        })

        feedback.oneinch.cancelOrder(
          `${makerAsset.tokenKey.toUpperCase()} -> ${takerAsset.tokenKey.toUpperCase()}`
        )
        actions.notifications.show(constants.notifications.Transaction, {
          link: transactions.getLink(makerWallet.standard, receipt.transactionHash),
        })
      },
      message: (
        <FormattedMessage
          id="orders94s"
          defaultMessage="Are you sure you want to delete the order?"
        />
      ),
    })
  }

  const hasChainOrders = userOrders[displayedChainId]?.length
  const [allOrders, setAllOrders] = useState<any>([])

  useEffect(() => {
    let _mounted = true

    const updateOrders = async () => {
      const orders = await actions.oneinch.fetchAllOrders({
        chainId: displayedChainId,
        page: 1,
        pageItems: 30,
      })

      //if (_mounted) setAllOrders(orders)
    }

    updateOrders()

    return () => {
      _mounted = false
    }
  }, [])

  const [sellCurrency, setSellCurrency] = useState<any>(allTokens[0])
  const [buyCurrencies, setBuyCurrencies] = useState<IUniversalObj[]>(
    allTokens.filter((item) => item.name !== sellCurrency.name)
  )
  const [buyCurrency, setBuyCurrency] = useState<any>(buyCurrencies[0])

  useEffect(() => {
    const list = allTokens.filter((item) => item.name !== sellCurrency.name)

    if (list.length) setBuyCurrencies(list)
  }, [sellCurrency])

  const selectSellCurrency = (currency) => {
    setSellCurrency(currency.value)
  }

  const selectBuyCurrency = (currency) => {
    setBuyCurrency(currency.value)
  }

  return (
    <>
      <Panel
        header={
          <UserPanelHeader
            userOrders={userOrders}
            chainId={displayedChainId}
            changeChain={setDisplayedChainId}
            allTokens={allTokens}
            buyCurrencies={buyCurrencies}
            selectSellCurrency={selectSellCurrency}
            selectBuyCurrency={selectBuyCurrency}
            sellCurrency={sellCurrency}
            buyCurrency={buyCurrency}
          />
        }
      >
        {hasChainOrders ? (
          <Table
            id="limitOrdersTable"
            className={tableStyles.exchange}
            styleName="orderBookTable"
            titles={tableTitles}
            rows={userOrders[displayedChainId]}
            rowRender={(order, index) => (
              <Row
                isMy
                tokensWallets={tokensWallets}
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

      <Panel header={<AllOrdersHeader allOrders={allOrders} chainId={displayedChainId} />}>
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
  userOrders: oneinch.orders,
  blockchains: oneinch.blockchains,
  tokensWallets: user.tokensData,
  allCurrencies: currencies.items,
}))(CSSModules(LimitOrders, styles, { allowMultiple: true }))
