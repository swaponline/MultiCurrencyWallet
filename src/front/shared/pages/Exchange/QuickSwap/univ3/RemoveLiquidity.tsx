import { useState, useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import styles from './RemoveLiquidity.scss'
import CSSModules from 'react-css-modules'
import BigNumber from 'bignumber.js'
import actions from 'redux/actions'
import modals from 'helpers/constants/modals'
import {
  PositionAction,
  VIEW_SIDE
} from './types'
import { formatAmount } from './helpers'
import Button from 'components/controls/Button/Button'
import Toggle from 'components/controls/Toggle/Toggle'
import BackButton from './ui/BackButton'


function RemoveLiquidity(props) {
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

  const [ liqPercent, setLiqPercent ] = useState(0)
  const [ doUnwrap, setDoUnwrap ] = useState(true)

  const token0IsWrapped = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token0.address })
  const token1IsWrapped = actions.uniswap.isWrappedToken({ chainId, tokenAddress: token0.address })
  const hasWrappedToken = token0IsWrapped || token1IsWrapped
  console.log('>>> PositionInfo', props, positionId, poolInfo, positionInfo)
  
  const handleRemoveLiquidity = () => {
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
  }

  return (
    <div>
      <BackButton onClick={() => { setCurrentAction(PositionAction.INFO) }}>
        <FormattedMessage id="qs_uni_return_to_pos_info" defaultMessage="Return back to position info" />
      </BackButton>
      <div>
        <h2>
          <FormattedMessage
            id="qs_uni_pos_liq_del_header"
            defaultMessage="Remove liquidity"
          />
        </h2>
        <span>
          PositionId: {positionId}
        </span>
      </div>
      <div>
        <strong>Amount:</strong>
        <div>
          <div>
            <span>
              {liqPercent}%
            </span>
            <a onClick={() => { setLiqPercent(25) }}>25%</a>
            <a onClick={() => { setLiqPercent(50) }}>50%</a>
            <a onClick={() => { setLiqPercent(75) }}>75%</a>
            <a onClick={() => { setLiqPercent(100) }}>max%</a>
          </div>
          <input type="range" min={0} max={100} value={liqPercent} onChange={(e) => { setLiqPercent(Number(e.target.value)) }} />
        </div>
      </div>
      <div>
        <div>
          <span>
            <FormattedMessage id="qs_uni_pos_liq_del_token_symbol" defaultMessage="Pooled {symbol}:" values={{symbol: token0.symbol}} />
          </span>
          <strong>
            {formatAmount(new BigNumber(token0.amount).dividedBy(100).multipliedBy(liqPercent).toNumber())}
          </strong>
        </div>
        <div>
          <span>
            <FormattedMessage id="qs_uni_pos_liq_del_token_symbol" defaultMessage="Pooled {symbol}:" values={{symbol: token1.symbol}} />
          </span>
          <strong>
            {formatAmount(new BigNumber(token1.amount).dividedBy(100).multipliedBy(liqPercent).toNumber())}
          </strong>
        </div>
        {hasWrappedToken && (
          <div>
            <Toggle checked={!doUnwrap} onChange={(v) => { setDoUnwrap(v) }} />
            <span>
              <FormattedMessage
                id="qs_uni_pos_liq_del_unwrap"
                defaultMessage="Collect as {tokenSymbol}"
                values={{
                  tokenSymbol: (token0IsWrapped) ? token0.symbol : token1.symbol
                }}
              />
            </span>
          </div>
        )}
      </div>
      <div>
        <Button
          brand
          onClick={() => { handleRemoveLiquidity() }}
          disabled={(liqPercent == 0)}
          fullWidth
        >
          <FormattedMessage
            id="qs_uni_pos_liq_del_confirm"
            defaultMessage="Remove liquidity"
          />
        </Button>
      </div>
    </div>
  )
}

export default CSSModules(RemoveLiquidity, styles, { allowMultiple: true })