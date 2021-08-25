import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import BigNumber from 'bignumber.js'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import utils from 'common/utils'
import { constants, transactions } from 'helpers'
import actions from 'redux/actions'
import Coins from 'components/Coins/Coins'
import Button from 'components/controls/Button/Button'
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
  const {
    getTokenWallet,
    order,
    orderIndex,
    cancelOrder,
    chainId,
    baseCurrency,
    isMy = false,
  } = props
  const { data, makerRate, makerAmount: makerUnitAmount, takerAmount: takerUnitAmount } = order

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
  })

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

  // TODO: reverse all data if it's not owner's order
  // for the taker it will be:
  // makerAsset = takerAsset
  // takerAsset = makerAsset
  // ...

  const makerWallet = getTokenWallet(data.makerAsset)
  const takerWallet = getTokenWallet(data.takerAsset)

  const makerAssetName = makerWallet.tokenKey.toUpperCase()
  const takerAssetName = takerWallet.tokenKey.toUpperCase()

  const coinNames = [makerAssetName, takerAssetName]

  const fillOrder = async () => {
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
  }

  const cancel = () => {
    cancelOrder({
      makerWallet,
      takerWallet,
      orderIndex,
      order,
    })
  }

  // formatting via BigNumber remove not important decimals
  const makerAmount = new BigNumber(
    utils.amount.formatWithoutDecimals(makerUnitAmount, makerWallet.decimals)
  ).toString()

  const takerAmount = new BigNumber(
    utils.amount.formatWithoutDecimals(takerUnitAmount, takerWallet.decimals)
  ).toString()

  const formatedMakerRate = new BigNumber(makerRate).dp(8).toString()

  const mobileRangeWidth = 650 // px
  const mobileResolution = dimensions.width < mobileRangeWidth

  return (
    <tr styleName={`row ${mobileResolution ? 'mobile' : ''}`}>
      <td>
        <Coins names={coinNames} size={mobileResolution ? 20 : 25} />
      </td>
      <td>
        <span styleName="number">{makerAmount}</span> {makerWallet.currency}
      </td>
      <td>
        <span styleName="number">{takerAmount}</span> {takerWallet.currency}
      </td>
      <td styleName="rate">
        <span styleName="number">{formatedMakerRate}</span> {makerWallet.currency}/
        {takerWallet.currency}
      </td>
      <td>
        {isMy ? (
          <RemoveButton onClick={cancel} brand />
        ) : (
          // TODO: disable button if user does not have enough balance
          <Button id="createWalletBtn" brand onClick={fillOrder} disabled={false}>
            <FormattedMessage id="buyToken" defaultMessage="Buy" />
          </Button>
        )}
      </td>
    </tr>
  )
}

export default CSSModules(Row, styles, { allowMultiple: true })
