import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { links }    from 'helpers'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coins from 'components/Coins/Coins'
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
      <tr>
        <td>
          <Coins styleName="coins" names={[ from, to ]} size={40} />
        </td>
        <td>
          <span>
            <FormattedMessage id="Row30" defaultMessage="Exchange " />
            {from.toUpperCase()}/{to.toUpperCase()}
          </span>
        </td>
        <td>
          <Link styleName="button" to={`${links.home}${from.toLowerCase()}-${to.toLowerCase()}`}>
            <FormattedMessage id="Row35" defaultMessage="Exchange" />
          </Link>
        </td>
      </tr>
    )
  }
}
