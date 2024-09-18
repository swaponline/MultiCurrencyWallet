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
            unwrap: true,
          })
        } catch (err) {
          console.log('>>> ERROR', err)
        }
      }
    })
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
      </div>
      <div>
        <Button
          brand
          onClick={() => { handleRemoveLiquidity() }}
          disabled={(liqPercent == 0)}
        >
          <FormattedMessage
            id="qs_uni_pos_liq_del_confirm"
            defaultMessage="Remove liquidity"
          />
        </Button>
        <Button onClick={() => { setCurrentAction(PositionAction.INFO) }}>
          <FormattedMessage
            id="qs_uni_pos_liq_del_cancel"
            defaultMessage="Cancel"
          />
        </Button>
      </div>
    </div>
  )
}

export default CSSModules(RemoveLiquidity, styles, { allowMultiple: true })