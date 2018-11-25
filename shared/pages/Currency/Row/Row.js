import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { links }    from 'helpers'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'
import Flip from 'components/controls/Flip/Flip'
import { FormattedMessage } from 'react-intl'


@cssModules(styles)
export default class Row extends Component {

  static propTypes = {
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }

  render() {
    const { from, to } = this.props

    return (
      <tr styleName="exchangeTr">
        <td>
          <span>
            <div styleName="exchangeRow">
              <Coin styleName="coin" name={from} size={40} />
              {from.toUpperCase()}
              <Flip/>
              <Coin styleName="coin" name={to} size={40} />
              {to.toUpperCase()}
            </div>
          </span>
        </td>
        <td>
          <Link styleName="button" to={`${links.home}${from.toLowerCase()}-${to.toLowerCase()}`}>
            <FormattedMessage id="Row35" defaultMessage="Exchange " />
            <span styleName="exchangePrice">at price 0.00380 BTC</span>
          </Link>
        </td>
      </tr>
    )
  }
}

