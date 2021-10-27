import { Component, Fragment } from 'react'
import cssModules from 'react-css-modules'
import { AddressType, AddressFormat } from 'domain/address'
import styles from './Address.scss'

interface IAddress {
  address: any
  format?: AddressFormat
  type?: AddressType
  style?: any
}

@cssModules(styles, { allowMultiple: true })
export default class Address extends Component<IAddress, object> {
  constructor(props) {
    super(props)
  }

  render() {
    let {
      address,
      format,
      type,
      //copyable, // todo
      style,
    } = this.props

    if (!address) return null

    const addressStart = address.substring(0, 6)
    const addressEnd = address.substring(address.length - 4, address.length)
    const color = type === AddressType.Metamask ? '#e4761b' : ''

    return (
      <code styleName={`address`} title={address} style={{ ...style, color }}>
        {format === AddressFormat.Short ? (
          <Fragment>
            {addressStart}&#183;&#183;&#183;{addressEnd}
          </Fragment>
        ) : (
          address
        )}
      </code>
    )
  }
}
