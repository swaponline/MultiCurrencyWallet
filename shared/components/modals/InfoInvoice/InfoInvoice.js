import React, { Component, Fragment } from 'react'
import { Modal } from 'components/modal'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import helpers from 'helpers'
import { getFullOrigin } from 'helpers/links'

import cssModules from 'react-css-modules'
import styles from './InfoInvoice.scss'
import ShareButton from 'components/controls/ShareButton/ShareButton'
import actions from 'redux/actions'
import Button from 'components/controls/Button/Button'
import ShortTextView from 'pages/Wallet/components/ShortTextView/ShortTextView.js'
import { isMobile } from "react-device-detect"
import { BigNumber } from 'bignumber.js'

import animateFetching from 'components/loaders/ContentLoader/ElementLoading.scss'



const langPrefix = 'InvoiceInfoModal'
const labels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Инвойс`,
  },
  destination: {
    id: `${langPrefix}_DestinationAddress`,
    defaultMessage: `Адрес для оплаты {destination}`,
  },
})

@injectIntl
@cssModules({
  ...styles,
  ...animateFetching,
}, { allowMultiple: true })

export default class InfoInvoice extends React.Component {

  constructor(props) {
    super(props)

    const {
      data: {
        isFetching,
        onFetching,
        invoice,
      }
    } = props

    this.state = {
      isFetching,
      invoice,
    }

    if (isFetching && onFetching instanceof Function) {
      onFetching(this)
    }
  }

  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (typeof data.onClose === 'function') {
      data.onClose()
    }

    actions.modals.close(name)
  }


  render() {
    const {
      intl,
    } = this.props

    const {
      isFetching,
      invoice,
    } = this.state
    
    console.log(invoice)

    const shareText = 'ttt'
    const shareLink = 'ttt'
    
    return (
      <Modal name={name} title={intl.formatMessage(labels.title)} onClose={this.handleClose} showCloseButton={true}>
        <div styleName="blockCenter">
          <div className="p-3"  styleName={isFetching ? `animate-fetching` : ``}>
            <div styleName="shortInfoHolder">
              {!isFetching && (
                <Fragment>
                  <span>
                    <strong> {invoice.amount}</strong>
                  </span>
                  <span>
                    <FormattedMessage { ... labels.destination } values={{ destination: 'boo' }} />
                  </span>
                </Fragment>
              )}
            </div>
          </div>

          <table styleName="blockCenter__table" className="table table-borderless">
            <tbody>
              <tr>
                <td styleName="header" colspan="2">
                  <FormattedMessage id="InfoPay_3" defaultMessage="Transaction ID" />
                </td>
              </tr>
              <tr>
                <td colspan="2">
                  
                </td>
              </tr>
              {isFetching ? (
                <>
                  <tr>
                    <td styleName="animate-fetching" colSpan="2"></td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td styleName="header">
                      <FormattedMessage id="InfoPay_4" defaultMessage="Est. time to confitmation" />
                    </td>
                    <td>
                      <strong>
                        <FormattedMessage id="InfoPay_Confirmed" defaultMessage="Confirmed" />
                      </strong>
                    </td>
                  </tr>
                  
                </>
              )}
            </tbody>
          </table>
        </div>
        <div styleName="blockCenter buttonHolder">
          <ShareButton
            halfWidth={true}
            minWidth="200px"
            link={`${getFullOrigin()}${shareLink}`}
            title={shareText} />
        </div>
      </Modal>
    )
  }
}