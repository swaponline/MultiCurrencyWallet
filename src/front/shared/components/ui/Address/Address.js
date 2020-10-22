import React, { Component, Fragment } from 'react'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'


import styles from './Address.scss'


export const AddressFormat = {
  'Full': 'Full',
  'Short': 'Short',
  'Auto': 'Auto', // todo
}

@cssModules(styles, { allowMultiple: true })
export default class Address extends Component {

  constructor({ initialValue, selectedValue }) {
    super()
  }

  render() {
    const {
      address,
      format,
      copyable, // todo
      style,
    } = this.props

    const addressStart = address.substring(0, 4)
    const addressEnd = address.substring(address.length - 4, address.length)

    return (
      <code styleName={`address`} title={address} style={style}>
        {format === AddressFormat.Short ?
          <Fragment>{addressStart}&#183;&#183;&#183;{addressEnd}</Fragment>
          :
          address
        }
      </code>
    )
  }
}
