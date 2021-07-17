import React, { Component } from 'react'
import cssModules from 'react-css-modules'
import styles from './index.scss'
import { FormattedMessage } from 'react-intl'

import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'shared/components/loaders/InlineLoader/InlineLoader'
import BigNumber from 'bignumber.js'

type FeeRadiosProps = {
  isLoading: boolean

  speedType: string

  fees: {
    slow: number | any
    normal: number | any
    fast: number | any
    custom: number
  }
  setFee: (speedType: string, customValue?: number) => void
}

type FeeRadiosState = {
  customFeeValue: number
}

const bitcoinFees = [
  {
    slug: 'slow',
    labelMessage: <FormattedMessage id="FeeRadiosSpeedTypeSlow" defaultMessage="Slow" />,
    timeMessage: <FormattedMessage id="FeeRadiosSpeedTypeTimeSlow" defaultMessage="~60 more minutes" />,
    tooltip: (
      <Tooltip id="FeeRadiosSpeedTypeDescriptionSlow">
        <div styleName="tooltipMessage">
          <FormattedMessage
            id="FeeRadiosSpeedTypeDescriptionSlow"
            defaultMessage="A rolling average of the fee for transactions to be confirmed in 7 or more blocks."
          />
        </div>
      </Tooltip>
    ),
  },  
  {
    slug: 'normal',
    labelMessage: <FormattedMessage id="FeeRadiosSpeedTypeMedium" defaultMessage="Medium" />,
    timeMessage: <FormattedMessage id="FeeRadiosSpeedTypeTimeMedium" defaultMessage="~25-60 minutes" />,
    tooltip: (
      <Tooltip id="FeeRadiosSpeedTypeDescriptionMedium">
        <div styleName="tooltipMessage">
          <FormattedMessage
            id="FeeRadiosSpeedTypeDescriptionMedium"
            defaultMessage="A rolling average of the fee for transactions to be confirmed within 3 to 6 blocks."
          />
        </div>
      </Tooltip>
    ),
  },
  {
    slug: 'fast',
    labelMessage: <FormattedMessage id="FeeRadiosSpeedTypeFast" defaultMessage="Fast" />,
    timeMessage: <FormattedMessage id="FeeRadiosSpeedTypeTimeFast" defaultMessage="~5-20 minutes" />,
    tooltip: (
      <Tooltip id="FeeRadiosSpeedTypeDescriptionFast">
        <div styleName="tooltipMessage">
          <FormattedMessage
            id="FeeRadiosSpeedTypeDescriptionFast"
            defaultMessage="A rolling average of the fee for transactions to be confirmed within 1 to 2 blocks."
          />
        </div>
      </Tooltip>
    ),
  },
  {
    slug: 'custom',
    labelMessage: <FormattedMessage id="FeeRadiosSpeedTypeCustom" defaultMessage="Custom" />,
    timeMessage: null,
    tooltip: (
      <Tooltip id="FeeRadiosSpeedTypeDescriptionCustom">
        <div styleName="tooltipMessage">
          <FormattedMessage
            id="FeeRadiosSpeedTypeDescriptionCustom"
            defaultMessage="Set custom fee rate."
          />
        </div>
      </Tooltip>
    ),
  },
]

@cssModules(styles, { allowMultiple: true })
export default class FeeRadios extends Component<FeeRadiosProps, FeeRadiosState> {
  constructor(props) {
    super(props)

    this.state = {
      customFeeValue: 50
    }
  }

  onFeeRateChange = (event) => {
    const { setFee } = this.props;
    setFee(event.target.value, this.state.customFeeValue)
  }

  onCustomFeeValueChange = (event) => {
    const { setFee } = this.props
    this.setState({
      customFeeValue: event.target.value
    })
    setFee('custom', event.target.value)
  }

  render() {
    const {
      isLoading,
      speedType,
      fees,
    } = this.props

    return (
      <div styleName="fee-radio">
        {bitcoinFees.map((fee, index) => {
          const feeInByte = fee.slug === "custom"
            ? this.state.customFeeValue
            : new BigNumber(fees[fee.slug]).div(1024).dp(0, BigNumber.ROUND_HALF_EVEN).toNumber()

          return (
            <React.Fragment key={index}>
              <input
                type="radio"
                value={fee.slug}
                id={fee.slug}
                styleName="fee-radio__input"
                checked={isLoading ? 'fast' === fee.slug : speedType === fee.slug }
                onChange={this.onFeeRateChange}
              />

              <label htmlFor={fee.slug} styleName="fee-radio__label">
                <div>
                  <span styleName="labelTitle">{fee.labelMessage}</span>
                  {' '}
                  {fee.tooltip}
                </div>

                {isLoading ? (
                  <div styleName='paleLoader'>
                    <InlineLoader />
                  </div>
                ) : (
                  <div styleName="feeRadioDescription">
                    <span styleName="constantTextSize">
                      {feeInByte} sat/byte
                    </span>
                    <span styleName="constantTextSize">
                      {fee.timeMessage}
                    </span>
                    {speedType === "custom" && speedType === fee.slug &&
                      <input
                        styleName="customRangeInput"
                        type="range"
                        id="sat/byte"
                        name="volume"
                        min="1"
                        max="250"
                        value={this.state.customFeeValue}
                        onChange={this.onCustomFeeValueChange}
                      />
                    }
                  </div>
                )}
              </label>
            </React.Fragment>
            )
          })
        }
      </div>
    )
  }
}

