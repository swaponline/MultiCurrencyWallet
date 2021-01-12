import React, { PureComponent, Fragment } from 'react'
import BigNumber from 'bignumber.js'

import cssModules from 'react-css-modules'
import styles from './Tx.scss'

import { injectIntl, FormattedMessage } from 'react-intl'

import { ITurboSwapConditions, TurboSwapStep, SwapTxStatus } from 'common/domain/swap'

import Address from 'components/ui/Address/Address'
import { AddressFormat } from 'domain/address'

interface ITx {
  amount: BigNumber,
  ticker: string,
  id: string | null,
  url: string,
  direction: 'left' | 'right',
  status: SwapTxStatus
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
      <div styleName={`tx ${status}`}>
        <div styleName="amount">
          {amount.toNumber()} {ticker}
        </div>
        <div styleName={`arrow ${direction}`}></div>
        {id &&
          <a styleName="link" href={url} target='_blank'>
            <Address
              address={id}
              format={AddressFormat.Short}
            />
          </a>
        }
      </div>
    )
  }
}
