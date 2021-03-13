import React, { Component } from 'react';
import cssModules from 'react-css-modules'
import styles from './index.scss'
import { constants } from 'helpers'

import { FormattedMessage } from 'react-intl'

import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'shared/components/loaders/InlineLoader/InlineLoader';
import BigNumber from 'bignumber.js';

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
    selectedOption: string
    customFeeValue: number
}

const bitcoinFees = [
    {
        id: 1,
        time: '~60-more minutes',
        title: 'Slow',
        slug: 'slow',
        description: 'A rolling average of the fee for transactions to be confirmed in 7 or more blocks.'
    },
    {
        id: 2,
        time: '~25-60 minutes',
        title: 'Medium',
        slug: 'normal',
        description: 'A rolling average of the fee transactions to be confirmed within 3 to 6 blocks.'
    },
    {
        id: 3,
        time: '~5-20 minutes',
        title: 'Fast',
        slug: 'fast',
        description: 'A rolling average of the fee for transactions to be confirmed within 1 to 2 blocks.'
    },
    {
        id: 4,
        time: '',
        title: 'Custom',
        slug: 'custom',
        description: 'Set custom fee rate'
    },
]


const isDark = localStorage.getItem(constants.localStorage.isDark)

@cssModules(styles, { allowMultiple: true })
export default class FeeRadios extends Component<FeeRadiosProps, FeeRadiosState> {
    constructor(props) {
        super(props);
        this.state = {
            selectedOption: '',
            customFeeValue: 50
        }
        this.onFeeRateChange = this.onFeeRateChange.bind(this);
        this.onCustomFeeValueChange = this.onCustomFeeValueChange.bind(this);
    }

    onFeeRateChange(event) {
        const { setFee } = this.props;
        setFee(event.target.value, this.state.customFeeValue)
    }

    onCustomFeeValueChange(event) {
        const { setFee } = this.props;
        this.setState({
            customFeeValue: event.target.value
        });
        setFee('custom', event.target.value)

    }

    render() {
        const {
            isLoading,
            speedType,
            fees
        } = this.props;

        return (
            <>
                <div styleName={`fee-radio ${isDark ? '--dark' : ''}`}>
                    {bitcoinFees.map(fee => {
                        const feeInByte = fee.slug === "custom" ? this.state.customFeeValue : new BigNumber(fees[fee.slug]).div(1024).dp(0, BigNumber.ROUND_HALF_EVEN).toNumber();
                        return (
                            <React.Fragment key={fee.id}>
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
                                        <b>{fee.title}</b>
                                        {' '}
                                        <Tooltip id={`FeeRadiosSpeedType_${fee.slug}`}>
                                            <div style={{ maxWidth: '24em', textAlign: 'center' }}>
                                            <FormattedMessage
                                                id={`FeeRadiosSpeedType_${fee.slug}`}
                                                defaultMessage={fee.description}
                                            />
                                            </div>
                                        </Tooltip>
                                    </div>
                                    {isLoading ?
                                        <div styleName='paleLoader'><InlineLoader /></div> :
                                        <div style={{ display: 'flex', flexWrap: 'wrap'}}>
                                            <span style={{ fontSize: '12px' }}>
                                                {feeInByte} sat/byte
                                            </span>
                                            <span style={{ fontSize: '12px' }}>
                                                {fee.time}
                                            </span>
                                        </div>
                                    }
                                </label>
                            </React.Fragment>
                            )
                        })
                    }
                </div>
                {
                    speedType === "custom" &&
                    <div>
                        <input
                            type="range"
                            id="sat/byte"
                            name="volume"
                            min="0"
                            max="150"
                            value={this.state.customFeeValue}
                            onChange={this.onCustomFeeValueChange}
                        />
                        <label htmlFor="sat/byte">
                            {`${this.state.customFeeValue} sat/byte`}
                        </label>
                    </div>

                }
            </>
        )
    }
}

