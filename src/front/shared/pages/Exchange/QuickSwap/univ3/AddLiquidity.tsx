import { useState, useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import styles from './AddLiquidity.scss'
import CSSModules from 'react-css-modules'
import BigNumber from 'bignumber.js'
import actions from 'redux/actions'
import modals from 'helpers/constants/modals'
import {
  PositionAction,
  VIEW_SIDE
} from './types'
import { renderPricePerToken } from './helpers'
import { formatAmount } from './helpers'
import Button from 'components/controls/Button/Button'


function AddLiquidity(props) {
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
    },
    owner,
    baseCurrency,
    chainId,
  } = props

  const [ poolViewSide, setPoolViewSide ] = useState(VIEW_SIDE.A_TO_B)
  
  const [ amount0, setAmount0 ] = useState(0)
  const [ amount1, setAmount1 ] = useState(0)

  const [ token0Balance, setToken0Balance ] = useState(0)
  const [ token1Balance, setToken1Balance ] = useState(0)
  
  const posInRange = (
    poolViewSide == VIEW_SIDE.A_TO_B
  ) ? (
    new BigNumber(priceHigh.buyOneOfToken1).isLessThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken1) 
    && new BigNumber(priceLow.buyOneOfToken1).isGreaterThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken1)
  ) : (
    new BigNumber(priceLow.buyOneOfToken0).isLessThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken0)
    && new BigNumber(priceHigh.buyOneOfToken0).isGreaterThanOrEqualTo(poolInfo.currentPrice.buyOneOfToken0)
  )
  
  const token0IsWrapped = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token0.address })
  const token1IsWrapped = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token0.address })
  const hasWrappedToken = token0IsWrapped || token1IsWrapped
  console.log('>>> PositionInfo', props, positionId, poolInfo, positionInfo)
  
  const handleAddLiquidity = () => {
    /*
    actions.modals.open(modals.Confirm, {
      title: (<FormattedMessage id="qs_uni_pos_liq_del_title" defaultMessage="Confirm action" />),
      message: (<FormattedMessage id="qs_uni_pos_liq_del_message" defaultMessage="Remove liquidity?" />),
      onAccept: async () => {
        console.log('Remove')
        try {
          await actions.uniswap.removeLiquidityV3({
            baseCurrency,
            chainId,
            owner,
            position: positionInfo,
            percents: liqPercent,
            unwrap: (hasWrappedToken && doUnwrap) ? true : false,
          })
        } catch (err) {
          console.log('>>> ERROR', err)
        }
      }
    })
    */
  }

  return (
    <div>
      <div>
        <a onClick={() => { setCurrentAction(PositionAction.INFO) }}>
          Return back to positions
        </a>
      </div>
      <div>
        <h2>
          <FormattedMessage
            id="qs_uni_pos_liq_add_header"
            defaultMessage="Add liquidity"
          />
        </h2>
        <span>
          PositionId: {positionId}
        </span>
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
        <div>
          <div>
            <input type="number" value={amount0} onChange={(e) => { setAmount0(Number(e.target.value)) }} />
            <span>{token0.symbol}</span>
            <em>
              <FormattedMessage
                id="uni_balance_holder"
                defaultMessage="Balance:"
              />
            </em>
            <i>{token0Balance}</i>
          </div>
        </div>
        <div>
          <div>
            <input type="number" value={amount1} onChange={(e) => { setAmount1(Number(e.target.value)) }} />
            <span>{token1.symbol}</span>
            <em>
              <FormattedMessage
                id="uni_balance_holder"
                defaultMessage="Balance:"
              />
            </em>
            <i>{token1Balance}</i>
          </div>
        </div>
      </div>
      <div>
        <Button
          brand
          onClick={() => { handleAddLiquidity() }}
          disabled={false /*(liqPercent == 0)*/}
        >
          <FormattedMessage
            id="qs_uni_pos_liq_add_confirm"
            defaultMessage="Add liquidity"
          />
        </Button>
        <Button onClick={() => { setCurrentAction(PositionAction.INFO) }}>
          <FormattedMessage
            id="qs_uni_pos_liq_add_cancel"
            defaultMessage="Cancel"
          />
        </Button>
      </div>
    </div>
  )
}

export default CSSModules(AddLiquidity, styles, { allowMultiple: true })