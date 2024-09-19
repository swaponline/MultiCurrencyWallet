import { useState, useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import styles from './PositionInfo.scss'
import CSSModules from 'react-css-modules'
import BigNumber from 'bignumber.js'

import {
  PositionAction,
  VIEW_SIDE
} from './types'
import { renderPricePerToken } from './helpers'
import Button from 'components/controls/Button/Button'

function PositionInfo(props) {
  const {
    positionId,
    setCurrentAction,
    poolInfo,
    positionInfo,
    positionInfo: {
      priceHigh,
      priceLow,
      token0,
      token1,
    }
  } = props

  const [ poolViewSide, setPoolViewSide ] = useState(VIEW_SIDE.A_TO_B)
  
  const posInRange = (
    poolViewSide == VIEW_SIDE.A_TO_B
  ) ? (
    new BigNumber(priceHigh.buyOneOfToken1).isLessThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken1) 
    && new BigNumber(priceLow.buyOneOfToken1).isGreaterThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken1)
  ) : (
    new BigNumber(priceLow.buyOneOfToken0).isLessThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken0)
    && new BigNumber(priceHigh.buyOneOfToken0).isGreaterThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken0)
  )
  console.log('>>> PositionInfo', positionId, poolInfo, positionInfo)
  return (
    <div>
      <div>
        <a onClick={() => { setCurrentAction(PositionAction.LIST) }}>
          Return back to positions list
        </a>
      </div>
      <div>
      
        PositionId: {positionId}
      </div>
      <div>
        <a onClick={() => { setPoolViewSide(VIEW_SIDE.A_TO_B) }}>{poolInfo.token0.symbol}</a>
        <a onClick={() => { setPoolViewSide(VIEW_SIDE.B_TO_A) }}>{poolInfo.token1.symbol}</a>
      </div>
      <div>
        <div>
          <strong>Min price</strong>
          <span>
            {renderPricePerToken({
              price: (poolViewSide == VIEW_SIDE.A_TO_B) ? priceHigh.buyOneOfToken1 : priceLow.buyOneOfToken0,
              tokenA: (poolViewSide == VIEW_SIDE.A_TO_B) ? token0.symbol : token1.symbol,
              tokenB: (poolViewSide == VIEW_SIDE.A_TO_B) ? token1.symbol : token0.symbol,
            })}
          </span>
        </div>
        <div>
          <strong>Max price</strong>
          <span>
            {renderPricePerToken({
              price: (poolViewSide == VIEW_SIDE.A_TO_B) ? priceLow.buyOneOfToken1 : priceHigh.buyOneOfToken0,
              tokenA: (poolViewSide == VIEW_SIDE.A_TO_B) ? token0.symbol : token1.symbol,
              tokenB: (poolViewSide == VIEW_SIDE.A_TO_B) ? token1.symbol : token0.symbol,
            })}
          </span>
        </div>
      </div>
      <div>
        <strong>Current price</strong>
        <span>
          {renderPricePerToken({
            price: (poolViewSide == VIEW_SIDE.A_TO_B) ? poolInfo.currentPrice.buyOneOfToken1 : poolInfo.currentPrice.buyOneOfToken0,
            tokenA: (poolViewSide == VIEW_SIDE.A_TO_B) ? token0.symbol : token1.symbol,
            tokenB: (poolViewSide == VIEW_SIDE.A_TO_B) ? token1.symbol : token0.symbol,
          })}
        </span>
      </div>
      <div>
        <Button
          brand
          onClick={() => { setCurrentAction(PositionAction.ADD_LIQUIDITY) }}
        >
          <FormattedMessage
            id="qs_uni_pos_liq_add"
            defaultMessage="Increase liquidity"
          />
        </Button>
        <Button
          brand
          onClick={() => { setCurrentAction(PositionAction.DEL_LIQUIDITY) }}
        >
          <FormattedMessage
            id="qs_uni_pos_liq_del"
            defaultMessage="Remove liquidity"
          />
        </Button>
      </div>
    </div>
  )
}

export default CSSModules(PositionInfo, styles, { allowMultiple: true })