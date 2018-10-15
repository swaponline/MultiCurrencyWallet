import React, { Component, Fragment } from 'react'

import { Link } from 'react-router-dom'
import { constants, links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './AddOfferButton.scss'
import ReactTooltip from 'react-tooltip'

@CSSModules(styles)
export default class AddOfferButton extends Component {

  render() {
    return (
      <Fragment>
        {
          process.env.TESTNET ? (
            <div>
            <a
              href={links.main}
              target="_blank"
              rel="noreferrer noopener"
              styleName="button"
              data-tip data-for="m"
            >
              Mainnet
            </a>
            <ReactTooltip id="m" type="light" effect="solid">
              <span>Start to real Swap</span>
            </ReactTooltip>
            </div>
          ) : (
            <div>
            <button
              styleName="button"
              onClick={() => pinkClick()} /* eslint-disable-line */
              data-tip data-for="s"
            >
              Subscribe
            </button>
              <ReactTooltip id="a" type="light" effect="solid">
                <span>Get subscribed for the Swap.Online news</span>
              </ReactTooltip>
              </div>
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
