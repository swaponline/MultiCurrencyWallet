import React, { Component } from 'react';
import cssModules from 'react-css-modules'
import styles from './index.scss'
import { constants } from 'helpers'
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
        time: '~30-60 minutes',
        title: 'Slow',
        slug: 'slow',
        speedType: 'slow',
        value: 5 * 1e3,
        description: 'A rolling average of the fee for transactions to be confirmed in 7 or more blocks.'
    },
    {
        id: 2,
        time: '~15-30 minutes',
        title: 'Medium',
        slug: 'normal',
        speedType: 'medium',
        value: 15 * 1e3,
        description: 'A rolling average of the fee transactions to be confirmed within 3 to 6 blocks.'
    },
    {
        id: 3,
        time: '~0-15 minutes',
        title: 'Fast',
        slug: 'fast',
        speedType: 'fast',
        value: 30 * 1e3,
        description: 'A rolling average of the fee for transactions to be confirmed within 1 to 2 blocks.'
    },
    {
        id: 4,
        time: '',
        title: 'Custom',
        slug: 'custom',
        speedType: 'custom',
        value: 50 * 1024,
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
                        return (
                            <React.Fragment key={fee.id}>
                                <input
                                    type="radio"
                                    value={fee.slug}
                                    id={fee.speedType}
                                    styleName="fee-radio__input"
                                    checked={isLoading ? 'fast' === fee.slug : speedType === fee.slug }
                                    onChange={this.onFeeRateChange}
                                />
                                <label htmlFor={fee.speedType} styleName="fee-radio__label">
                                    <b>{fee.title}</b>
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

