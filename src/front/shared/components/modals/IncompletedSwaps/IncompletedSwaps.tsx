import React, { Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'

import Link from 'local_modules/sw-valuelink'

import cssModules from 'react-css-modules'
import styles from './IncompletedSwaps.scss'

import { Modal } from 'components/modal'
import { FieldLabel } from 'components/forms'
import { Button } from 'components/controls'
import Table from 'components/tables/Table/Table'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import { FormattedMessage } from 'react-intl'
import SwapsHistory from 'shared/pages/History/SwapsHistory/SwapsHistory'


const title = [
  <FormattedMessage id="Incompleted21" defaultMessage="Incompleted Swaps" />,
]

@connect(({
  rememberedOrders,
  history: { swapHistory },
}) => ({
  decline: rememberedOrders.savedOrders,
  swapHistory,
}))
@cssModules(styles, { allowMultiple: true })
export default class IncompletedSwaps extends Component<any, any> {

  render() {
    const { decline, swapHistory } = this.props

    return (
      //@ts-ignore: strictNullChecks
      <Modal name="IncompletedSwaps" title={title} shouldCenterVertically={false}>
        <div styleName="modal">
          <div styleName="modal_column">
            <SubTitle styleName="modal_column-title">
              <FormattedMessage id="IncompletedSwaps49" defaultMessage="Swaps needing to complete" />
            </SubTitle>
            { swapHistory.length > 0 ?
              <SwapsHistory
                showSubtitle={false}
                orders={swapHistory
                  .filter(item => item.isSwapExist === false)
                  .filter(item => decline.includes(item.id))
                  .filter(item => item.step >= 4)
                }
              /> :
              <h1>
                <FormattedMessage id="IncompletedSwaps55" defaultMessage="Data processed, try to reload the page" />
              </h1>
            }
          </div>
        </div>
      </Modal>
    )
  }
}
