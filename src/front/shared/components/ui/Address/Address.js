import React, { Component, Fragment } from 'react'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'

import { AddressType, AddressFormat } from 'domain/address'
import styles from './Address.scss'



@cssModules(styles, { allowMultiple: true })
export default class Address extends Component {

  constructor({ initialValue, selectedValue }) {
    super()
  }

  render() {
    const {
      address,
      format,
      type,
      copyable, // todo
      style,
    } = this.props

    const addressStart = address.substring(0, 4)
    const addressEnd = address.substring(address.length - 4, address.length)

    let colorizing = {}
    if (type === AddressType.Metamask) {
      colorizing.color = '#e4761b'
    }

    return (
      <code styleName={`address`} title={address} style={{...style, ...colorizing}} >
        {format === AddressFormat.Short ?
          <Fragment>{addressStart}&#183;&#183;&#183;{addressEnd}</Fragment>
          :
          address
        }
      </code>
    )
  }
}
