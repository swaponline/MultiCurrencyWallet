import React, { PureComponent, Fragment } from 'react'
import BigNumber from 'bignumber.js'

import cssModules from 'react-css-modules'
import styles from './Tx.scss'


import { injectIntl, FormattedMessage } from 'react-intl'

import { ITurboSwapConditions, TurboSwapStep } from 'common/domain/swap'

interface ITx {
  amount: BigNumber,
  ticker: string,
  id: string,
  url: string,
  direction: 'left' | 'right',
  status: 'expected' | 'pending' | 'done'
}

//const isDark = localStorage.getItem(constants.localStorage.isDark)

@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class Tx extends PureComponent<ITx, {}> {

  constructor() {
    //@ts-ignore
    super()
  }

  render() {
    const { amount, ticker, id, url, direction, status } = this.props

    return (
      <div styleName="tx">
        <div styleName="amount">
          {amount.toNumber()} {ticker}
        </div>
        <div styleName={`arrow ${direction} ${status}`}></div>
        <div styleName="link">
          <a href={url} target='_blank'>
            {id}
          </a>
        </div>
      </div>
    )
  }
}
