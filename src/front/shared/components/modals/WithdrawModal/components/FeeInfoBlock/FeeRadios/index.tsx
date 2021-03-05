import React, { Component } from 'react';
import cssModules from 'react-css-modules'
import styles from './index.scss'

type FeeRadiosState = {
    selectedOption: string
}

@cssModules(styles, { allowMultiple: true })
export default class FeeRadios extends Component<{}, FeeRadiosState> {
    constructor(props) {
        super(props);
        this.state = {
            selectedOption: '',
        }
        this.onValueChange = this.onValueChange.bind(this);
    }

    onValueChange(event) {
        this.setState({
          selectedOption: event.target.value
        });
      }

    render() {
        return (
            <div styleName="fee-radio">
                <input
                    type="radio"
                    value="Slow"
                    id="Slow"
                    styleName="fee-radio__input"
                    checked={this.state.selectedOption === "Slow"}
                    onChange={this.onValueChange}
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
                    onChange={this.onValueChange}
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
                    onChange={this.onValueChange}
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
                    onChange={this.onValueChange}
                />
                <label htmlFor="Custom" styleName="fee-radio__label">
                    Custom
                </label>
            </div>
        )
    }
}

