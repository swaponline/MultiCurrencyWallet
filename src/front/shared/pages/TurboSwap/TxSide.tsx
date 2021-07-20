import React, { PureComponent, Fragment } from 'react'

import cssModules from 'react-css-modules'
import styles from './TxSide.scss'


import { injectIntl, FormattedMessage } from 'react-intl'

import Address from 'components/ui/Address/Address'
import { AddressFormat } from 'domain/address'


interface ITxSide {
  //peerId: string,
  title: React.ReactElement,
  isTitleHighlighted?: boolean
  address: string,
}

//@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class TxSide extends PureComponent<ITxSide, {}> {

  constructor() {
    //@ts-ignore
    super()
  }

  render() {
    const { /*peerId,*/ title, isTitleHighlighted, address } = this.props

    return (
      <div styleName="txSide">
        <div styleName={`title ${isTitleHighlighted ? 'highlighted' : ''}`}>
          {title}{isTitleHighlighted}
        </div>
        <div styleName="avatar">
        </div>
        <div styleName="address">
          <Address
            address={address}
            format={AddressFormat.Short}
          />
        </div>
      </div>
    )
  }
}
