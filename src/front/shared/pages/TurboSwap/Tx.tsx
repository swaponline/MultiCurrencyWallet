import React, { PureComponent, Fragment } from 'react'
import BigNumber from 'bignumber.js'

import cssModules from 'react-css-modules'
import styles from './Tx.scss'

import { injectIntl, FormattedMessage } from 'react-intl'

import { SwapTxStatus } from 'common/domain/swap'

import Address from 'components/ui/Address/Address'
import { AddressFormat } from 'domain/address'

import imgPending from 'shared/images/tx-status/pending.svg'
import imgDone from 'shared/images/tx-status/done.svg'

interface ITx {
  amount: BigNumber,
  ticker: string,
  id: string | null,
  url: string,
  direction: 'left' | 'right',
  status: SwapTxStatus
}

//@injectIntl
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
        <div styleName="tx-hash">
          {id ?
            <a styleName="tx-link" href={url} target='_blank'>
              <Address
                address={id}
                format={AddressFormat.Short}
              />
            </a>
            :
            <span>&nbsp;</span>
          }
        </div>
        <div styleName="tx-status-icon">
          {status == SwapTxStatus.Pending &&
            <img src={imgPending} />
          }
          {status == SwapTxStatus.Done &&
            <img src={imgDone} />
          }
        </div>
      </div>
    )
  }
}
