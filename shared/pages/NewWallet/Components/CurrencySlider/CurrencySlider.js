import React, { Component, Fragment } from 'react'

import styles from './CurrencySlider.scss'
import cssModules from 'react-css-modules'


@cssModules(styles)
export default class CurrencySlider extends Component {
  render() {
    return (
      <Fragment>
        <div>
          <h3 styleName="availableCurrencies">
            Already available for exchange
          </h3>
          <div>
          </div>
        </div>
      </Fragment>
    )
  }
}
