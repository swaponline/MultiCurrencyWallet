import { useState, useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import styles from './AddLiquidity.scss'
import CSSModules from 'react-css-modules'
import BigNumber from 'bignumber.js'
import actions from 'redux/actions'
import modals from 'helpers/constants/modals'
import {
  PositionAction,
  VIEW_SIDE,
  TOKEN,
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
      addLiquidityPrice,
      token0,
      token0: {
        address: token0Address,
      },
      token1,
      token1: {
        address: token1Address,
      },
    },
    owner,
    baseCurrency,
    chainId,
  } = props

  const [ poolViewSide, setPoolViewSide ] = useState(VIEW_SIDE.A_TO_B)
  
  const isWrappedToken0 = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token0.address })
  const isWrappedToken1 = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token1.address })

  const [ amount0, setAmount0 ] = useState(0)
  const [ amount1, setAmount1 ] = useState(0)

  const [ token0Balance, setToken0Balance ] = useState(0)
  const [ token1Balance, setToken1Balance ] = useState(0)

  const calcAmount = (amount, token) => {
    if (token == TOKEN._0) {
      const _amount1 = new BigNumber(amount).multipliedBy(addLiquidityPrice.buyOneOfToken0).toNumber()
      setAmount0(amount)
      setAmount1(_amount1)
    }
    if (token == TOKEN._1) {
      const _amount0 = new BigNumber(amount).multipliedBy(addLiquidityPrice.buyOneOfToken1).toNumber()
      setAmount0(_amount0)
      setAmount1(amount)
    }
  }

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
  console.log('>>> isWrappedToken', isWrappedToken0, isWrappedToken1, baseCurrency)
  const getTokenSymbol = (tokenType) => {
    return (tokenType == TOKEN._0)
      ? isWrappedToken0 ? baseCurrency : token0.symbol
      : isWrappedToken1 ? baseCurrency : token1.symbol
  }

  useEffect(() => {
    console.log('>>> check balance and approval')
    actions.uniswap.getBalanceAndAllowanceV3({
      baseCurrency,
      chainId,
      owner,
      token0Address,
      token1Address
    }).then((balanceAndApprove) => {
      console.log('>>>> balanceAndApprove', balanceAndApprove)
    })
  }, [token0Address, token1Address])

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
        <a onClick={() => { setPoolViewSide(VIEW_SIDE.A_TO_B) }}>{getTokenSymbol(TOKEN._0)}</a>
        <a onClick={() => { setPoolViewSide(VIEW_SIDE.B_TO_A) }}>{getTokenSymbol(TOKEN._1)}</a>
      </div>
      <div>
        <div>
          <strong>Min price</strong>
          <span>
            {renderPricePerToken({
              price: (poolViewSide == VIEW_SIDE.A_TO_B) ? priceHigh.buyOneOfToken1 : priceLow.buyOneOfToken0,
              tokenA: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._0) : getTokenSymbol(TOKEN._1),
              tokenB: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._1) : getTokenSymbol(TOKEN._0),
            })}
          </span>
        </div>
        <div>
          <strong>Max price</strong>
          <span>
            {renderPricePerToken({
              price: (poolViewSide == VIEW_SIDE.A_TO_B) ? priceLow.buyOneOfToken1 : priceHigh.buyOneOfToken0,
              tokenA: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._0) : getTokenSymbol(TOKEN._1),
              tokenB: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._1) : getTokenSymbol(TOKEN._0),
            })}
          </span>
        </div>
      </div>
      <div>
        <strong>Current price</strong>
        <span>
          {renderPricePerToken({
            price: (poolViewSide == VIEW_SIDE.A_TO_B) ? poolInfo.currentPrice.buyOneOfToken1 : poolInfo.currentPrice.buyOneOfToken0,
            tokenA: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._0) : getTokenSymbol(TOKEN._1),
            tokenB: (poolViewSide == VIEW_SIDE.A_TO_B) ? getTokenSymbol(TOKEN._1) : getTokenSymbol(TOKEN._0),
          })}
        </span>
      </div>
      <div>
        <div>
          <div>
            <input
              type="number"
              value={amount0}
              onChange={(e) => { calcAmount(Number(e.target.value), TOKEN._0) }}
            />
            <span>{getTokenSymbol(TOKEN._0)}</span>
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
            <input
              type="number"
              value={amount1}
              onChange={(e) => { calcAmount(Number(e.target.value), TOKEN._1) }}
            />
            <span>{getTokenSymbol(TOKEN._1)}</span>
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