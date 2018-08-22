import React, { Component, Fragment } from 'react'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './AddOfferButton.scss'


@CSSModules(styles)
export default class AddOfferButton extends Component {

  render() {
    return (
      <Fragment>
        <div
          styleName="button"
          onClick={() => pinkClick()} /* eslint-disable-line */
        >
          Subscribe
        </div>
        <div
          styleName="buttonMobile"
          onClick={() => pinkClick()} /* eslint-disable-line */
        />
      </Fragment>
    )
  }
}
