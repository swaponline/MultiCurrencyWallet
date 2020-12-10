import React from 'react'
import cssModules from 'react-css-modules'
import styles from './FeeInfoBlock.scss'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'

import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

type FeeInfoBlockProps = {
  isLoading: boolean
  isEthToken: boolean
  hasServiceFee: boolean

  currency: string
  dataCurrency: string

  exCurrencyRate: number
  minerFee: number
  serviceFee: number
  totalFee: number
}

function FeeInfoBlock(props: FeeInfoBlockProps) {
  const {
    isEthToken,
    currency,
    dataCurrency,
    exCurrencyRate,
    isLoading,
    minerFee,
    hasServiceFee,
    serviceFee,
    totalFee,
  } = props

  return (
    <section styleName='feeInfoBlock'>
      <div styleName='feeRow'>
        <FormattedMessage id="FeeInfoBlockMinerFee" defaultMessage="Miner Fee:" />
        {' '}{/* indent */}
        {isLoading
          ? <div styleName='paleLoader'><InlineLoader /></div>
          : <span styleName='fee'>{minerFee} {dataCurrency}&#32; {/* space */}
              (~{new BigNumber(minerFee * exCurrencyRate).dp(2, BigNumber.ROUND_UP).toNumber()}$)
            </span>
        }
        {' '}{/* indent */}
        <Tooltip id="FeeInfoBlockMinerFeeTooltip">
          <div style={{ maxWidth: '24em', textAlign: 'center' }}>
            <FormattedMessage
              id="FeeInfoBlockMinerFeeTooltip"
              defaultMessage="Amount of cryptocurrency paid to incentivize miners to confirm your transaction"
            />
          </div>
        </Tooltip>
      </div>
      
      {hasServiceFee && (
          <div styleName='feeRow'>
            <FormattedMessage id="FeeInfoBlockServiceFee" defaultMessage="Service Fee:" />
            {' '}{/* indent */}
            {isLoading
              ? <div styleName='paleLoader'><InlineLoader /></div>
              : <span styleName='fee'>{serviceFee} {isEthToken ? currency : dataCurrency}</span>
            }
          </div>
        )
      }

      {!isEthToken && (
        <div styleName='feeRow'>
          <FormattedMessage id="FeeInfoBlockTotalFee" defaultMessage="Total fee you pay:" />
          {' '}{/* indent */}
          {isLoading 
            ? <div styleName='paleLoader'><InlineLoader /></div>
            : <span styleName='fee'>{totalFee} {dataCurrency}&#32; {/* space */}
                (~{new BigNumber(totalFee * exCurrencyRate).dp(2, BigNumber.ROUND_UP).toNumber()}$)
              </span>
          }
        </div>
        )
      }
    </section>
  )
}

export default cssModules(FeeInfoBlock, styles, { allowMultiple: true })
