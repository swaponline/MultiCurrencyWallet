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
  hasTxSize: boolean

  currency: string
  dataCurrency: string

  exCurrencyRate: number
  minerFee: number
  serviceFee: number
  totalFee: number

  txSize?: number
  feeCurrentCurrency?: number
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
    hasTxSize,
    txSize,
    feeCurrentCurrency,
  } = props

  const linkToTxSizeInfo = (
    <a
      href="https://en.bitcoin.it/wiki/Maximum_transaction_rate#:~:text=Each%20transaction%20input%20requires%20at,the%20minimum-sized%20Bitcoin%20transaction"
      target="_blank"
    >
      (?)
    </a>
  )

  const transactionSize = (
    <>
      {feeCurrentCurrency} sat/byte * {txSize} bytes {linkToTxSizeInfo} ={' '}
    </>
  )

  return (
    <section styleName='feeInfoBlock'>
      <div styleName='feeRow'>
        <span styleName='feeRowTitle'>
          <FormattedMessage id="FeeInfoBlockMinerFee" defaultMessage="Miner Fee:" />
        </span>
        <div className="feeRowInfo">
          {isLoading
            ? <div styleName='paleLoader'><InlineLoader /></div>
            : <span styleName='fee'>
                {hasTxSize && feeCurrentCurrency > 0 ? transactionSize : null}
                {minerFee} {dataCurrency}&#32; {/* space */}
                (~${new BigNumber(minerFee * exCurrencyRate).dp(2, BigNumber.ROUND_UP).toNumber()})
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
      </div>
      
      {hasServiceFee && (
          <div styleName='feeRow'>
            <span styleName='feeRowTitle'>
              <FormattedMessage id="FeeInfoBlockServiceFee" defaultMessage="Service Fee:" />
            </span>
            <div className="feeRowInfo">
              {isLoading
                ? <div styleName='paleLoader'><InlineLoader /></div>
                : <span styleName='fee'>{serviceFee} {isEthToken ? currency : dataCurrency}</span>
              }
            </div>
          </div>
        )
      }

      {!isEthToken && (
        <div styleName='feeRow'>
          <span styleName='feeRowTitle'>
            <FormattedMessage id="FeeInfoBlockTotalFee" defaultMessage="Total fee you pay:" />
          </span>
          <div className="feeRowInfo">
            {isLoading 
              ? <div styleName='paleLoader'><InlineLoader /></div>
              : <span styleName='fee'>{totalFee} {dataCurrency}&#32; {/* space */}
                  (~${new BigNumber(totalFee * exCurrencyRate).dp(2, BigNumber.ROUND_UP).toNumber()})
                </span>
            }
          </div>
        </div>
        )
      }
    </section>
  )
}

export default cssModules(FeeInfoBlock, styles, { allowMultiple: true })
