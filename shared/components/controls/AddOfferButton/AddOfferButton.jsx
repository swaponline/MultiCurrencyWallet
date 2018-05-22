import React, { Component } from 'react'
import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './AddOfferButton.scss'


@CSSModules(styles)
export default class AddOfferButton extends Component {

  handleClick = () => {
    actions.modals.open('OFFER', true, {})
  }

  render() {
    return (
      <div
        href="#"
        styleName="createOffer"
        onClick={this.handleClick}
      >
        Add offer
      </div>
    )
  }
}
