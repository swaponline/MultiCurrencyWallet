import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import BigNumber from 'bignumber.js'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import utils from 'common/utils'
import { constants, transactions } from 'helpers'
import actions from 'redux/actions'
import Coins from 'components/Coins/Coins'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { RemoveButton } from 'components/controls'

function debounce(callback, ms) {
  let timer

  return () => {
    clearTimeout(timer)

    timer = setTimeout(() => {
      timer = null
      callback.apply(this, arguments)
    }, ms)
  }
}

function Row(props) {
  const { getTokenWallet, order, orderIndex, cancelOrder, baseCurrency } = props
  const {
    data,
    makerRate,
    takerRate,
    makerAmount: makerUnitAmount,
    takerAmount: takerUnitAmount,
    orderMaker,
  } = order

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
  })
  const [pending, setPending] = useState(false)

  let { isMy = false } = props
  const makerWallet = getTokenWallet(data.makerAsset)
  const takerWallet = getTokenWallet(data.takerAsset)

  if (!isMy) {
    isMy =
      orderMaker === makerWallet.address.toLowerCase() ||
      orderMaker === takerWallet.address.toLowerCase()
  }

  useEffect(() => {
    const debouncedHandleResize = debounce(() => {
      setDimensions({
        width: window.innerWidth,
      })
    }, 500)

    window.addEventListener('resize', debouncedHandleResize)

    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  })

  const fillOrder = async () => {
    setPending(true)

    const receipt = await actions.oneinch.fillLimitOrder({
      name: takerWallet.tokenKey,
      standard: takerWallet.standard,
      order,
      baseCurrency: baseCurrency.toLowerCase(),
      takerDecimals: takerWallet.decimals,
      amountToBeFilled: utils.amount.formatWithoutDecimals(takerUnitAmount, takerWallet.decimals),
    })

    if (receipt) {
      actions.notifications.show(constants.notifications.Transaction, {
        link: transactions.getLink(takerWallet.baseCurrency.toLowerCase(), receipt.transactionHash),
        completed: true,
      })
    } else {
      actions.notifications.show(constants.notifications.ErrorNotification, {
        error: (
          <FormattedMessage
            id="ErrorNotification12"
            defaultMessage="Oops, looks like something went wrong!"
          />
        ),
      })
    }

    setPending(false)
  }

  const cancel = () => {
    setPending(true)

    cancelOrder({
      makerWallet,
      takerWallet,
      orderIndex,
      order,
      onComplete: () => setPending(true),
    })
  }

  // formatting via BigNumber remove not important decimals
  const makerAmount = new BigNumber(
    utils.amount.formatWithoutDecimals(makerUnitAmount, makerWallet.decimals)
  ).toString()

  const takerAmount = new BigNumber(
    utils.amount.formatWithoutDecimals(takerUnitAmount, takerWallet.decimals)
  ).toString()

  const mobileRangeWidth = 650 // px
  const mobileResolution = dimensions.width < mobileRangeWidth

  const renderRowItems = (params) => {
    const { walletA, amountA, walletB, amountB, rate, actionButton } = params

    return (
      <tr styleName={`row ${mobileResolution ? 'mobile' : ''}`}>
        <td>
          <Coins
            names={[walletA.tokenKey.toUpperCase(), walletB.tokenKey.toUpperCase()]}
            size={mobileResolution ? 20 : 25}
          />
        </td>
        <td>
          <span styleName="number">{amountA}</span> {walletA.currency}
        </td>
        <td>
          <span styleName="number">{amountB}</span> {walletB.currency}
        </td>
        <td styleName="rate">
          <span styleName="number">{rate}</span> {walletA.currency}/{walletB.currency}
        </td>
        <td>{actionButton}</td>
      </tr>
    )
  }

  return isMy
    ? renderRowItems({
        walletA: makerWallet,
        amountA: makerAmount,
        walletB: takerWallet,
        amountB: takerAmount,
        rate: new BigNumber(makerRate).dp(8).toString(),
        actionButton: pending ? <InlineLoader /> : <RemoveButton onClick={cancel} brand />,
      })
    : renderRowItems({
        walletA: takerWallet,
        amountA: takerAmount,
        walletB: makerWallet,
        amountB: makerAmount,
        rate: new BigNumber(takerRate).dp(8).toString(),
        actionButton: pending ? (
          <InlineLoader />
        ) : (
          <button
            id="createWalletBtn"
            styleName="purchasButton"
            onClick={fillOrder}
            // TODO: disable button if user does not have enough balance
            disabled={false}
          >
            <FormattedMessage id="buyToken" defaultMessage="Buy" />
          </button>
        ),
      })
}

export default CSSModules(Row, styles, { allowMultiple: true })
