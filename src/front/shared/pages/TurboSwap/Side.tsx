import React, { PureComponent, Fragment } from 'react'

import cssModules from 'react-css-modules'
import styles from './Side.scss'


import { injectIntl, FormattedMessage } from 'react-intl'

import { ITurboSwapConditions, TurboSwapStep } from 'common/domain/swap'
import Address from 'components/ui/Address/Address'
import { AddressFormat } from 'domain/address'

interface ISide {
  //peerId: string,
  title: string,
  isTitleHighlighted?: boolean
  address: string,
}

//const isDark = localStorage.getItem(constants.localStorage.isDark)

//@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class Side extends PureComponent<ISide, {}> {

  constructor() {
    //@ts-ignore
    super()
  }

  render() {
    const { /*peerId,*/ title, isTitleHighlighted, address } = this.props

    return (
      <div styleName="side">
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
