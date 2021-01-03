import React, { PureComponent, Fragment } from 'react'

import cssModules from 'react-css-modules'
import styles from './Side.scss'


import { injectIntl, FormattedMessage } from 'react-intl'

import { ITurboSwapConditions, TurboSwapStep } from 'common/domain/swap'

interface ISide {
  peerId: string,
  title: string,
  address: string,
}

//const isDark = localStorage.getItem(constants.localStorage.isDark)

@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class Side extends PureComponent<ISide, {}> {

  constructor() {
    //@ts-ignore
    super()
  }

  render() {
    const { peerId, title, address } = this.props

    return (
      <div styleName="side">
        <div styleName="avatar">
        </div>
        <div styleName="title">
          {title}
        </div>
        {address}
      </div>
    )
  }
}
