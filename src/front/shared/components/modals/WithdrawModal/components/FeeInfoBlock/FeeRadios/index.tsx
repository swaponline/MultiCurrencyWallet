import React, { Component } from 'react';
import cssModules from 'react-css-modules'
import styles from './index.scss'

type FeeRadiosState = {
    selectedOption: string
    feeValue: number
}

@cssModules(styles, { allowMultiple: true })
export default class FeeRadios extends Component<{}, FeeRadiosState> {
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
        this.setState({
          selectedOption: event.target.value
        });
    }

    onValueChange(event) {
        this.setState({
            feeValue: event.target.value
        });
    }

    render() {
        return (
            <>
                <div styleName="fee-radio">
                    <input
                        type="radio"
                        value="Slow"
                        id="Slow"
                        styleName="fee-radio__input"
                        checked={this.state.selectedOption === "Slow"}
                        onChange={this.onFeeRateChange}
                    />
                    <label htmlFor="Slow" styleName="fee-radio__label">
                        Slow
                    </label>
                    <input
                        type="radio"
                        value="Medium"
                        id="Medium"
                        styleName="fee-radio__input"
                        checked={this.state.selectedOption === "Medium"}
                        onChange={this.onFeeRateChange}
                    />
                    <label htmlFor="Medium" styleName="fee-radio__label">
                        Medium
                    </label>
                    <input
                        type="radio"
                        value="Fast"
                        id="Fast"
                        styleName="fee-radio__input"
                        checked={this.state.selectedOption === "Fast"}
                        onChange={this.onFeeRateChange}
                    />
                    <label htmlFor="Fast" styleName="fee-radio__label">
                        Fast
                    </label>
                    <input
                        type="radio"
                        value="Custom"
                        id="Custom"
                        styleName="fee-radio__input"
                        checked={this.state.selectedOption === "Custom"}
                        onChange={this.onFeeRateChange}
                    />
                    <label htmlFor="Custom" styleName="fee-radio__label">
                        Custom
                    </label>
                </div>
                {
                    this.state.selectedOption === "Custom" &&
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

