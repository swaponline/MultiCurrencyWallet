import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './AddOfferButton.scss'


@CSSModules(styles)
export default class AddOfferButton extends Component {

  handleClick = () => {
    actions.modals.open(constants.modals.Offer, {})
    actions.analytics.dataEvent('orderbook-click-addoffer-button')
  }

  render() {
    return (
      <Fragment>
        <div
          styleName="button"
          onClick={this.handleClick}
        >
          Add offer
        </div>
        <div
          styleName="buttonMobile"
          onClick={this.handleClick}
        />
      </Fragment>
    )
  }
}
