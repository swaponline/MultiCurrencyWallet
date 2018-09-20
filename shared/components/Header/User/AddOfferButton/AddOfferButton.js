import React, { Component, Fragment } from 'react'

import { Link } from 'react-router-dom'
import { constants, links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './AddOfferButton.scss'


@CSSModules(styles)
export default class AddOfferButton extends Component {

  render() {
    return (
      <Fragment>
        {
          process.env.TESTNET ? (
            <a
              href={links.main}
              target="_blank"
              rel="noreferrer noopener"
              styleName="button"
            >
              Mainnet
            </a>
          ) : (
            <button
              styleName="button"
              onClick={() => pinkClick()} /* eslint-disable-line */
            >
              Subscribe
            </button>
          )
        }
        <button
          styleName="buttonMobile"
          onClick={() => pinkClick()} /* eslint-disable-line */
        />
      </Fragment>
    )
  }
}
