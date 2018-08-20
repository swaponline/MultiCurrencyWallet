import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coins from 'components/Coins/Coins'


@cssModules(styles)
export default class Row extends Component {

  static propTypes = {
    from: PropTypes.object.isRequired,
    to: PropTypes.object.isRequired
  }

  render() {
    const { from, to } = this.props

    return (
      <tr>
        <td>
          <Coins styleName="coins" names={[ from.name, to.name ]} size={40} />
        </td>
        <td>{`${from.name}-${to.name}`}</td>
        <td>
          <Link styleName="button" to={`/exchange/${from.value}-${to.value}`}>Trade</Link>
        </td>
      </tr>
    )
  }
}
