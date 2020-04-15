import React, { Component, Fragment } from 'react'
import { Modal } from 'components/modal'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import actions from 'redux/actions'

import helpers from 'helpers'
import { links, constants } from 'helpers'
import { getFullOrigin } from 'helpers/links'

import cssModules from 'react-css-modules'
import defaultStyles from '../Styles/default.scss'
import styles from './InfoInvoice.scss'
import animateFetching from 'components/loaders/ContentLoader/ElementLoading.scss'

import { ShareLink } from 'components/controls'
import ShareButton from 'components/controls/ShareButton/ShareButton'

import Button from 'components/controls/Button/Button'

import { isMobile } from "react-device-detect"



import WithdrawModal from 'components/modals/WithdrawModal/WithdrawModal'


const langPrefix = 'InvoiceInfoModal'
const langLabels = defineMessages({
  titleFetching: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Загрузка инвойса...`,
  },
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Инвойс #{number}`,
  },
  destination: {
    id: `${langPrefix}_DestinationAddress`,
    defaultMessage: `Адрес для оплаты {destination}`,
  },
  invoiceSender: {
    id: `${langPrefix}_Sender`,
    defaultMessage: `Отправитель (контакт)`,
  },
  invoiceComment: {
    id: `${langPrefix}_Comment`,
    defaultMessage: `Комментарий`,
  },
  fromAddress: {
    id: `${langPrefix}_FromAddress`,
    defaultMessage: `Адресс отправителя`,
  },
  toAddress: {
    id: `${langPrefix}_ToAddress`,
    defaultMessage: `Адресс плательщика`,
  },
  payInvoice: {
    id: `${langPrefix}_PayInvoiceButton`,
    defaultMessage: `Оплатить`,
  },
  declimeInvoice: {
    id: `${langPrefix}_DeclimeInvoiceButton`,
    defaultMessage: `Отклонить`,
  },
  shareText: {
    id: `${langPrefix}_ShareInvoiceText`,
    defaultMessage: `Инвойс #{id}-{invoiceNumber} от {contact} на {amount} {type}`,
  },
  shareReady: {
    id: `${langPrefix}_ButtonShareReady`,
    defaultMessage: `Готово`,
  },
})

@injectIntl
@cssModules({
  ...defaultStyles,
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
        uniqhash,
        doshare,
      }
    } = props

    this.state = {
      isFetching,
      invoice,
      uniqhash,
      isCancelled: false,
      isReady: false,
      isPending: true,
      doshare,
      isShareReady: !(doshare),
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

  handleShareReady = () => {
    const { history } = this.props
    const { uniqhash } = this.state

    this.setState({
      isShareReady: true,
    }, () => {
      history.push(`#${links.invoice}/${uniqhash}`)
    })
  }

  handlePayInvoice = () => {
  }

  handleDeclimeInvoice = () => {
    const {
      invoice: {
        invoiceData,
      },
    } = this.state

    console.log('declime invoice', invoiceData)
    this.setState({ isCancelled: true})
    return
    actions.modals.open(constants.modals.Confirm, {
      onAccept: async () => {
        await actions.invoices.cancelInvoice(invoiceData.id)
        this.setState({
          isCancelled: true,
        })
      },
    })
  }

  render() {
    const {
      intl,
    } = this.props

    const {
      uniqhash,
      isFetching,
      invoice,
      isCancelled,
      isReady,
      isPending,
      doshare,
      isShareReady,
    } = this.state

    const {
      invoiceData = false,
    } = (invoice || {})

    const modalProps = (!isFetching && invoiceData) ? {
      name: constants.modals.WithdrawModal,
      address: '',
      data: {
        currency: 'BTC',
        amount: invoiceData.amount,
        toAddress: invoiceData.destAddress,
        invoice: invoiceData,
      },
      portalUI: true,
    } : false
    

    const shareText = (isFetching && invoiceData) ? 'Fetching'
      : intl.formatMessage(langLabels.shareText, invoiceData)


    const shareLink = `${getFullOrigin()}${links.invoice}/${uniqhash}`


    const isPayerSide = (!isFetching && invoice && invoice.direction === 'in')
    const shareButtonEnabled = isMobile

    const isPayerControlEnabled = (isPayerSide && (!isCancelled || isReady))

    const payButton = (
      <Button
        blue
        onClick={this.handlePayInvoice}
      >
        <FormattedMessage { ...langLabels.payInvoice } />
      </Button>
    )

    const declimeButton = (
      <Button
        gray
        onClick={this.handleDeclimeInvoice}
      >
        <FormattedMessage { ...langLabels.declimeInvoice } />
      </Button>
    )

    const shareButton = (
      <ShareButton
        fullWidth={true}
        link={`${shareLink}`}
        title={shareText} />
    )

    const buttonsHolderStyles = [`invoiceControlsHolder`, `button-overlay`]
    if (shareButtonEnabled) buttonsHolderStyles.push(`with-share-button`)
    if (!isPayerControlEnabled) buttonsHolderStyles.push(`without-pay-control`)

    const modalTitle = (isFetching) ?
      intl.formatMessage(langLabels.titleFetching) :
      intl.formatMessage(langLabels.title, {
        number: `${invoiceData.id}-${invoiceData.invoiceNumber}`,
      })

    return (
      <Modal name={name} title={modalTitle} onClose={this.handleClose} showCloseButton={true}>
        {doshare && !isShareReady && (
          <Fragment>
            <div styleName="convent-overlay">
              <ShareLink 
                link={shareLink}
                fullSize={true}
              />
            </div>
            <div styleName="button-overlay share-ready-holder">
              <Button
                blue
                onClick={this.handleShareReady}
              >
                <FormattedMessage { ...langLabels.shareReady } />
              </Button>
            </div>
          </Fragment>
        )}
        {isShareReady && (
          <Fragment>
            <div styleName="blockCenter convent-overlay">
              <div className="p-3"  styleName={isFetching ? `animate-fetching` : ``}>
                <div styleName="shortInfoHolder">
                  {!isFetching && invoiceData && (
                    <Fragment>
                      <div>
                        <strong>
                          <FormattedMessage { ...langLabels.title } values={{number: `${invoiceData.id}-${invoiceData.invoiceNumber}`}} />
                        </strong>
                      </div>
                      <div>
                        <span>
                          <strong>{invoiceData.amount} {invoiceData.type}</strong>
                        </span>
                      </div>
                      <div>
                        <span>
                          <FormattedMessage { ... langLabels.destination } values={{
                            destination: invoiceData.destAddress,
                          }} />
                        </span>
                      </div>
                    </Fragment>
                  )}
                </div>
              </div>

              <table styleName="blockCenter__table" className="table table-borderless">
                <tbody>
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
                          <FormattedMessage { ...langLabels.invoiceSender} />
                        </td>
                        <td styleName="align-right">
                          {invoiceData.contact}
                        </td>
                      </tr>
                      <tr>
                        <td styleName="header" colSpan="2">
                          <FormattedMessage { ...langLabels.fromAddress } />
                        </td>
                      </tr>
                      <tr>
                        <td styleName="align-right" colSpan="2">
                          <span>{invoiceData.fromAddress} ({invoiceData.invoiceNumber})</span>
                        </td>
                      </tr>
                      {invoiceData.toAddress && (
                        <>
                          <tr>
                            <td styleName="header" colSpan="2">
                              <FormattedMessage { ...langLabels.toAddress } />
                            </td>
                          </tr>
                          <tr>
                            <td styleName="align-right" colSpan="2">
                              <span>{invoiceData.toAddress}</span>
                            </td>
                          </tr>
                        </>
                      )}
                      {invoiceData.label && (
                        <>
                          <tr>
                            <td styleName="header" colSpan="2">
                              <FormattedMessage { ...langLabels.invoiceComment} />
                            </td>
                          </tr>
                          <tr>
                            <td styleName="invoiceComment" colSpan="2">
                              <span>{invoiceData.label}</span>
                            </td>
                          </tr>
                        </>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            {!isFetching && false && invoiceData && (
              <WithdrawModal { ...modalProps } />
            )}
            <div styleName={buttonsHolderStyles.join(` `)}>
              {(isPayerControlEnabled) && (
                <Fragment>
                  <div styleName="payControl">
                    {payButton}
                  </div>
                  <div styleName="payControl">
                    {declimeButton}
                  </div>
                </Fragment>
              )}
              {shareButtonEnabled && (
                <div styleName="shareButton">
                  {shareButton}
                </div>
              )}
            </div>
          </Fragment>
        )}
      </Modal>
    )
  }
}