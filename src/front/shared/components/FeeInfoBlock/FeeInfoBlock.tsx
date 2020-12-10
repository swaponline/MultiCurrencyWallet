import React from 'react'
import cssModules from 'react-css-modules'
import styles from './FeeInfoBlock.scss'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import { constants } from 'helpers'

import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

const isDark = localStorage.getItem(constants.localStorage.isDark)

type FeeInfoBlockProps = {
  isLoading: boolean
  isEthToken: boolean

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
    serviceFee,
    totalFee,
  } = props

  return (
    <section styleName={`feeInfoBlock ${isDark ? 'dark' : ''}`}>
      <div>
        <FormattedMessage id="FeeInfoBlockMinerFee" defaultMessage="Miner Fee:" />
        {' '}{/* indent */}
        {isLoading
          ? <div styleName='paleLoader'><InlineLoader /></div>
          : <span styleName='fee'>{minerFee} {dataCurrency} 
              (~{new BigNumber(minerFee * exCurrencyRate).dp(2, BigNumber.ROUND_FLOOR).toNumber()}$)
            </span>
        }
        {' '}{/* indent */}
        <Tooltip id="FeeInfoBlockMinerFeeTooltip">
          <div style={{ maxWidth: '24em', textAlign: 'center' }}>
            <FormattedMessage
              id="FeeInfoBlockMinerFeeDescription"
              defaultMessage="Amount of cryptocurrency paid to incentivize miners to confirm your transaction"
            />
          </div>
        </Tooltip>
      </div>
      
      {serviceFee && (
          <div>
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
        <div>
          <FormattedMessage id="FeeInfoBlockTotalFee" defaultMessage="Total fee you pay:" />
          {' '}{/* indent */}
          {isLoading 
            ? <div styleName='paleLoader'><InlineLoader /></div>
            : <span styleName='fee'>{totalFee} {dataCurrency} 
                (~{new BigNumber(totalFee * exCurrencyRate).dp(2, BigNumber.ROUND_FLOOR).toNumber()}$)
              </span>
          }
        </div>
        )
      }
    </section>
    // <section styleName={`feeInfoBlock ${isDark ? 'dark' : ''}`}>
    //   <FormattedMessage id="WithdrowModalMinerFee" defaultMessage="Miner Fee: " />
    //   {' '}{/* < indent */}
    //   {fetchFee
    //     ? <div styleName='paleLoader'><InlineLoader /></div>
    //     : (
          // <span styleName='fee'>{
          //   isEthToken
          //     ? new BigNumber(tokenFee).toNumber()
          //     : new BigNumber(coinFee).toNumber()
          //   } {dataCurrency} 
          //   isEthToken
          //     ? (~{new BigNumber(tokenFee * exCurrencyRate).dp(2, BigNumber.ROUND_FLOOR).toNumber()}$)
          //     : (~{new BigNumber(coinFee * exCurrencyRate).dp(2, BigNumber.ROUND_FLOOR).toNumber()}$)
          // </span>
    //     )
    //   }
    //   {' '}{/* < indent */}
      // <Tooltip id="WithdrawModalMinerFeeDescription">
      //   <div style={{ maxWidth: '24em', textAlign: 'center' }}>
      //     <FormattedMessage
      //       id="WithdrawModalMinerFeeDescription"
      //       defaultMessage="Amount of cryptocurrency paid to incentivize miners to confirm your transaction"
      //     />
      //   </div>
      // </Tooltip>
    //   <br />
    //   {usedAdminFee && (
    //       <>
            // <FormattedMessage id="WithdrowModalServiceFee" defaultMessage="Service Fee: " />
            // {' '}{/* < indent */}
            // {fetchFee
            //   ? <div styleName='paleLoader'><InlineLoader /></div>
            //   : <span styleName='fee'>{ // fee in precents (fee / 100%)
            //       amount > 0 && new BigNumber(usedAdminFee.fee).dividedBy(100).multipliedBy(amount).isGreaterThan(adminFeeSize)
            //         ? new BigNumber(usedAdminFee.fee).dividedBy(100).multipliedBy(amount).toNumber()
            //         : adminFeeSize
            //     } {currency}</span>
            // }
    //         <br />
    //       </>
    //     )
    //   }
      // {!isEthToken && (
      //   <>
      //     <FormattedMessage id="WithdrowModalCommonFee" defaultMessage="Total fee you pay: " />
      //     {' '}{/* < indent */}
      //     {fetchFee 
      //       ? <div styleName='paleLoader'><InlineLoader /></div>
      //       : (
      //         <span styleName='fee'>{
      //           amount > 0 && new BigNumber(usedAdminFee.fee).dividedBy(100).multipliedBy(amount).isGreaterThan(adminFeeSize)
                  // ? usedAdminFee // fee in precents (100 > 100%)
                  //   ? new BigNumber(usedAdminFee.fee).dividedBy(100).multipliedBy(amount).plus(totalFee).toNumber()
                  //   : new BigNumber(totalFee).plus(adminFeeSize).toNumber()
                  // : new BigNumber(totalFee).plus(adminFeeSize).toNumber()
      //         } {dataCurrency} (~{new BigNumber(totalFee * exCurrencyRate).dp(2, BigNumber.ROUND_FLOOR).toNumber()}$)
      //         </span>
      //       )
      //     }
      //   </>
      //   )
      // }
    // </section>
  )
}

export default cssModules(FeeInfoBlock, styles, { allowMultiple: true })
