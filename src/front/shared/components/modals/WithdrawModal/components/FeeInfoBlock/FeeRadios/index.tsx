import React, { Component } from 'react';
import cssModules from 'react-css-modules'
import styles from './index.scss'
import { constants } from 'helpers'

type FeeRadiosProps = {
    isLoading: boolean

    speedType: string

    fees: {
        slow: number | any
        normal: number | any
        fast: number | any
    }
    setFee: (speedType: string) => void
}

type FeeRadiosState = {
    selectedOption: string
    feeValue: number
}

const bitcoinFees = [
    {
        id: 1,
        time: '~30-60 minutes',
        title: 'Slow',
        slug: 'slow',
        speedType: 'slow',
        value: 5 * 1e3,
        description: 'The lowest fee (in satoshis per byte) that will confirm transactions within an hour (with 90% probability)'
    },
    {
        id: 2,
        time: '~15-30 minutes',
        title: 'Medium',
        slug: 'normal',
        speedType: 'medium',
        value: 15 * 1e3,
        description: 'The lowest fee (in satoshis per byte) that will confirm transactions within half an hour (with 90% probability)'
    },
    {
        id: 3,
        time: '~0-15 minutes',
        title: 'Fast',
        slug: 'fast',
        speedType: 'fast',
        value: 30 * 1e3,
        description: 'The lowest fee (in satoshis per byte) that will currently result in the fastest transaction confirmations (usually 0 to 1 block delay)'
    },
    {
        id: 4,
        time: '',
        title: 'Custom',
        slug: 'customFee',
        speedType: 'custom',
        value: 1,
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
            feeValue: 0
        }
        this.onFeeRateChange = this.onFeeRateChange.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
    }

    onFeeRateChange(event) {
        const { setFee } = this.props;
        setFee(event.target.value)
    }

    onValueChange(event) {
        this.setState({
            feeValue: event.target.value
        });
    }

    render() {
        const {
            isLoading,
            speedType,
            fees,
            setFee
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
                            value={this.state.feeValue}
                            onChange={this.onValueChange}
                        />
                        <label htmlFor="sat/byte">
                            {`${this.state.feeValue} sat/byte`}
                        </label>
                    </div>

                }
            </>
        )
    }
}

