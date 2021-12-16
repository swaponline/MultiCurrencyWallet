import cssModules from 'react-css-modules'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import { links, utils } from 'helpers'
import { COIN_DATA, COIN_MODEL } from 'swap.app/constants/COINS'

import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import styles from './index.scss'
import FeeRadios  from './FeeRadios'

type FeeInfoBlockProps = {
  isLoading: boolean
  hasTxSize: boolean

  currency: string
  activeFiat: string
  dataCurrency: string
  bitcoinFeeSpeedType: string

  selectedItem: IUniversalObj

  txSize?: number
  feeCurrentCurrency?: number
  exchangeRateForTokens?: BigNumber
  exCurrencyRate?: BigNumber
  minerFee: BigNumber
  serviceFee: BigNumber
  usedAdminFee: undefined | {
    address: string
    fee: number // percent (%)
    min: number
  }
  bitcoinFees?: {
    slow: number
    normal: number
    fast: number
    custom: number
  }

  setBitcoinFee?: (speedType: string, customValue?: number) => void
}

const FeeInfoBlock = function (props: FeeInfoBlockProps) {
  const {
    selectedItem,
    currency,
    activeFiat,
    dataCurrency,
    exchangeRateForTokens = 0,
    exCurrencyRate = 0,
    isLoading,
    minerFee: initialMinerFee,
    serviceFee,
    usedAdminFee,
    hasTxSize,
    txSize,
    feeCurrentCurrency,
    bitcoinFeeSpeedType,
    bitcoinFees,
    setBitcoinFee,
  } = props

  const {
    isToken,
    isConnected, // only evm coins and tokens have this property
  } = selectedItem

  const minerFeeTicker = dataCurrency
  const serviceFeeTicker = currency

  let activeFiatSymbol

  switch (activeFiat.toLowerCase()) {
    case 'usd':
      activeFiatSymbol = '$'
      break
    case 'eur':
      activeFiatSymbol = '€'
      break
    default:
      activeFiatSymbol = activeFiat
  }

  let minerFee = initialMinerFee

  // double miner fee for user and admin transactions
  if (usedAdminFee && (isToken || COIN_DATA[currency]?.model === COIN_MODEL.AB) && !isConnected) {
    minerFee = initialMinerFee.multipliedBy(2)
  }

  const totalFee = minerFee.plus(serviceFee)

  const fiatMinerFee = isToken
    ? exchangeRateForTokens > 0 // eth rate for tokens
      ? utils.toMeaningfulFloatValue({ value: minerFee, rate:exchangeRateForTokens })
      : 0
    : exCurrencyRate > 0 // own currency rate for another
      ? utils.toMeaningfulFloatValue({ value: minerFee, rate:exCurrencyRate })
      : 0

  const fiatServiceFee = usedAdminFee
    ? exCurrencyRate > 0
      ? utils.toMeaningfulFloatValue({ value: serviceFee, rate:exCurrencyRate })
      : 0
    : 0

  const fiatTotalFee = exCurrencyRate > 0 && !isToken
    ? utils.toMeaningfulFloatValue({ value: totalFee, rate:exCurrencyRate })
    : 0

  const transactionSize = (
    <>
      {feeCurrentCurrency}
      &nbsp;sat/byte *
      {' '}
      {txSize}
      &nbsp;bytes&nbsp;
      <a href={links.transactionRate} target="_blank" rel="noreferrer">(?)</a>
      {' '}
      =
      {' '}
    </>
  )

  return (
    <section styleName="feeInfoBlock">
      {hasTxSize && (
        <div styleName="feeRow">
          <span styleName="feeRowTitle">
            <FormattedMessage id="FeeInfoBlockChooseFeeRate" defaultMessage="Choose Fee Rate:" />
          </span>
          <FeeRadios
            speedType={bitcoinFeeSpeedType}
            // @ts-ignore: strictNullChecks
            fees={bitcoinFees}
            // @ts-ignore: strictNullChecks
            setFee={setBitcoinFee}
            isLoading={isLoading}
          />
        </div>
      )}

      <div styleName="feeRow">
        <span styleName="feeRowTitle">
          <FormattedMessage id="FeeInfoBlockMinerFee" defaultMessage="Miner fee:" />
        </span>
        <div className="feeRowInfo">
          {isLoading
            ? <div styleName="paleLoader"><InlineLoader /></div>
            : (
              <span styleName="fee" id="feeInfoBlockMinerFee">
                {/* @ts-ignore: strictNullChecks */}
                {hasTxSize && feeCurrentCurrency > 0 ? transactionSize : null}
                {+minerFee}
                &nbsp;
                {minerFeeTicker}
                {' '}
                {fiatMinerFee > 0 && `(${activeFiatSymbol}${fiatMinerFee})`}
              </span>
            )}
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

      {usedAdminFee && !isConnected && (
        <div styleName="feeRow">
          <span styleName="feeRowTitle">
            <FormattedMessage id="FeeInfoBlockServiceFee" defaultMessage="Service fee" />
            :
          </span>
          <div className="feeRowInfo">
            <div styleName="serviceFeeConditions">
              <span>
                {usedAdminFee.fee}
                %
              </span>
              {' '}
              <span>
                <FormattedMessage id="FeeInfoBlockServiceFeeConditions" defaultMessage="of the transfer amount, but not less than" />
              </span>
              {' '}
              <span>
                {usedAdminFee.min}
                &nbsp;
                {serviceFeeTicker}
              </span>
            </div>
            {isLoading
              ? <div styleName="paleLoader"><InlineLoader /></div>
              : (
                <span styleName="fee" id="feeInfoBlockAdminFee">
                  {+serviceFee}
                  &nbsp;
                  {serviceFeeTicker}
                  {' '}
                  {fiatServiceFee > 0 && `(${activeFiatSymbol}${fiatServiceFee})`}
                </span>
              )}
          </div>
        </div>
      )}

      {!isToken && !isConnected && (
        <div styleName="feeRow">
          <span styleName="feeRowTitle">
            <FormattedMessage id="FeeInfoBlockTotalFee" defaultMessage="Total fees you pay:" />
          </span>
          <div className="feeRowInfo">
            {isLoading
              ? <div styleName="paleLoader"><InlineLoader /></div>
              : (
                <span styleName="fee" id="feeInfoBlockTotalFee">
                  {+totalFee}
                  &nbsp;
                  {minerFeeTicker}
                  {' '}
                  {fiatTotalFee > 0 && `(${activeFiatSymbol}${fiatTotalFee})`}
                </span>
              )}
          </div>
        </div>
      )}
    </section>
  )
}

export default cssModules(FeeInfoBlock, styles, { allowMultiple: true })
