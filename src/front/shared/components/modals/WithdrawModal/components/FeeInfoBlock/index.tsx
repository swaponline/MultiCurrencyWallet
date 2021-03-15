import React from 'react'
import cssModules from 'react-css-modules'
import styles from './index.scss'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'

import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

type FeeInfoBlockProps = {
  isLoading: boolean
  isEthToken: boolean
  hasTxSize: boolean
  
  currency: string
  activeFiat: string
  dataCurrency: string
  
  currentDecimals: number
  txSize?: number
  feeCurrentCurrency?: number
  exEthereumRate?: BigNumber
  exCurrencyRate?: BigNumber
  minerFee: BigNumber
  serviceFee: BigNumber
  totalFee: BigNumber
  usedAdminFee: undefined | {
    address: string
    fee: number // percent (%)
    min: number
  }
}

function FeeInfoBlock(props: FeeInfoBlockProps) {
  const {
    isEthToken,
    currency,
    currentDecimals,
    activeFiat,
    dataCurrency,
    exEthereumRate = 0,
    exCurrencyRate = 0,
    isLoading,
    minerFee,
    serviceFee,
    usedAdminFee,
    totalFee,
    hasTxSize,
    txSize,
    feeCurrentCurrency,
  } = props

  const minerFeeTicker = dataCurrency
  const serviceFeeTicker = currency
  let activeFiatSymbol = activeFiat

  switch (activeFiatSymbol.toLowerCase()) {
    case 'usd':
      activeFiatSymbol = '$'
      break
    case 'eur':
      activeFiatSymbol = '€'
      break
  }

  const convertToFiat = (currency, exchangeRate) => {
    // check after converting
    // if  0.<two-digit number more 0> then cut result to two numbers
    // else cut result to currency decimals
    let bigNumResult = currency.multipliedBy(exchangeRate)
    const strResult = bigNumResult.toString()
    const haveTwoZeroAfterDot = 
      strResult.match(/\./) 
      && strResult.split('.')[1][0] === '0' // 12.34 -> ['12', '34'] -> ['3'] === '0'
      && strResult.split('.')[1][1] === '0' // 12.34 -> ['12', '34'] -> ['4'] === '0'
      
    bigNumResult = haveTwoZeroAfterDot 
      ? bigNumResult.dp(currentDecimals, BigNumber.ROUND_CEIL)
      : bigNumResult.dp(2, BigNumber.ROUND_CEIL)
    
    return bigNumResult.toNumber()
  }

  const fiatMinerFee = isEthToken
    ? exEthereumRate > 0 // eth rate for tokens
      ? convertToFiat(minerFee, exEthereumRate)
      : 0
    : exCurrencyRate > 0 // own currency rate for another
      ? convertToFiat(minerFee, exCurrencyRate)
      : 0

  const fiatServiceFee = usedAdminFee
    ? exCurrencyRate > 0
      ? convertToFiat(serviceFee, exCurrencyRate)
      : 0
    : 0

  const fiatTotalFee = exCurrencyRate > 0 && !isEthToken
    ? convertToFiat(totalFee, exCurrencyRate)
    : 0

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
      {feeCurrentCurrency}&nbsp;sat/byte * {txSize}&nbsp;bytes&nbsp;{linkToTxSizeInfo} ={' '}
    </>
  )

  return (
    <section styleName='feeInfoBlock'>
      <div styleName='feeRow'>
        <span styleName='feeRowTitle'>
          <FormattedMessage id="FeeInfoBlockMinerFee" defaultMessage="Miner fee:" />
        </span>
        <div className="feeRowInfo">
          {isLoading
            ? <div styleName='paleLoader'><InlineLoader /></div>
            : <span styleName='fee'>
                {hasTxSize && feeCurrentCurrency > 0 ? transactionSize : null}
                {+minerFee}&nbsp;{minerFeeTicker}
                {' '}
                {fiatMinerFee > 0 && `(${activeFiatSymbol}${fiatMinerFee})`}
              </span>
          }
          {' '}
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
      
      {usedAdminFee && (
          <div styleName='feeRow'>
            <span styleName='feeRowTitle'>
              <FormattedMessage id="FeeInfoBlockServiceFee" defaultMessage="Service fee:" />
            </span>
            <div className="feeRowInfo">
              <div styleName="serviceFeeConditions">
                <span>{usedAdminFee.fee}%</span>
                {' '}
                <span>
                  <FormattedMessage id="FeeInfoBlockServiceFeeConditions" defaultMessage="of the transfer amount, but not less than" />
                </span>
                {' '}
                <span>{usedAdminFee.min}&nbsp;{serviceFeeTicker}</span>
              </div>
              {isLoading
                ? <div styleName='paleLoader'><InlineLoader /></div>
                : <span styleName='fee'>
                    {+serviceFee}&nbsp;{serviceFeeTicker}
                    {' '}
                    {fiatServiceFee > 0 && `(${activeFiatSymbol}${fiatServiceFee})`}
                  </span>
              }
            </div>
          </div>
        )
      }

      {!isEthToken && (
        <div styleName='feeRow'>
          <span styleName='feeRowTitle'>
            <FormattedMessage id="FeeInfoBlockTotalFee" defaultMessage="Total fees you pay:" />
          </span>
          <div className="feeRowInfo">
            {isLoading
              ? <div styleName='paleLoader'><InlineLoader /></div>
              : <span styleName='fee'>
                  {+totalFee}&nbsp;{minerFeeTicker}
                  {' '}
                  {fiatTotalFee > 0 && `(${activeFiatSymbol}${fiatTotalFee})`}
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
